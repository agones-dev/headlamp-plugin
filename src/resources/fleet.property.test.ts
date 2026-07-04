/*
 * Copyright Contributors to Agones a Series of LF Projects, LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { Fleet } from './fleet';

/**
 * Arbitrary that generates random Agones Fleet JSON blobs.
 * Covers present/absent status fields and different strategy configurations.
 */
function fcFleetJson(): fc.Arbitrary<any> {
  return fc.record({
    apiVersion: fc.constant('agones.dev/v1'),
    kind: fc.constant('Fleet'),
    metadata: fc.record({
      name: fc.string({ minLength: 1, maxLength: 30 }),
      namespace: fc.string({ minLength: 1, maxLength: 30 }),
      uid: fc.uuid(),
    }),
    spec: fc.record({
      replicas: fc.nat({ max: 100 }),
      scheduling: fc.oneof(fc.constantFrom('Packed', 'Distributed'), fc.constant('')),
      template: fc.constant({}),
      strategy: fc.option(
        fc.record({
          type: fc.oneof(fc.constantFrom('RollingUpdate', 'Recreate'), fc.constant('')),
          rollingUpdate: fc.option(
            fc.record({
              maxSurge: fc.oneof(fc.nat({ max: 10 }), fc.constant('25%')),
              maxUnavailable: fc.oneof(fc.nat({ max: 10 }), fc.constant('25%')),
            }),
            { nil: undefined }
          ),
        }),
        { nil: undefined }
      ),
    }),
    status: fc.option(
      fc.record({
        replicas: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
        readyReplicas: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
        reservedReplicas: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
        allocatedReplicas: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
      }),
      { nil: undefined }
    ),
  });
}

describe('Fleet getters — property tests', () => {
  it('numeric getters should always return typeof number', () => {
    fc.assert(
      fc.property(fcFleetJson(), json => {
        const fleet = new Fleet(json);
        expect(typeof fleet.desiredReplicas).toBe('number');
        expect(typeof fleet.currentReplicas).toBe('number');
        expect(typeof fleet.allocatedReplicas).toBe('number');
        expect(typeof fleet.readyReplicas).toBe('number');
        expect(typeof fleet.reservedReplicas).toBe('number');
      })
    );
  });

  it('scheduling should always default to "Packed" when falsy', () => {
    fc.assert(
      fc.property(fcFleetJson(), json => {
        const fleet = new Fleet(json);
        const result = fleet.scheduling;
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
        // When spec.scheduling is empty/falsy, it defaults to 'Packed'
        if (!json.spec.scheduling) {
          expect(result).toBe('Packed');
        }
      })
    );
  });

  it('strategy should always default to "RollingUpdate" when falsy', () => {
    fc.assert(
      fc.property(fcFleetJson(), json => {
        const fleet = new Fleet(json);
        const result = fleet.strategy;
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
        // When spec.strategy.type is empty/falsy/missing, it defaults to 'RollingUpdate'
        if (!json.spec.strategy?.type) {
          expect(result).toBe('RollingUpdate');
        }
      })
    );
  });
});
