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

export interface AgonesFleet extends KubeObjectInterface {
  spec: {
    replicas: number;
    scheduling: string;
    strategy?: {
      type: string;
      rollingUpdate?: {
        maxSurge: string | number;
        maxUnavailable: string | number;
      };
    };
    template: object;
    /**
     * Labels/annotations to apply to GameServers when allocation count exceeds
     * the desired replicas.
     *
     * @see {@link https://agones.dev/site/docs/reference/fleet/#allocation-overflow | Allocation Overflow}
     */
    allocationOverflow?: {
      labels?: Record<string, string>;
      annotations?: Record<string, string>;
    };
    /**
     * Scheduling priorities used to sort GameServers during allocation.
     *
     * @see {@link https://agones.dev/site/docs/advanced/scheduling-and-autoscaling/#fleet-scheduling | Fleet Scheduling}
     */
    priorities?: Array<{
      type: 'Counter' | 'List';
      key: string;
      order: 'Ascending' | 'Descending';
    }>;
  };
  status?: {
    replicas?: number;
    readyReplicas?: number;
    reservedReplicas?: number;
    allocatedReplicas?: number;
    /** Aggregate counter status across all GameServers in the Fleet. */
    counters?: Record<string, { count: number; capacity: number }>;
    /** Aggregate list status across all GameServers in the Fleet. */
    lists?: Record<string, { values: string[]; capacity: number }>;
  };
}

export class Fleet extends KubeObject<AgonesFleet> {
  static apiVersion = 'agones.dev/v1';
  static kind = 'Fleet';
  static apiName = 'fleets';
  static isNamespaced = true;

  static get detailsRoute() {
    return 'agones-fleet';
  }

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status || {};
  }

  get scheduling(): string {
    return this.spec.scheduling || 'Packed';
  }

  get desiredReplicas(): number {
    return this.spec.replicas || 0;
  }

  get currentReplicas(): number {
    return this.status.replicas || 0;
  }

  get allocatedReplicas(): number {
    return this.status.allocatedReplicas || 0;
  }

  get readyReplicas(): number {
    return this.status.readyReplicas || 0;
  }

  get reservedReplicas(): number {
    return this.status.reservedReplicas || 0;
  }

  get strategy(): string {
    return this.spec.strategy?.type || 'RollingUpdate';
  }

  get maxSurge(): string | number | undefined {
    return this.spec.strategy?.rollingUpdate?.maxSurge;
  }

  get maxUnavailable(): string | number | undefined {
    return this.spec.strategy?.rollingUpdate?.maxUnavailable;
  }

  /**
   * Allocation overflow metadata applied when allocation count exceeds desired replicas.
   *
   * @see {@link https://agones.dev/site/docs/reference/fleet/#allocation-overflow | Allocation Overflow}
   */
  get allocationOverflow():
    | { labels?: Record<string, string>; annotations?: Record<string, string> }
    | undefined {
    return this.spec.allocationOverflow;
  }

  /** Scheduling priorities for GameServer allocation ordering. */
  get priorities(): Array<{ type: string; key: string; order: string }> {
    return this.spec.priorities ?? [];
  }

  /** Aggregate counter status across all GameServers in the Fleet. */
  get counters(): Record<string, { count: number; capacity: number }> {
    return this.status.counters ?? {};
  }

  /** Aggregate list status across all GameServers in the Fleet. */
  get lists(): Record<string, { values: string[]; capacity: number }> {
    return this.status.lists ?? {};
  }
}
