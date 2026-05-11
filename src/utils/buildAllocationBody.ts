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

import {
  AllocationCounterMutation,
  AllocationListMutation,
  AllocationPriority,
} from '../resources/gameserverallocation';

interface CounterFilter { key: string; minAvailable: string }
interface ListFilter    { key: string; containsValue: string; minAvailable: string }
interface CounterMut    { key: string; action: 'Increment' | 'Decrement'; amount: string }
interface ListMut       { key: string; addValues: string }

export interface AllocationFormState {
  namespace:       string;
  labelSelector:   string;
  gameServerState: 'Ready' | 'Allocated';
  scheduling:      'Packed' | 'Distributed';
  priorities:      AllocationPriority[];
  counterFilters:  CounterFilter[];
  listFilters:     ListFilter[];
  counterMuts:     CounterMut[];
  listMuts:        ListMut[];
}

export function buildAllocationBody(form: AllocationFormState): Record<string, unknown> {
  const matchLabels: Record<string, string> = {};
  form.labelSelector.split(',').forEach(part => {
    const eq = part.indexOf('=');
    if (eq > 0) matchLabels[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  });

  const counterSel: Record<string, object> = {};
  form.counterFilters.filter(f => f.key.trim()).forEach(f => {
    counterSel[f.key.trim()] = {
      ...(f.minAvailable !== '' && { minAvailable: Number(f.minAvailable) }),
    };
  });

  const listSel: Record<string, object> = {};
  form.listFilters.filter(f => f.key.trim()).forEach(f => {
    listSel[f.key.trim()] = {
      ...(f.containsValue !== '' && { containsValue: f.containsValue }),
      ...(f.minAvailable  !== '' && { minAvailable: Number(f.minAvailable) }),
    };
  });

  const selector: Record<string, unknown> = {
    matchLabels,
    gameServerState: form.gameServerState,
    ...(Object.keys(counterSel).length > 0 && { counters: counterSel }),
    ...(Object.keys(listSel).length    > 0 && { lists:    listSel    }),
  };

  const counterMutations: Record<string, AllocationCounterMutation> = {};
  form.counterMuts.filter(m => m.key.trim() && m.amount !== '').forEach(m => {
    counterMutations[m.key.trim()] = { action: m.action, amount: Number(m.amount) };
  });

  const listMutations: Record<string, AllocationListMutation> = {};
  form.listMuts.filter(m => m.key.trim()).forEach(m => {
    const vals = m.addValues.split(',').map(v => v.trim()).filter(Boolean);
    if (vals.length > 0) listMutations[m.key.trim()] = { addValues: vals };
  });

  const validPriorities = form.priorities.filter(p => p.key.trim() !== '');

  return {
    apiVersion: 'allocation.agones.dev/v1',
    kind: 'GameServerAllocation',
    metadata: { namespace: form.namespace, generateName: 'ui-allocation-' },
    spec: {
      scheduling: form.scheduling,
      selectors: [selector],
      ...(validPriorities.length               > 0 && { priorities: validPriorities }),
      ...(Object.keys(counterMutations).length > 0 && { counters:   counterMutations }),
      ...(Object.keys(listMutations).length    > 0 && { lists:      listMutations    }),
    },
  };
}