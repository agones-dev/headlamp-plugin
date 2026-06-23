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
import { AgonesFleetAutoscaler, FleetAutoscaler } from './fleetautoscaler';

/**
 * Helper to create a FleetAutoscaler instance from a partial JSON object.
 * Fills in minimal required fields so tests stay focused.
 */
function makeFAS(overrides: Partial<AgonesFleetAutoscaler> = {}): FleetAutoscaler {
  const base: AgonesFleetAutoscaler = {
    apiVersion: 'autoscaling.agones.dev/v1',
    kind: 'FleetAutoscaler',
    metadata: {
      name: 'test-fas',
      namespace: 'default',
      uid: 'fas-123',
      creationTimestamp: '2026-01-01T00:00:00Z',
      ...(overrides.metadata as any),
    },
    spec: {
      fleetName: 'test-fleet',
      policy: {
        type: 'Buffer',
        buffer: { bufferSize: 2, minReplicas: 1, maxReplicas: 10 },
      },
      ...(overrides.spec as any),
    },
    status: overrides.status,
  };
  return new FleetAutoscaler(base);
}

describe('FleetAutoscaler', () => {
  // ── Static fields ────────────────────────────────────────────────────────

  it('has correct static apiVersion', () => {
    expect(FleetAutoscaler.apiVersion).toBe('autoscaling.agones.dev/v1');
  });

  it('has correct static kind', () => {
    expect(FleetAutoscaler.kind).toBe('FleetAutoscaler');
  });

  it('has correct static apiName', () => {
    expect(FleetAutoscaler.apiName).toBe('fleetautoscalers');
  });

  it('is namespaced', () => {
    expect(FleetAutoscaler.isNamespaced).toBe(true);
  });

  it('has correct detailsRoute', () => {
    expect(FleetAutoscaler.detailsRoute).toBe('agones-fleetautoscaler');
  });

  // ── fleetName getter ─────────────────────────────────────────────────────

  it('returns fleet name from spec', () => {
    const fas = makeFAS();
    expect(fas.fleetName).toBe('test-fleet');
  });

  // ── policyType getter ────────────────────────────────────────────────────

  it('returns policy type from spec', () => {
    const fas = makeFAS();
    expect(fas.policyType).toBe('Buffer');
  });

  it('returns Webhook policy type', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: { type: 'Webhook', webhook: { url: 'http://example.com' } },
      },
    });
    expect(fas.policyType).toBe('Webhook');
  });

  it('returns Counter policy type', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: {
          type: 'Counter',
          counter: { key: 'rooms', bufferSize: 5, minCapacity: 0, maxCapacity: 100 },
        },
      },
    });
    expect(fas.policyType).toBe('Counter');
  });

  it('returns List policy type', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: {
          type: 'List',
          list: { key: 'players', bufferSize: 5, minCapacity: 0, maxCapacity: 100 },
        },
      },
    });
    expect(fas.policyType).toBe('List');
  });

  // ── bufferSize getter ────────────────────────────────────────────────────

  it('returns buffer size as number', () => {
    const fas = makeFAS();
    expect(fas.bufferSize).toBe(2);
  });

  it('returns buffer size as percentage string', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: {
          type: 'Buffer',
          buffer: { bufferSize: '50%', minReplicas: 1, maxReplicas: 20 },
        },
      },
    });
    expect(fas.bufferSize).toBe('50%');
  });

  it('returns undefined when no buffer policy', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: { type: 'Webhook', webhook: { url: 'http://example.com' } },
      },
    });
    expect(fas.bufferSize).toBeUndefined();
  });

  // ── minReplicas getter ───────────────────────────────────────────────────

  it('returns min replicas from buffer policy', () => {
    const fas = makeFAS();
    expect(fas.minReplicas).toBe(1);
  });

  it('returns undefined when no buffer policy', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: { type: 'Webhook', webhook: { url: 'http://example.com' } },
      },
    });
    expect(fas.minReplicas).toBeUndefined();
  });

  // ── maxReplicas getter ───────────────────────────────────────────────────

  it('returns max replicas from buffer policy', () => {
    const fas = makeFAS();
    expect(fas.maxReplicas).toBe(10);
  });

  // ── currentReplicas getter ───────────────────────────────────────────────

  it('returns current replicas from status', () => {
    const fas = makeFAS({ status: { currentReplicas: 5 } });
    expect(fas.currentReplicas).toBe(5);
  });

  it('returns 0 when status is undefined', () => {
    const fas = makeFAS();
    expect(fas.currentReplicas).toBe(0);
  });

  // ── desiredReplicas getter ───────────────────────────────────────────────

  it('returns desired replicas from status', () => {
    const fas = makeFAS({ status: { desiredReplicas: 8 } });
    expect(fas.desiredReplicas).toBe(8);
  });

  it('returns 0 when desired replicas missing', () => {
    const fas = makeFAS({ status: {} });
    expect(fas.desiredReplicas).toBe(0);
  });

  // ── ableToScale getter ───────────────────────────────────────────────────

  it('returns ableToScale from status', () => {
    const fas = makeFAS({ status: { ableToScale: true } });
    expect(fas.ableToScale).toBe(true);
  });

  it('returns false when ableToScale missing', () => {
    const fas = makeFAS({ status: {} });
    expect(fas.ableToScale).toBe(false);
  });

  // ── scalingLimited getter ────────────────────────────────────────────────

  it('returns scalingLimited from status', () => {
    const fas = makeFAS({ status: { scalingLimited: true } });
    expect(fas.scalingLimited).toBe(true);
  });

  it('returns false when scalingLimited missing', () => {
    const fas = makeFAS({ status: {} });
    expect(fas.scalingLimited).toBe(false);
  });

  // ── lastScaleTime getter ─────────────────────────────────────────────────

  it('returns lastScaleTime from status', () => {
    const fas = makeFAS({ status: { lastScaleTime: '2026-06-20T10:00:00Z' } });
    expect(fas.lastScaleTime).toBe('2026-06-20T10:00:00Z');
  });

  it('returns undefined when lastScaleTime missing', () => {
    const fas = makeFAS({ status: {} });
    expect(fas.lastScaleTime).toBeUndefined();
  });

  // ── lastAppliedPolicy getter ─────────────────────────────────────────────

  it('returns lastAppliedPolicy from status', () => {
    const fas = makeFAS({ status: { lastAppliedPolicy: 'Buffer' } });
    expect(fas.lastAppliedPolicy).toBe('Buffer');
  });

  it('returns undefined when lastAppliedPolicy missing', () => {
    const fas = makeFAS({ status: {} });
    expect(fas.lastAppliedPolicy).toBeUndefined();
  });

  // ── syncInterval getter ──────────────────────────────────────────────────

  it('returns sync interval from spec', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: { type: 'Buffer', buffer: { bufferSize: 2, minReplicas: 1, maxReplicas: 10 } },
        sync: { type: 'FixedInterval', fixedInterval: { seconds: 30 } },
      },
    });
    expect(fas.syncInterval).toBe(30);
  });

  it('returns undefined when no sync config', () => {
    const fas = makeFAS();
    expect(fas.syncInterval).toBeUndefined();
  });

  // ── Interface shape tests ────────────────────────────────────────────────

  it('accepts a schedule policy with between block', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: {
          type: 'Schedule',
          schedule: {
            between: {
              start: '2026-06-20T00:00:00Z',
              end: '2026-06-21T00:00:00Z',
              minReplicas: 2,
              maxReplicas: 20,
            },
            policy: { type: 'Buffer', buffer: { bufferSize: 3, minReplicas: 2, maxReplicas: 20 } },
          },
        },
      },
    });
    expect(fas.policyType).toBe('Schedule');
  });

  it('accepts a schedule policy with activePeriod block', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: {
          type: 'Schedule',
          schedule: {
            activePeriod: {
              timezone: 'America/New_York',
              startCron: '0 18 * * 5',
              duration: '3h',
            },
            policy: { type: 'Buffer', buffer: { bufferSize: 5, minReplicas: 3, maxReplicas: 50 } },
          },
        },
      },
    });
    expect(fas.policyType).toBe('Schedule');
  });

  it('accepts a wasm policy', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: {
          type: 'Wasm',
          wasm: { url: 'https://example.com/autoscaler.wasm', requestsPerSecond: 10 },
        },
      },
    });
    expect(fas.policyType).toBe('Wasm');
  });

  it('accepts a chain policy', () => {
    const fas = makeFAS({
      spec: {
        fleetName: 'test-fleet',
        policy: {
          type: 'Chain',
          chain: [
            { id: 'weekday', type: 'Buffer' },
            { id: 'weekend', type: 'Buffer' },
          ],
        },
      },
    });
    expect(fas.policyType).toBe('Chain');
  });
});
