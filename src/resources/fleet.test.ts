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
import { AgonesFleet, Fleet } from './fleet';

/**
 * Helper to create a Fleet instance from a partial JSON object.
 * Fills in minimal required fields so tests stay focused.
 */
function makeFleet(overrides: Partial<AgonesFleet> = {}): Fleet {
  const base: AgonesFleet = {
    apiVersion: 'agones.dev/v1',
    kind: 'Fleet',
    metadata: {
      name: 'test-fleet',
      namespace: 'default',
      uid: 'fleet-123',
      creationTimestamp: '2026-01-01T00:00:00Z',
      ...(overrides.metadata as any),
    },
    spec: {
      replicas: 5,
      scheduling: 'Packed',
      template: {},
      ...(overrides.spec as any),
    },
    status: overrides.status,
  };
  return new Fleet(base);
}

describe('Fleet', () => {
  // ── Static fields ────────────────────────────────────────────────────────

  it('has correct static apiVersion', () => {
    expect(Fleet.apiVersion).toBe('agones.dev/v1');
  });

  it('has correct static kind', () => {
    expect(Fleet.kind).toBe('Fleet');
  });

  it('has correct static apiName', () => {
    expect(Fleet.apiName).toBe('fleets');
  });

  it('is namespaced', () => {
    expect(Fleet.isNamespaced).toBe(true);
  });

  it('has correct detailsRoute', () => {
    expect(Fleet.detailsRoute).toBe('agones-fleet');
  });

  // ── scheduling getter ────────────────────────────────────────────────────

  it('returns scheduling from spec', () => {
    const f = makeFleet({ spec: { replicas: 3, scheduling: 'Distributed', template: {} } as any });
    expect(f.scheduling).toBe('Distributed');
  });

  it('defaults scheduling to Packed', () => {
    const f = makeFleet({ spec: { replicas: 3, scheduling: '', template: {} } as any });
    expect(f.scheduling).toBe('Packed');
  });

  // ── desiredReplicas getter ───────────────────────────────────────────────

  it('returns desired replicas from spec', () => {
    const f = makeFleet({ spec: { replicas: 10, scheduling: 'Packed', template: {} } as any });
    expect(f.desiredReplicas).toBe(10);
  });

  it('returns 0 when replicas is 0', () => {
    const f = makeFleet({ spec: { replicas: 0, scheduling: 'Packed', template: {} } as any });
    expect(f.desiredReplicas).toBe(0);
  });

  // ── currentReplicas getter ───────────────────────────────────────────────

  it('returns current replicas from status', () => {
    const f = makeFleet({ status: { replicas: 5 } });
    expect(f.currentReplicas).toBe(5);
  });

  it('returns 0 when status is undefined', () => {
    const f = makeFleet();
    expect(f.currentReplicas).toBe(0);
  });

  // ── allocatedReplicas getter ─────────────────────────────────────────────

  it('returns allocated replicas from status', () => {
    const f = makeFleet({ status: { allocatedReplicas: 3 } });
    expect(f.allocatedReplicas).toBe(3);
  });

  it('returns 0 when allocated replicas missing', () => {
    const f = makeFleet({ status: {} });
    expect(f.allocatedReplicas).toBe(0);
  });

  // ── readyReplicas getter ─────────────────────────────────────────────────

  it('returns ready replicas from status', () => {
    const f = makeFleet({ status: { readyReplicas: 4 } });
    expect(f.readyReplicas).toBe(4);
  });

  it('returns 0 when ready replicas missing', () => {
    const f = makeFleet({ status: {} });
    expect(f.readyReplicas).toBe(0);
  });

  // ── reservedReplicas getter ──────────────────────────────────────────────

  it('returns reserved replicas from status', () => {
    const f = makeFleet({ status: { reservedReplicas: 2 } });
    expect(f.reservedReplicas).toBe(2);
  });

  it('returns 0 when reserved replicas missing', () => {
    const f = makeFleet({ status: {} });
    expect(f.reservedReplicas).toBe(0);
  });

  // ── strategy getter ──────────────────────────────────────────────────────

  it('returns strategy type from spec', () => {
    const f = makeFleet({
      spec: {
        replicas: 5,
        scheduling: 'Packed',
        template: {},
        strategy: { type: 'Recreate' },
      } as any,
    });
    expect(f.strategy).toBe('Recreate');
  });

  it('defaults strategy to RollingUpdate', () => {
    const f = makeFleet();
    expect(f.strategy).toBe('RollingUpdate');
  });

  // ── maxSurge getter ──────────────────────────────────────────────────────

  it('returns maxSurge from rolling update config', () => {
    const f = makeFleet({
      spec: {
        replicas: 5,
        scheduling: 'Packed',
        template: {},
        strategy: { type: 'RollingUpdate', rollingUpdate: { maxSurge: '25%', maxUnavailable: 1 } },
      } as any,
    });
    expect(f.maxSurge).toBe('25%');
  });

  it('returns undefined when no strategy defined', () => {
    const f = makeFleet();
    expect(f.maxSurge).toBeUndefined();
  });

  // ── maxUnavailable getter ────────────────────────────────────────────────

  it('returns maxUnavailable from rolling update config', () => {
    const f = makeFleet({
      spec: {
        replicas: 5,
        scheduling: 'Packed',
        template: {},
        strategy: { type: 'RollingUpdate', rollingUpdate: { maxSurge: 1, maxUnavailable: 0 } },
      } as any,
    });
    expect(f.maxUnavailable).toBe(0);
  });

  // ── allocationOverflow getter ────────────────────────────────────────────

  it('returns allocationOverflow from spec', () => {
    const overflow = { labels: { 'agones.dev/safe-to-evict': 'true' } };
    const f = makeFleet({
      spec: {
        replicas: 5,
        scheduling: 'Packed',
        template: {},
        allocationOverflow: overflow,
      } as any,
    });
    expect(f.allocationOverflow).toEqual(overflow);
  });

  it('returns undefined when allocationOverflow not set', () => {
    const f = makeFleet();
    expect(f.allocationOverflow).toBeUndefined();
  });

  // ── priorities getter ────────────────────────────────────────────────────

  it('returns priorities from spec', () => {
    const priorities = [{ type: 'Counter' as const, key: 'rooms', order: 'Ascending' as const }];
    const f = makeFleet({
      spec: {
        replicas: 5,
        scheduling: 'Packed',
        template: {},
        priorities,
      } as any,
    });
    expect(f.priorities).toEqual(priorities);
  });

  it('returns empty array when priorities not set', () => {
    const f = makeFleet();
    expect(f.priorities).toEqual([]);
  });

  // ── counters getter ──────────────────────────────────────────────────────

  it('returns aggregate counters from status', () => {
    const f = makeFleet({
      status: { counters: { rooms: { count: 15, capacity: 100 } } },
    });
    expect(f.counters).toEqual({ rooms: { count: 15, capacity: 100 } });
  });

  it('returns empty object when counters missing', () => {
    const f = makeFleet({ status: {} });
    expect(f.counters).toEqual({});
  });

  // ── lists getter ─────────────────────────────────────────────────────────

  it('returns aggregate lists from status', () => {
    const f = makeFleet({
      status: { lists: { maps: { values: ['dust2', 'mirage'], capacity: 10 } } },
    });
    expect(f.lists).toEqual({ maps: { values: ['dust2', 'mirage'], capacity: 10 } });
  });

  it('returns empty object when lists missing', () => {
    const f = makeFleet({ status: {} });
    expect(f.lists).toEqual({});
  });
});
