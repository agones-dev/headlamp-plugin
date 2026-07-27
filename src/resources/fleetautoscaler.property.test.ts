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
import { FleetAutoscaler } from './fleetautoscaler';

/**
 * Arbitrary that generates random Agones FleetAutoscaler JSON blobs.
 * Covers present/absent status fields and various policy types.
 */
function fcFleetAutoscalerJson(): fc.Arbitrary<any> {
  return fc.record({
    apiVersion: fc.constant('autoscaling.agones.dev/v1'),
    kind: fc.constant('FleetAutoscaler'),
    metadata: fc.record({
      name: fc.string({ minLength: 1, maxLength: 30 }),
      namespace: fc.string({ minLength: 1, maxLength: 30 }),
      uid: fc.uuid(),
    }),
    spec: fc.record({
      fleetName: fc.string({ minLength: 1, maxLength: 30 }),
      policy: fc.record({
        type: fc.constantFrom('Buffer', 'Webhook', 'Counter', 'List', 'Schedule', 'Chain'),
        buffer: fc.option(
          fc.record({
            bufferSize: fc.oneof(fc.nat({ max: 50 }), fc.constant('50%')),
            minReplicas: fc.nat({ max: 100 }),
            maxReplicas: fc.nat({ max: 100 }),
          }),
          { nil: undefined }
        ),
      }),
      sync: fc.option(
        fc.record({
          type: fc.constant('FixedInterval'),
          fixedInterval: fc.option(fc.record({ seconds: fc.nat({ max: 300 }) }), {
            nil: undefined,
          }),
        }),
        { nil: undefined }
      ),
    }),
    status: fc.option(
      fc.record({
        currentReplicas: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
        desiredReplicas: fc.option(fc.nat({ max: 100 }), { nil: undefined }),
        ableToScale: fc.option(fc.boolean(), { nil: undefined }),
        scalingLimited: fc.option(fc.boolean(), { nil: undefined }),
        lastScaleTime: fc.option(
          fc.date({ min: new Date('2000-01-01T00:00:00Z'), max: new Date('2099-12-31T23:59:59Z') }).map(d => d.toISOString()),
          { nil: undefined }
        ),
        lastAppliedPolicy: fc.option(fc.string({ maxLength: 30 }), { nil: undefined }),
      }),
      { nil: undefined }
    ),
  });
}

describe('FleetAutoscaler getters — property tests', () => {
  it('currentReplicas and desiredReplicas should always return numbers', () => {
    fc.assert(
      fc.property(fcFleetAutoscalerJson(), json => {
        const fas = new FleetAutoscaler(json);
        expect(typeof fas.currentReplicas).toBe('number');
        expect(typeof fas.desiredReplicas).toBe('number');
      })
    );
  });

  it('ableToScale should always return a boolean', () => {
    fc.assert(
      fc.property(fcFleetAutoscalerJson(), json => {
        const fas = new FleetAutoscaler(json);
        expect(typeof fas.ableToScale).toBe('boolean');
      })
    );
  });

  it('scalingLimited should always return a boolean', () => {
    fc.assert(
      fc.property(fcFleetAutoscalerJson(), json => {
        const fas = new FleetAutoscaler(json);
        expect(typeof fas.scalingLimited).toBe('boolean');
      })
    );
  });
});
