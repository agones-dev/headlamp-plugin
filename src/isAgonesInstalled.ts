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

export async function isAgonesInstalled(): Promise<boolean> {
  try {
    console.log('[Agones] Checking if Agones is installed...');
    const response = await ApiProxy.request('/apis/agones.dev/v1', {
      method: 'GET',
    });
    console.log('[Agones] API response:', JSON.stringify(response));
    // Verify the response is a real K8s API resource list, not an error object.
    const result = response?.kind === 'APIResourceList' && Array.isArray(response?.resources);
    console.log('[Agones] Detection result:', result);
    return result;
  } catch (error) {
    console.log('[Agones] API error (not installed):', error);
    return false;
  }
}
