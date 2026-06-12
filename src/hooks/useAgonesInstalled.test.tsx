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

import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAgonesInstalled } from './useAgonesInstalled';

// Mock the isAgonesInstalled function
vi.mock('../isAgonesInstalled', () => ({
  isAgonesInstalled: vi.fn(),
}));

import { isAgonesInstalled } from '../isAgonesInstalled';

describe('useAgonesInstalled', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start in loading state', () => {
    vi.mocked(isAgonesInstalled).mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAgonesInstalled());

    expect(result.current.isAgonesInstalled).toBeNull();
    expect(result.current.isAgonesCheckLoading).toBe(true);
  });

  it('should return isAgonesInstalled=true when Agones is detected', async () => {
    vi.mocked(isAgonesInstalled).mockResolvedValue(true);
    const { result } = renderHook(() => useAgonesInstalled());

    await waitFor(() => {
      expect(result.current.isAgonesInstalled).toBe(true);
    });

    expect(result.current.isAgonesCheckLoading).toBe(false);
  });

  it('should return isAgonesInstalled=false when Agones is not detected', async () => {
    vi.mocked(isAgonesInstalled).mockResolvedValue(false);
    const { result } = renderHook(() => useAgonesInstalled());

    await waitFor(() => {
      expect(result.current.isAgonesInstalled).toBe(false);
    });

    expect(result.current.isAgonesCheckLoading).toBe(false);
  });
});
