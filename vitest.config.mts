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

import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '@kinvolk/headlamp-plugin/config/vite.config.mjs';

/**
 * Extend the upstream Headlamp Vitest/Vite config with resolve aliases for
 * paths that are externalised at build time but need stubs during testing.
 *
 * `@kinvolk/headlamp-plugin/lib/k8s/cluster` is the primary case — it is
 * provided by the host app at runtime but does not physically exist in
 * `node_modules`. We redirect it to a minimal {@link src/__mocks__/kubeObject.ts}
 * so that resource-model tests can instantiate `KubeObject` subclasses.
 */
export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: {
        '@kinvolk/headlamp-plugin/lib/k8s/cluster': resolve(
          __dirname,
          'src/__mocks__/kubeObject.ts'
        ),
      },
    },
    test: {
      // Override setupFiles because the base config uses `import.meta.dirname`
      // which resolves to undefined when loaded from an external config file.
      setupFiles: resolve(
        __dirname,
        'node_modules/@kinvolk/headlamp-plugin/config/setupTests.js'
      ),
    },
  })
);
