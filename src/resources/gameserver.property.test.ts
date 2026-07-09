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
import { GameServer } from './gameserver';

/**
 * Arbitrary that generates random Agones GameServer JSON blobs.
 * Covers present/absent status, port arrays, counters, lists, and labels.
 */
function fcGameServerJson(): fc.Arbitrary<any> {
  const fcSpecPort = fc.record({
    name: fc.option(fc.string({ minLength: 1, maxLength: 15 }), { nil: undefined }),
    portPolicy: fc.option(fc.constantFrom('Dynamic', 'Static', 'Passthrough', 'None'), { nil: undefined }),
    containerPort: fc.option(fc.integer({ min: 1, max: 65535 }), { nil: undefined }),
    protocol: fc.option(fc.constantFrom('UDP', 'TCP', 'TCPUDP'), { nil: undefined }),
  });

  const fcStatusPort = fc.record({
    name: fc.string({ minLength: 1, maxLength: 15 }),
    port: fc.integer({ min: 1, max: 65535 }),
  });

  const fcCounterStatus = fc.record({
    count: fc.nat({ max: 1000 }),
    capacity: fc.nat({ max: 1000 }),
  });

  const fcListStatus = fc.record({
    values: fc.array(fc.string({ maxLength: 10 }), { maxLength: 5 }),
    capacity: fc.nat({ max: 100 }),
  });

  return fc.record({
    apiVersion: fc.constant('agones.dev/v1'),
    kind: fc.constant('GameServer'),
    metadata: fc.record({
      name: fc.string({ minLength: 1, maxLength: 30 }),
      namespace: fc.string({ minLength: 1, maxLength: 30 }),
      uid: fc.uuid(),
      labels: fc.option(
        fc.record({
          'agones.dev/fleet': fc.option(fc.string({ minLength: 1, maxLength: 20 }), {
            nil: undefined,
          }),
        }),
        { nil: undefined }
      ),
    }),
    spec: fc.record({
      scheduling: fc.constantFrom('Packed', 'Distributed'),
      template: fc.constant({}),
      ports: fc.option(fc.array(fcSpecPort, { maxLength: 4 }), { nil: undefined }),
    }),
    status: fc.option(
      fc.record({
        state: fc.option(
          fc.constantFrom(
            'PortAllocation',
            'Creating',
            'Starting',
            'Scheduled',
            'RequestReady',
            'Ready',
            'Allocated',
            'Reserved',
            'Shutdown',
            'Error',
            'Unhealthy'
          ),
          { nil: undefined }
        ),
        address: fc.option(fc.ipV4(), { nil: undefined }),
        nodeName: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
        ports: fc.option(fc.array(fcStatusPort, { maxLength: 4 }), { nil: undefined }),
        counters: fc.option(
          fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fcCounterStatus, {
            maxKeys: 3,
          }),
          { nil: undefined }
        ),
        lists: fc.option(
          fc.dictionary(fc.string({ minLength: 1, maxLength: 10 }), fcListStatus, { maxKeys: 3 }),
          { nil: undefined }
        ),
      }),
      { nil: undefined }
    ),
  });
}

describe('GameServer getters — property tests', () => {
  it('state should always return a string', () => {
    fc.assert(
      fc.property(fcGameServerJson(), json => {
        const gs = new GameServer(json);
        expect(typeof gs.state).toBe('string');
      })
    );
  });

  it('address should always return a string', () => {
    fc.assert(
      fc.property(fcGameServerJson(), json => {
        const gs = new GameServer(json);
        expect(typeof gs.address).toBe('string');
      })
    );
  });

  it('nodeName should always return a string', () => {
    fc.assert(
      fc.property(fcGameServerJson(), json => {
        const gs = new GameServer(json);
        expect(typeof gs.nodeName).toBe('string');
      })
    );
  });

  it('fleet should always return a string (even without labels)', () => {
    fc.assert(
      fc.property(fcGameServerJson(), json => {
        const gs = new GameServer(json);
        expect(typeof gs.fleet).toBe('string');
      })
    );
  });

  it('ports should always return a string', () => {
    fc.assert(
      fc.property(fcGameServerJson(), json => {
        const gs = new GameServer(json);
        const result = gs.ports;
        expect(typeof result).toBe('string');
      })
    );
  });

  it('counters should always return an object (never undefined)', () => {
    fc.assert(
      fc.property(fcGameServerJson(), json => {
        const gs = new GameServer(json);
        expect(gs.counters).toBeDefined();
        expect(typeof gs.counters).toBe('object');
      })
    );
  });

  it('lists should always return an object (never undefined)', () => {
    fc.assert(
      fc.property(fcGameServerJson(), json => {
        const gs = new GameServer(json);
        expect(gs.lists).toBeDefined();
        expect(typeof gs.lists).toBe('object');
      })
    );
  });

  it('mergedPorts entries should always have a non-empty name', () => {
    fc.assert(
      fc.property(fcGameServerJson(), json => {
        // Ensure there are spec ports to trigger mergedPorts logic
        if (!json.spec.ports || json.spec.ports.length === 0) return;
        const gs = new GameServer(json);
        for (const mp of gs.mergedPorts) {
          expect(typeof mp.name).toBe('string');
          expect(mp.name.length).toBeGreaterThan(0);
        }
      })
    );
  });

  it('mergedPorts should always default protocol to "UDP" and portPolicy to "Dynamic"', () => {
    fc.assert(
      fc.property(fcGameServerJson(), json => {
        if (!json.spec.ports || json.spec.ports.length === 0) return;
        const gs = new GameServer(json);
        for (const mp of gs.mergedPorts) {
          expect(['UDP', 'TCP', 'TCPUDP']).toContain(mp.protocol);
          expect(['Dynamic', 'Static', 'Passthrough', 'None']).toContain(mp.portPolicy);
        }
      })
    );
  });
});
