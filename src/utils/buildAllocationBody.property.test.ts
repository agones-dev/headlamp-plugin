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
import { AllocationFormState, buildAllocationBody } from './buildAllocationBody';

/**
 * Arbitrary that generates random {@link AllocationFormState} objects.
 * Covers the full surface area of the form: namespaces, label selectors,
 * counter/list filters, counter/list mutations, and priorities.
 */
function fcAllocationFormState(): fc.Arbitrary<AllocationFormState> {
  return fc.record({
    namespace: fc.string({ minLength: 1, maxLength: 63 }),
    labelSelector: fc
      .array(fc.tuple(fc.string({ maxLength: 20 }), fc.string({ maxLength: 20 })), { maxLength: 5 })
      .map(pairs => pairs.map(([k, v]) => `${k}=${v}`).join(',')),
    gameServerState: fc.constantFrom('Ready' as const, 'Allocated' as const),
    scheduling: fc.constantFrom('Packed' as const, 'Distributed' as const),
    priorities: fc.array(
      fc.record({
        type: fc.constantFrom('Counter' as const, 'List' as const),
        key: fc.string({ maxLength: 20 }),
        order: fc.constantFrom('Ascending' as const, 'Descending' as const),
      }),
      { maxLength: 3 }
    ),
    counterFilters: fc.array(
      fc.record({
        key: fc.string({ maxLength: 20 }),
        minAvailable: fc.oneof(fc.constant(''), fc.nat({ max: 100 }).map(String)),
      }),
      { maxLength: 3 }
    ),
    listFilters: fc.array(
      fc.record({
        key: fc.string({ maxLength: 20 }),
        containsValue: fc.string({ maxLength: 20 }),
        minAvailable: fc.oneof(fc.constant(''), fc.nat({ max: 100 }).map(String)),
      }),
      { maxLength: 3 }
    ),
    counterMuts: fc.array(
      fc.record({
        key: fc.string({ maxLength: 20 }),
        action: fc.constantFrom('Increment' as const, 'Decrement' as const),
        amount: fc.oneof(fc.constant(''), fc.nat({ max: 100 }).map(String)),
      }),
      { maxLength: 3 }
    ),
    listMuts: fc.array(
      fc.record({
        key: fc.string({ maxLength: 20 }),
        addValues: fc.array(fc.string({ maxLength: 10 }), { maxLength: 5 }).map(v => v.join(',')),
      }),
      { maxLength: 3 }
    ),
  });
}

describe('buildAllocationBody — property tests', () => {
  it('should always produce apiVersion "allocation.agones.dev/v1"', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        expect(body.apiVersion).toBe('allocation.agones.dev/v1');
      })
    );
  });

  it('should always produce kind "GameServerAllocation"', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        expect(body.kind).toBe('GameServerAllocation');
      })
    );
  });

  it('should always set metadata.namespace to the form namespace', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const meta = body.metadata as Record<string, unknown>;
        expect(meta.namespace).toBe(form.namespace);
      })
    );
  });

  it('should always set metadata.generateName to "ui-allocation-"', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const meta = body.metadata as Record<string, unknown>;
        expect(meta.generateName).toBe('ui-allocation-');
      })
    );
  });

  it('should always have exactly one selector in spec.selectors', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const spec = body.spec as Record<string, unknown[]>;
        expect(spec.selectors).toHaveLength(1);
      })
    );
  });

  it('should always propagate scheduling from form to spec', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const spec = body.spec as Record<string, unknown>;
        expect(spec.scheduling).toBe(form.scheduling);
      })
    );
  });

  it('should always propagate gameServerState to the selector', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const spec = body.spec as Record<string, unknown[]>;
        const selector = spec.selectors[0] as Record<string, unknown>;
        expect(selector.gameServerState).toBe(form.gameServerState);
      })
    );
  });

  it('should never have leading/trailing whitespace in matchLabels keys or values', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const spec = body.spec as Record<string, unknown[]>;
        const selector = spec.selectors[0] as Record<string, Record<string, string>>;
        const labels = selector.matchLabels ?? {};
        for (const [key, val] of Object.entries(labels)) {
          expect(key).toBe(key.trim());
          expect(val).toBe(val.trim());
        }
      })
    );
  });

  it('should never include counter mutations with empty amount', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const spec = body.spec as Record<string, Record<string, { amount: number }>>;
        if (spec.counters) {
          for (const mut of Object.values(spec.counters)) {
            expect(mut.amount).toBeDefined();
            expect(typeof mut.amount).toBe('number');
          }
        }
      })
    );
  });

  it('should never include list mutations with empty addValues', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const spec = body.spec as Record<string, Record<string, { addValues: string[] }>>;
        if (spec.lists) {
          for (const [key, mut] of Object.entries(spec.lists)) {
            expect(key.trim()).not.toBe('');
            expect(Array.isArray(mut.addValues)).toBe(true);
            expect(mut.addValues.length).toBeGreaterThan(0);
            for (const v of mut.addValues) {
              expect(v.trim()).not.toBe('');
            }
          }
        }
      })
    );
  });

  it('should never include priorities with empty keys', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const spec = body.spec as Record<string, Array<{ key: string }>>;
        if (spec.priorities) {
          for (const p of spec.priorities) {
            expect(p.key.trim()).not.toBe('');
          }
        }
      })
    );
  });

  it('should never include counter/list filter keys that are empty after trimming', () => {
    fc.assert(
      fc.property(fcAllocationFormState(), form => {
        const body = buildAllocationBody(form);
        const spec = body.spec as Record<string, unknown[]>;
        const selector = spec.selectors[0] as Record<string, Record<string, unknown>>;
        if (selector.counters) {
          for (const key of Object.keys(selector.counters)) {
            expect(key.trim()).not.toBe('');
          }
        }
        if (selector.lists) {
          for (const key of Object.keys(selector.lists)) {
            expect(key.trim()).not.toBe('');
          }
        }
      })
    );
  });
});
