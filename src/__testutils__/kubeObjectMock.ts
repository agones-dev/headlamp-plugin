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

/**
 * Test-only mock for `@kinvolk/headlamp-plugin/lib/k8s/cluster`.
 *
 * Headlamp plugins import `KubeObject` from a path that only resolves at
 * build time (it's externalized to `pluginLib.K8s.cluster`). This file
 * provides a minimal stand-in so Vitest can load resource model classes
 * that extend `KubeObject`.
 *
 * Only the subset of KubeObject used by our resource models is implemented:
 * - `constructor(json)` — stores the raw Kubernetes JSON
 * - `get metadata()` — delegates to `jsonData.metadata`
 * - `static useList()` — returns `[null]` (hook stub, not called in unit tests)
 */
export class KubeObject<T extends { metadata: any }> {
  jsonData: T;

  constructor(json: T) {
    this.jsonData = json;
  }

  get metadata() {
    return this.jsonData.metadata;
  }

  static useList() {
    return [null];
  }
}

export type KubeObjectInterface = {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    uid?: string;
    creationTimestamp: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    [key: string]: any;
  };
  [key: string]: any;
};
