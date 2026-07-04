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
import { GameServerAllocation } from './gameserverallocation';

/**
 * Arbitrary that generates random Agones GameServerAllocation JSON blobs.
 * Covers present/absent status fields, port arrays, and address info.
 */
function fcGameServerAllocationJson(): fc.Arbitrary<any> {
  return fc.record({
    apiVersion: fc.constant('allocation.agones.dev/v1'),
    kind: fc.constant('GameServerAllocation'),
    metadata: fc.record({
      name: fc.string({ minLength: 1, maxLength: 30 }),
      namespace: fc.string({ minLength: 1, maxLength: 30 }),
      uid: fc.uuid(),
    }),
    spec: fc.record({
      scheduling: fc.option(fc.constantFrom('Packed' as const, 'Distributed' as const), {
        nil: undefined,
      }),
    }),
    status: fc.option(
      fc.record({
        state: fc.option(fc.constantFrom('Allocated', 'UnAllocated', 'Contention'), {
          nil: undefined,
        }),
        gameServerName: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
        address: fc.option(fc.ipV4(), { nil: undefined }),
        ports: fc.option(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 15 }),
              port: fc.integer({ min: 1, max: 65535 }),
            }),
            { maxLength: 4 }
          ),
          { nil: undefined }
        ),
      }),
      { nil: undefined }
    ),
  });
}

describe('GameServerAllocation getters — property tests', () => {
  it('string getters should always return strings (never undefined)', () => {
    fc.assert(
      fc.property(fcGameServerAllocationJson(), json => {
        const gsa = new GameServerAllocation(json);
        expect(typeof gsa.allocationState).toBe('string');
        expect(typeof gsa.gameServerName).toBe('string');
        expect(typeof gsa.address).toBe('string');
      })
    );
  });

  it('ports should always return a string in "name:port" format or empty', () => {
    fc.assert(
      fc.property(fcGameServerAllocationJson(), json => {
        const gsa = new GameServerAllocation(json);
        const result = gsa.ports;
        expect(typeof result).toBe('string');

        // If there are ports in status, verify the format
        if (result.length > 0) {
          const parts = result.split(', ');
          for (const part of parts) {
            // Each part should be "name:port"
            expect(part).toMatch(/^.+:\d+$/);
          }
        }
      })
    );
  });
});
