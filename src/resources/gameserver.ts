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

export interface GameServerSpecPort {
  name?: string;
  portPolicy?: string;
  containerPort?: number;
  protocol?: string;
}

export interface GameServerStatusPort {
  name: string;
  port: number;
}

export interface CounterStatus {
  count: number;
  capacity: number;
}

export interface ListStatus {
  values: string[];
  capacity: number;
}

/**
 * Eviction configuration for a GameServer.
 *
 * @see {@link https://agones.dev/site/docs/advanced/controlling-disruption/ | Controlling Disruption}
 */
export interface Eviction {
  /** Safe strategy: 'Always' | 'OnUpgrade' | 'Never'. */
  safe: string;
}

/**
 * A routable address assigned to the GameServer (e.g. NodeInternalIP, NodeExternalIP).
 */
export interface NodeAddress {
  type: string;
  address: string;
}

export interface AgonesGameServer extends KubeObjectInterface {
  spec: {
    scheduling: string;
    template: object;
    ports?: GameServerSpecPort[];
    health?: {
      disabled?: boolean;
      initialDelaySeconds?: number;
      periodSeconds?: number;
      failureThreshold?: number;
    };
    sdkServer?: {
      logLevel?: string;
      grpcPort?: number;
      httpPort?: number;
    };
    counters?: Record<string, { capacity: number }>;
    lists?: Record<string, { capacity: number; values?: string[] }>;
    /** Eviction tolerance of the GameServer. */
    eviction?: Eviction;
  };
  status?: {
    state?: string;
    address?: string;
    ports?: GameServerStatusPort[];
    nodeName?: string;
    counters?: Record<string, CounterStatus>;
    lists?: Record<string, ListStatus>;
    /** All routable addresses (NodeInternalIP, NodeExternalIP, etc.). */
    addresses?: NodeAddress[];
    /** ISO 8601 timestamp: the GameServer is reserved until this time. */
    reservedUntil?: string;
  };
}

export class GameServer extends KubeObject<AgonesGameServer> {
  static apiVersion = 'agones.dev/v1';
  static kind = 'GameServer';
  static apiName = 'gameservers';
  static isNamespaced = true;

  static get detailsRoute() {
    return 'agones-gameserver';
  }

  get spec() {
    return this.jsonData.spec;
  }

  get status() {
    return this.jsonData.status || {};
  }

  get state(): string {
    return this.status.state ?? '';
  }

  get address(): string {
    return this.status.address ?? '';
  }

  get nodeName(): string {
    return this.status.nodeName ?? '';
  }

  get fleet(): string {
    return this.metadata.labels?.['agones.dev/fleet'] ?? '';
  }

  get ports(): string {
    const ports = this.status.ports ?? [];
    if (ports.length === 0) return '';
    return ports.map(p => `${p.name}:${p.port}`).join(', ');
  }

  get counters(): Record<string, CounterStatus> {
    return this.status.counters ?? {};
  }

  get lists(): Record<string, ListStatus> {
    return this.status.lists ?? {};
  }

  /**
   * Eviction safe mode for this GameServer.
   *
   * @see {@link https://agones.dev/site/docs/advanced/controlling-disruption/ | Controlling Disruption}
   */
  get eviction(): string {
    return this.spec.eviction?.safe ?? 'Never';
  }

  /** All routable addresses assigned to the GameServer. */
  get addresses(): NodeAddress[] {
    return this.status.addresses ?? [];
  }

  /**
   * ISO 8601 timestamp until which the GameServer is reserved.
   * Returns `undefined` if the server is not reserved.
   */
  get reservedUntil(): string | undefined {
    return this.status.reservedUntil;
  }

  /** Merged port info: spec metadata (policy, containerPort) + status (host port). */
  get mergedPorts(): Array<{
    name: string;
    hostPort: number | undefined;
    containerPort: number | undefined;
    protocol: string;
    portPolicy: string;
  }> {
    const specPorts = this.spec.ports ?? [];
    const statusPorts = this.status.ports ?? [];
    if (specPorts.length === 0 && statusPorts.length === 0) return [];

    return specPorts.map((sp, i) => {
      const st = statusPorts.find(p => p.name === sp.name) ?? statusPorts[i];
      return {
        name: sp.name ?? st?.name ?? `port-${i}`,
        hostPort: st?.port,
        containerPort: sp.containerPort,
        protocol: sp.protocol ?? 'UDP',
        portPolicy: sp.portPolicy ?? 'Dynamic',
      };
    });
  }
}
