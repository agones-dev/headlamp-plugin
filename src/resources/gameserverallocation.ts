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

import { KubeObject, KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';

interface AllocationCounterSelector {
  minAvailable?: number;
  maxAvailable?: number;
  minCount?: number;
  maxCount?: number;
}

interface AllocationListSelector {
  containsValue?: string;
  minAvailable?: number;
  maxAvailable?: number;
}

interface AllocationSelector {
  matchLabels?: Record<string, string>;
  matchExpressions?: Array<{ key: string; operator: string; values?: string[] }>;
  /** Filter by server state: 'Ready' (default) or 'Allocated' (for high-density). */
  gameServerState?: 'Ready' | 'Allocated';
  /** Filter candidates by counter availability/count. Key = counter name. */
  counters?: Record<string, AllocationCounterSelector>;
  /** Filter candidates by list availability or value membership. Key = list name. */
  lists?: Record<string, AllocationListSelector>;
}

export interface AllocationPriority {
  type: 'Counter' | 'List';
  key: string;
  /**
   * Ascending  = pick server with the lowest value first  (spread / least-loaded).
   * Descending = pick server with the highest value first (bin-pack / reuse).
   */
  order: 'Ascending' | 'Descending';
}

export interface AllocationCounterMutation {
  action: 'Increment' | 'Decrement';
  amount: number;
}

export interface AllocationListMutation {
  addValues?: string[];
  deleteValues?: string[];
}

export interface AgonesGameServerAllocation extends KubeObjectInterface {
  spec: {
    /** Packed (default) bins onto fewest nodes; Distributed spreads across nodes. */
    scheduling?: 'Packed' | 'Distributed';
    selectors?: AllocationSelector[];
    priorities?: AllocationPriority[];
    metadata?: {
      labels?: Record<string, string>;
      annotations?: Record<string, string>;
    };
    /** Atomic mutations applied to the allocated GameServer's counters/lists. */
    counters?: Record<string, AllocationCounterMutation>;
    lists?: Record<string, AllocationListMutation>;
  };
  status?: {
    state?: string;
    gameServerName?: string;
    address?: string;
    addresses?: Array<{ address: string; type: string }>;
    ports?: Array<{ name: string; port: number }>;
    nodeName?: string;
    counters?: Record<string, { count: number; capacity: number }>;
    lists?: Record<string, { values: string[]; capacity: number }>;
  };
}

export class GameServerAllocation extends KubeObject<AgonesGameServerAllocation> {
  static apiVersion = 'allocation.agones.dev/v1';
  static kind = 'GameServerAllocation';
  static apiName = 'gameserverallocations';
  static isNamespaced = true;

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status || {};
  }

  get allocationState(): string {
    return this.status.state ?? '';
  }

  get gameServerName(): string {
    return this.status.gameServerName ?? '';
  }

  get address(): string {
    return this.status.address ?? '';
  }

  get ports(): string {
    return (this.status.ports ?? []).map(p => `${p.name}:${p.port}`).join(', ');
  }
}
