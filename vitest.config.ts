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

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest configuration for the Agones Headlamp plugin.
 *
 * Headlamp plugins import KubeObject from `@kinvolk/headlamp-plugin/lib/k8s/cluster`,
 * a virtual path that is externalized to `pluginLib.K8s.cluster` at build time.
 * It doesn't physically exist on disk.
 *
 * Vite's import-analysis plugin validates file existence during source
 * transformation, which fails before Vitest's vi.mock() can intercept.
 * The resolve alias below redirects that path to a lightweight mock in
 * `src/__testutils__/kubeObjectMock.ts` that provides just enough of the
 * KubeObject API for resource model unit tests.
 *
 * NOTE: The real `KubeObject` class in headlamp imports React, lodash,
 * jsonpath-plus, and headlamp's entire API layer — it cannot be loaded
 * standalone in a test environment without the full headlamp runtime.
 */
export default defineConfig({
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@kinvolk/headlamp-plugin/lib/k8s/cluster': resolve(
        __dirname,
        'src/__testutils__/kubeObjectMock.ts'
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
