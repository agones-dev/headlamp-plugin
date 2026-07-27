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

import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import { useEffect, useState } from 'react';

/**
 * Checks whether the Agones CRDs are installed on the current cluster by
 * querying the {@link https://agones.dev/site/docs/reference/agones_crd_api_reference/ | Agones API group}
 * at `/apis/agones.dev/v1`.
 *
 * The response is validated to be a genuine Kubernetes `APIResourceList`
 * (not a `Status` error object that some proxies return for 404s).
 *
 * @returns `true` if Agones CRDs are present, `false` otherwise.
 */
export async function isAgonesInstalled(): Promise<boolean> {
  try {
    const response = await ApiProxy.request('/apis/agones.dev/v1', {
      method: 'GET',
    });
    // Verify the response is a real K8s API resource list, not an error object.
    return response?.kind === 'APIResourceList' && Array.isArray(response?.resources);
  } catch {
    return false;
  }
}

/**
 * React hook that asynchronously checks whether the Agones CRDs are installed
 * on the current Kubernetes cluster.
 *
 * @returns An object with:
 *  - `isAgonesInstalled` — `null` while loading, `true` if detected, `false` if not.
 *  - `isAgonesCheckLoading` — `true` while the API check is in progress.
 *
 * @example
 * ```tsx
 * const { isAgonesInstalled, isAgonesCheckLoading } = useAgonesInstalled();
 * if (isAgonesCheckLoading) return <Spinner />;
 * if (!isAgonesInstalled) return <NotInstalledBanner />;
 * ```
 */
export function useAgonesInstalled() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkInstalled() {
      const installed = await isAgonesInstalled();
      setIsInstalled(!!installed);
    }
    checkInstalled();
  }, []);

  return {
    isAgonesInstalled: isInstalled,
    isAgonesCheckLoading: isInstalled === null,
  };
}
