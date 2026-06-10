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

import { describe, expect,it } from 'vitest';
import { AllocationFormState,buildAllocationBody } from './buildAllocationBody';

function makeFormState(overrides: Partial<AllocationFormState> = {}): AllocationFormState {
  return {
    namespace: 'default',
    labelSelector: '',
    gameServerState: 'Ready',
    scheduling: 'Packed',
    priorities: [],
    counterFilters: [],
    listFilters: [],
    counterMuts: [],
    listMuts: [],
    ...overrides,
  };
}

describe('buildAllocationBody', () => {
  it('should produce a valid GameServerAllocation with minimal input', () => {
    const body = buildAllocationBody(makeFormState());

    expect(body).toEqual({
      apiVersion: 'allocation.agones.dev/v1',
      kind: 'GameServerAllocation',
      metadata: { namespace: 'default', generateName: 'ui-allocation-' },
      spec: {
        scheduling: 'Packed',
        selectors: [
          {
            matchLabels: {},
            gameServerState: 'Ready',
          },
        ],
      },
    });
  });

  it('should parse comma-separated label selectors into matchLabels', () => {
    const body = buildAllocationBody(
      makeFormState({
        labelSelector: 'app=game-server, tier=production',
      })
    );

    const selector = (body.spec as Record<string, unknown[]>).selectors[0] as Record<
      string,
      unknown
    >;
    expect(selector.matchLabels).toEqual({
      app: 'game-server',
      tier: 'production',
    });
  });

  it('should ignore malformed label entries without "="', () => {
    const body = buildAllocationBody(
      makeFormState({
        labelSelector: 'valid=yes, invalid-no-equals, also=good',
      })
    );

    const selector = (body.spec as Record<string, unknown[]>).selectors[0] as Record<
      string,
      unknown
    >;
    expect(selector.matchLabels).toEqual({
      valid: 'yes',
      also: 'good',
    });
  });

  it('should set gameServerState to Allocated when specified', () => {
    const body = buildAllocationBody(
      makeFormState({
        gameServerState: 'Allocated',
        scheduling: 'Distributed',
      })
    );

    const selector = (body.spec as Record<string, unknown[]>).selectors[0] as Record<
      string,
      unknown
    >;
    expect(selector.gameServerState).toBe('Allocated');
    expect((body.spec as Record<string, unknown>).scheduling).toBe('Distributed');
  });

  it('should include counter filters in selector when provided', () => {
    const body = buildAllocationBody(
      makeFormState({
        counterFilters: [{ key: 'players', minAvailable: '5' }],
      })
    );

    const selector = (body.spec as Record<string, unknown[]>).selectors[0] as Record<
      string,
      unknown
    >;
    expect(selector.counters).toEqual({
      players: { minAvailable: 5 },
    });
  });

  it('should skip counter filters with empty keys', () => {
    const body = buildAllocationBody(
      makeFormState({
        counterFilters: [
          { key: '', minAvailable: '5' },
          { key: 'rooms', minAvailable: '2' },
        ],
      })
    );

    const selector = (body.spec as Record<string, unknown[]>).selectors[0] as Record<
      string,
      unknown
    >;
    expect(selector.counters).toEqual({
      rooms: { minAvailable: 2 },
    });
  });

  it('should include list filters with containsValue and minAvailable', () => {
    const body = buildAllocationBody(
      makeFormState({
        listFilters: [{ key: 'regions', containsValue: 'us-east', minAvailable: '1' }],
      })
    );

    const selector = (body.spec as Record<string, unknown[]>).selectors[0] as Record<
      string,
      unknown
    >;
    expect(selector.lists).toEqual({
      regions: { containsValue: 'us-east', minAvailable: 1 },
    });
  });

  it('should include counter mutations in spec', () => {
    const body = buildAllocationBody(
      makeFormState({
        counterMuts: [{ key: 'players', action: 'Increment', amount: '1' }],
      })
    );

    expect((body.spec as Record<string, unknown>).counters).toEqual({
      players: { action: 'Increment', amount: 1 },
    });
  });

  it('should include list mutations with parsed addValues', () => {
    const body = buildAllocationBody(
      makeFormState({
        listMuts: [{ key: 'teams', addValues: 'alpha, bravo, charlie' }],
      })
    );

    expect((body.spec as Record<string, unknown>).lists).toEqual({
      teams: { addValues: ['alpha', 'bravo', 'charlie'] },
    });
  });

  it('should skip list mutations when addValues is empty', () => {
    const body = buildAllocationBody(
      makeFormState({
        listMuts: [{ key: 'teams', addValues: '' }],
      })
    );

    expect((body.spec as Record<string, unknown>).lists).toBeUndefined();
  });

  it('should skip counter mutations with empty amount', () => {
    const body = buildAllocationBody(
      makeFormState({
        counterMuts: [{ key: 'players', action: 'Increment', amount: '' }],
      })
    );

    expect((body.spec as Record<string, unknown>).counters).toBeUndefined();
  });

  it('should include priorities when valid entries exist', () => {
    const body = buildAllocationBody(
      makeFormState({
        priorities: [
          { type: 'Counter', key: 'players', order: 'Ascending' },
          { type: 'List', key: 'regions', order: 'Descending' },
        ],
      })
    );

    expect((body.spec as Record<string, unknown>).priorities).toEqual([
      { type: 'Counter', key: 'players', order: 'Ascending' },
      { type: 'List', key: 'regions', order: 'Descending' },
    ]);
  });

  it('should exclude priorities with empty keys', () => {
    const body = buildAllocationBody(
      makeFormState({
        priorities: [
          { type: 'Counter', key: '', order: 'Ascending' },
          { type: 'Counter', key: 'players', order: 'Ascending' },
        ],
      })
    );

    expect((body.spec as Record<string, unknown>).priorities).toEqual([
      { type: 'Counter', key: 'players', order: 'Ascending' },
    ]);
  });

  it('should omit priorities, counters, and lists from spec when all are empty', () => {
    const body = buildAllocationBody(makeFormState());
    const spec = body.spec as Record<string, unknown>;

    expect(spec.priorities).toBeUndefined();
    expect(spec.counters).toBeUndefined();
    expect(spec.lists).toBeUndefined();
  });

  it('should handle a fully populated form correctly', () => {
    const body = buildAllocationBody(
      makeFormState({
        namespace: 'game-prod',
        labelSelector: 'mode=battle-royale',
        gameServerState: 'Ready',
        scheduling: 'Packed',
        counterFilters: [{ key: 'players', minAvailable: '10' }],
        listFilters: [{ key: 'maps', containsValue: 'dust2', minAvailable: '' }],
        counterMuts: [{ key: 'players', action: 'Increment', amount: '1' }],
        listMuts: [{ key: 'teams', addValues: 'red, blue' }],
        priorities: [{ type: 'Counter', key: 'players', order: 'Ascending' }],
      })
    );

    expect(body.metadata).toEqual({ namespace: 'game-prod', generateName: 'ui-allocation-' });

    const spec = body.spec as Record<string, unknown>;
    expect(spec.scheduling).toBe('Packed');
    expect(spec.priorities).toHaveLength(1);
    expect(spec.counters).toEqual({ players: { action: 'Increment', amount: 1 } });
    expect(spec.lists).toEqual({ teams: { addValues: ['red', 'blue'] } });

    const selector = (spec.selectors as Record<string, unknown>[])[0];
    expect(selector.matchLabels).toEqual({ mode: 'battle-royale' });
    expect(selector.counters).toEqual({ players: { minAvailable: 10 } });
    expect(selector.lists).toEqual({ maps: { containsValue: 'dust2' } });
  });
});
