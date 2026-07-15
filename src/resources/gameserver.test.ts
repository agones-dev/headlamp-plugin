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

import { describe, expect, it } from 'vitest';
import { AgonesGameServer, GameServer } from './gameserver';

/**
 * Helper to create a GameServer instance from a partial JSON object.
 * Fills in minimal required fields so tests stay focused.
 */
function makeGS(overrides: Partial<AgonesGameServer> = {}): GameServer {
  const base: AgonesGameServer = {
    apiVersion: 'agones.dev/v1',
    kind: 'GameServer',
    metadata: {
      name: 'test-gs',
      namespace: 'default',
      uid: 'abc-123',
      creationTimestamp: '2026-01-01T00:00:00Z',
      labels: {},
      ...(overrides.metadata as any),
    },
    spec: {
      scheduling: 'Packed',
      template: {},
      ...(overrides.spec as any),
    },
    status: overrides.status,
  };
  return new GameServer(base);
}

describe('GameServer', () => {
  // ── Static fields ────────────────────────────────────────────────────────

  it('has correct static apiVersion', () => {
    expect(GameServer.apiVersion).toBe('agones.dev/v1');
  });

  it('has correct static kind', () => {
    expect(GameServer.kind).toBe('GameServer');
  });

  it('has correct static apiName', () => {
    expect(GameServer.apiName).toBe('gameservers');
  });

  it('is namespaced', () => {
    expect(GameServer.isNamespaced).toBe(true);
  });

  it('has correct detailsRoute', () => {
    expect(GameServer.detailsRoute).toBe('agones-gameserver');
  });

  // ── state getter ─────────────────────────────────────────────────────────

  it('returns state from status', () => {
    const gs = makeGS({ status: { state: 'Ready' } });
    expect(gs.state).toBe('Ready');
  });

  it('returns empty string when status is undefined', () => {
    const gs = makeGS();
    expect(gs.state).toBe('');
  });

  it('returns empty string when state is undefined', () => {
    const gs = makeGS({ status: {} });
    expect(gs.state).toBe('');
  });

  // ── address getter ───────────────────────────────────────────────────────

  it('returns address from status', () => {
    const gs = makeGS({ status: { address: '192.168.1.1' } });
    expect(gs.address).toBe('192.168.1.1');
  });

  it('returns empty string when address is missing', () => {
    const gs = makeGS({ status: {} });
    expect(gs.address).toBe('');
  });

  // ── nodeName getter ──────────────────────────────────────────────────────

  it('returns nodeName from status', () => {
    const gs = makeGS({ status: { nodeName: 'node-1' } });
    expect(gs.nodeName).toBe('node-1');
  });

  it('returns empty string when nodeName is missing', () => {
    const gs = makeGS({ status: {} });
    expect(gs.nodeName).toBe('');
  });

  // ── fleet getter ─────────────────────────────────────────────────────────

  it('returns fleet name from labels', () => {
    const gs = makeGS({
      metadata: {
        name: 'test-gs',
        namespace: 'default',
        uid: 'abc-123',
        creationTimestamp: '2026-01-01T00:00:00Z',
        labels: { 'agones.dev/fleet': 'my-fleet' },
      } as any,
    });
    expect(gs.fleet).toBe('my-fleet');
  });

  it('returns empty string when fleet label is missing', () => {
    const gs = makeGS();
    expect(gs.fleet).toBe('');
  });

  // ── ports getter ─────────────────────────────────────────────────────────

  it('formats status ports as name:port pairs', () => {
    const gs = makeGS({
      status: {
        ports: [
          { name: 'game', port: 7777 },
          { name: 'query', port: 27015 },
        ],
      },
    });
    expect(gs.ports).toBe('game:7777, query:27015');
  });

  it('returns empty string when no ports', () => {
    const gs = makeGS({ status: {} });
    expect(gs.ports).toBe('');
  });

  // ── counters getter ──────────────────────────────────────────────────────

  it('returns counters from status', () => {
    const gs = makeGS({
      status: { counters: { rooms: { count: 3, capacity: 10 } } },
    });
    expect(gs.counters).toEqual({ rooms: { count: 3, capacity: 10 } });
  });

  it('returns empty object when counters missing', () => {
    const gs = makeGS({ status: {} });
    expect(gs.counters).toEqual({});
  });

  // ── lists getter ─────────────────────────────────────────────────────────

  it('returns lists from status', () => {
    const gs = makeGS({
      status: { lists: { players: { values: ['p1', 'p2'], capacity: 10 } } },
    });
    expect(gs.lists).toEqual({ players: { values: ['p1', 'p2'], capacity: 10 } });
  });

  it('returns empty object when lists missing', () => {
    const gs = makeGS({ status: {} });
    expect(gs.lists).toEqual({});
  });

  // ── eviction getter ──────────────────────────────────────────────────────

  it('returns eviction safe mode from spec', () => {
    const gs = makeGS({
      spec: { scheduling: 'Packed', template: {}, eviction: { safe: 'Never' } } as any,
    });
    expect(gs.eviction).toBe('Never');
  });

  it('defaults eviction to Never when not set', () => {
    const gs = makeGS();
    expect(gs.eviction).toBe('Never');
  });

  // ── addresses getter ─────────────────────────────────────────────────────

  it('returns addresses from status', () => {
    const gs = makeGS({
      status: {
        addresses: [
          { type: 'NodeExternalIP', address: '34.56.78.90' },
          { type: 'NodeInternalIP', address: '10.0.0.5' },
        ],
      },
    });
    expect(gs.addresses).toEqual([
      { type: 'NodeExternalIP', address: '34.56.78.90' },
      { type: 'NodeInternalIP', address: '10.0.0.5' },
    ]);
  });

  it('returns empty array when addresses missing', () => {
    const gs = makeGS({ status: {} });
    expect(gs.addresses).toEqual([]);
  });

  // ── reservedUntil getter ─────────────────────────────────────────────────

  it('returns reservedUntil from status', () => {
    const gs = makeGS({
      status: { reservedUntil: '2026-06-25T12:00:00Z' },
    });
    expect(gs.reservedUntil).toBe('2026-06-25T12:00:00Z');
  });

  it('returns undefined when reservedUntil is not set', () => {
    const gs = makeGS({ status: {} });
    expect(gs.reservedUntil).toBeUndefined();
  });

  // ── mergedPorts getter ───────────────────────────────────────────────────

  it('merges spec and status ports', () => {
    const gs = makeGS({
      spec: {
        scheduling: 'Packed',
        template: {},
        ports: [{ name: 'game', portPolicy: 'Dynamic', containerPort: 7777, protocol: 'UDP' }],
      } as any,
      status: {
        ports: [{ name: 'game', port: 7654 }],
      },
    });
    expect(gs.mergedPorts).toEqual([
      {
        name: 'game',
        hostPort: 7654,
        containerPort: 7777,
        protocol: 'UDP',
        portPolicy: 'Dynamic',
      },
    ]);
  });

  it('returns empty array when no ports defined', () => {
    const gs = makeGS({ status: {} });
    expect(gs.mergedPorts).toEqual([]);
  });

  it('handles spec ports without matching status ports', () => {
    const gs = makeGS({
      spec: {
        scheduling: 'Packed',
        template: {},
        ports: [{ name: 'game', portPolicy: 'Static', containerPort: 7777, protocol: 'TCP' }],
      } as any,
      status: { ports: [] },
    });
    expect(gs.mergedPorts).toEqual([
      {
        name: 'game',
        hostPort: undefined,
        containerPort: 7777,
        protocol: 'TCP',
        portPolicy: 'Static',
      },
    ]);
  });
});
