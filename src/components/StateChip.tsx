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

/**
 * Maps each Agones GameServer lifecycle state to a MUI {@link Chip} color.
 *
 * - **info** — In-progress states while the GameServer is being prepared.
 * - **success** — The GameServer is ready to accept connections.
 * - **warning** — The GameServer has been allocated to a game session.
 * - **secondary** — The GameServer is reserved for future allocation.
 * - **error** — The GameServer has encountered an error or is unhealthy.
 * - **default** — The GameServer has been shut down.
 *
 * States not present in this map fall back to `'default'`.
 *
 * @see {@link https://agones.dev/site/docs/reference/gameserver/#gameserver-state-diagram | Agones GameServer State Diagram}
 */
const STATE_COLORS: Record<string, ChipColor> = {
  /** Port is being allocated to the GameServer. */
  PortAllocation: 'info',
  /** GameServer pod is being created. */
  Creating: 'info',
  /** GameServer process is starting inside the pod. */
  Starting: 'info',
  /** GameServer has been scheduled onto a node. */
  Scheduled: 'info',
  /** SDK has called {@link https://agones.dev/site/docs/guides/client-sdks/#ready | Ready()}, awaiting transition. */
  RequestReady: 'info',

  /** GameServer is ready to accept player connections. */
  Ready: 'success',
  /** GameServer has been allocated to a game session. */
  Allocated: 'warning',
  /** GameServer is reserved for future allocation via the SDK. */
  Reserved: 'secondary',

  /** GameServer has been shut down gracefully. */
  Shutdown: 'default',
  /** GameServer encountered an unrecoverable error. */
  Error: 'error',
  /** Health checks have failed for this GameServer. */
  Unhealthy: 'error',
};

export function StateChip({ state }: { state: string }) {
  const color: ChipColor = Object.prototype.hasOwnProperty.call(STATE_COLORS, state)
    ? STATE_COLORS[state]
    : 'default';
  return <Chip label={state || '—'} color={color} size="small" />;
}
