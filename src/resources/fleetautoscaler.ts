/*
 * Copyright 2025 The Kubernetes Authors
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

export interface AgonesFleetAutoscaler extends KubeObjectInterface {
  spec: {
    fleetName: string;
    policy: {
      type: string;
      buffer?: {
        bufferSize: number | string;
        minReplicas: number;
        maxReplicas: number;
      };
      counter?: {
        key: string;
        bufferSize: number | string;
        minCapacity: number;
        maxCapacity: number;
      };
      list?: {
        key: string;
        bufferSize: number | string;
        minCapacity: number;
        maxCapacity: number;
      };
      webhook?: {
        url?: string;
        service?: {
          name: string;
          namespace: string;
          path?: string;
          port?: number;
        };
      };
      schedule?: {
        between?: { start: string; end: string };
        activePeriod?: { timezone: string; schedule: string };
        policy: {
          type: string;
          buffer?: { bufferSize: number | string; minReplicas: number; maxReplicas: number };
        };
      };
      chain?: Array<{ id: string; type: string; [key: string]: any }>;
    };
    sync?: {
      type: string;
      fixedInterval?: { seconds: number };
    };
  };
  status?: {
    currentReplicas?: number;
    desiredReplicas?: number;
    ableToScale?: boolean;
    scalingLimited?: boolean;
    lastScaleTime?: string;
    lastAppliedPolicy?: string;
  };
}

export class FleetAutoscaler extends KubeObject<AgonesFleetAutoscaler> {
  static apiVersion = 'autoscaling.agones.dev/v1';
  static kind = 'FleetAutoscaler';
  static apiName = 'fleetautoscalers';
  static isNamespaced = true;
  static get detailsRoute() { return 'agones-fleetautoscaler'; }

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status || {};
  }

  get fleetName(): string {
    return this.spec.fleetName;
  }

  get policyType(): string {
    return this.spec.policy.type;
  }

  get bufferSize(): number | string | undefined {
    return this.spec.policy.buffer?.bufferSize;
  }

  get minReplicas(): number | undefined {
    return this.spec.policy.buffer?.minReplicas;
  }

  get maxReplicas(): number | undefined {
    return this.spec.policy.buffer?.maxReplicas;
  }

  get currentReplicas(): number {
    return this.status.currentReplicas ?? 0;
  }

  get desiredReplicas(): number {
    return this.status.desiredReplicas ?? 0;
  }

  get ableToScale(): boolean {
    return this.status.ableToScale ?? false;
  }

  get scalingLimited(): boolean {
    return this.status.scalingLimited ?? false;
  }

  get lastScaleTime(): string | undefined {
    return this.status.lastScaleTime;
  }

  get lastAppliedPolicy(): string | undefined {
    return this.status.lastAppliedPolicy;
  }

  get syncInterval(): number | undefined {
    return this.spec.sync?.fixedInterval?.seconds;
  }
}
