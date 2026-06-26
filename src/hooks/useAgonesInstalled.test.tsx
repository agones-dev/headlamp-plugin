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
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAgonesInstalled } from './useAgonesInstalled';

// Mock ApiProxy so the hook's internal isAgonesInstalled() call
// doesn't make real HTTP requests.
vi.mock('@kinvolk/headlamp-plugin/lib', () => ({
  ApiProxy: {
    request: vi.fn(),
  },
}));

describe('useAgonesInstalled', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start in loading state', () => {
    // Never-resolving promise keeps the hook in loading state
    vi.mocked(ApiProxy.request).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAgonesInstalled());

    expect(result.current.isAgonesInstalled).toBeNull();
    expect(result.current.isAgonesCheckLoading).toBe(true);
  });

  it('should return isAgonesInstalled=true when Agones is detected', async () => {
    vi.mocked(ApiProxy.request).mockResolvedValue({
      kind: 'APIResourceList',
      resources: [{ name: 'gameservers' }],
    });

    const { result } = renderHook(() => useAgonesInstalled());

    await waitFor(() => {
      expect(result.current.isAgonesInstalled).toBe(true);
    });

    expect(result.current.isAgonesCheckLoading).toBe(false);
  });

  it('should return isAgonesInstalled=false when Agones is not detected', async () => {
    vi.mocked(ApiProxy.request).mockRejectedValue(new Error('404 Not Found'));

    const { result } = renderHook(() => useAgonesInstalled());

    await waitFor(() => {
      expect(result.current.isAgonesInstalled).toBe(false);
    });

    expect(result.current.isAgonesCheckLoading).toBe(false);
  });
});
