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

import Chip from '@mui/material/Chip';
import React from 'react';

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const STATE_COLORS: Record<string, ChipColor> = {
  // In-progress lifecycle states
  PortAllocation: 'info',
  Creating: 'info',
  Starting: 'info',
  Scheduled: 'info',
  RequestReady: 'info',
  // Stable states
  Ready: 'success',
  Allocated: 'warning',
  Reserved: 'secondary',
  // Terminal / problem states
  Shutdown: 'default',
  Error: 'error',
  Unhealthy: 'error',
};

export function StateChip({ state }: { state: string }) {
  return <Chip label={state || '—'} color={STATE_COLORS[state] ?? 'default'} size="small" />;
}
