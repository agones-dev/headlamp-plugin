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

import { describe, expect, it, vi } from 'vitest';

// Mock ApiProxy before importing the module under test
vi.mock('@kinvolk/headlamp-plugin/lib', () => ({
  ApiProxy: {
    request: vi.fn(),
  },
}));

import { ApiProxy } from '@kinvolk/headlamp-plugin/lib';
import { isAgonesInstalled } from './isAgonesInstalled';

describe('isAgonesInstalled', () => {
  it('should return true when the Agones API group responds with a valid APIResourceList', async () => {
    vi.mocked(ApiProxy.request).mockResolvedValue({
      kind: 'APIResourceList',
      resources: [{ name: 'gameservers' }],
    });

    const result = await isAgonesInstalled();

    expect(result).toBe(true);
    expect(ApiProxy.request).toHaveBeenCalledWith('/apis/agones.dev/v1', {
      method: 'GET',
    });
  });

  it('should return true when resources array is empty but valid', async () => {
    vi.mocked(ApiProxy.request).mockResolvedValue({
      kind: 'APIResourceList',
      resources: [],
    });

    const result = await isAgonesInstalled();

    expect(result).toBe(true);
  });

  it('should return false when the API call throws (Agones not installed)', async () => {
    vi.mocked(ApiProxy.request).mockRejectedValue(new Error('404 Not Found'));

    const result = await isAgonesInstalled();

    expect(result).toBe(false);
  });

  it('should return false on network errors', async () => {
    vi.mocked(ApiProxy.request).mockRejectedValue(new Error('Network Error'));

    const result = await isAgonesInstalled();

    expect(result).toBe(false);
  });

  it('should return false when the response is null', async () => {
    vi.mocked(ApiProxy.request).mockResolvedValue(null);

    const result = await isAgonesInstalled();

    expect(result).toBe(false);
  });

  it('should return false when the response is undefined', async () => {
    vi.mocked(ApiProxy.request).mockResolvedValue(undefined);

    const result = await isAgonesInstalled();

    expect(result).toBe(false);
  });

  it('should return false when response is a non-APIResourceList object (error object)', async () => {
    vi.mocked(ApiProxy.request).mockResolvedValue({
      kind: 'Status',
      status: 'Failure',
      message: 'the server could not find the requested resource',
    });

    const result = await isAgonesInstalled();

    expect(result).toBe(false);
  });

  it('should return false when response has no resources field', async () => {
    vi.mocked(ApiProxy.request).mockResolvedValue({
      kind: 'APIResourceList',
    });

    const result = await isAgonesInstalled();

    expect(result).toBe(false);
  });
});
