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

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import React from 'react';

/**
 * Configuration for each state that should display a prominent banner
 * on the GameServer detail view.
 *
 * @see {@link https://agones.dev/site/docs/reference/gameserver/#gameserver-state-diagram | Agones GameServer State Diagram}
 */
const STATE_BANNERS: Record<
  string,
  { severity: 'warning' | 'error' | 'info' | 'success'; title: string; message: string }
> = {
  Allocated: {
    severity: 'warning',
    title: 'Allocated — Active Game Session',
    message:
      'This GameServer has been allocated to a game session. ' +
      'Players may be connected. Avoid deleting or modifying it while the session is active.',
  },
};

interface GameServerStatusBannerProps {
  state: string;
}

/**
 * Renders a prominent status banner at the top of the GameServer detail view
 * for states that need special attention (e.g., Allocated).
 *
 * Returns `null` for states that don't require a banner.
 *
 * @see {@link https://github.com/agones-dev/headlamp-plugin/issues/29 | Issue #29}
 */
export function GameServerStatusBanner({ state }: GameServerStatusBannerProps) {
  const config = Object.prototype.hasOwnProperty.call(STATE_BANNERS, state)
    ? STATE_BANNERS[state]
    : null;

  if (!config) {
    return null;
  }

  return (
    <Alert
      severity={config.severity}
      variant="standard"
      sx={{
        mb: 2,
        '& .MuiAlert-icon': {
          fontSize: '1.5rem',
        },
      }}
    >
      <AlertTitle sx={{ fontWeight: 600 }}>{config.title}</AlertTitle>
      {config.message}
    </Alert>
  );
}
