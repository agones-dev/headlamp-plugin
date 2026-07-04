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
 * Minimal stand-in for `KubeObject` from `@kinvolk/headlamp-plugin/lib/k8s/cluster`.
 *
 * Headlamp externalises this import at build time (it is provided by the
 * host app at runtime), so the physical path does not exist inside
 * `node_modules`. During Vitest runs we redirect the import here via a
 * `resolve.alias` in `vitest.config.mts`.
 *
 * Only the constructor, `metadata`, and `jsonData` are needed for unit and
 * property tests — methods like `patch`, `delete`, and `useList` are stubs.
 */
export class KubeObject {
  jsonData: any;

  constructor(json: any) {
    this.jsonData = json;
  }

  get metadata() {
    return this.jsonData.metadata;
  }

  static useList() {
    return [null];
  }

  static apiVersion = '';
  static kind = '';
  static apiName = '';
  static isNamespaced = true;

  async patch(body: unknown) {
    if (body && typeof body === 'object') {
      this.jsonData = { ...this.jsonData, ...(body as Record<string, unknown>) };
    }
    return this.jsonData;
  }
}

// Re-export the interface (type-only) so that `import { KubeObjectInterface }` works.
export interface KubeObjectInterface {
  apiVersion: string;
  kind: string;
  metadata: {
    name: string;
    namespace?: string;
    uid?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
    ownerReferences?: Array<{ uid: string; kind: string; name: string }>;
    [key: string]: any;
  };
  [key: string]: any;
}
