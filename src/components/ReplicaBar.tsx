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

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';

interface ReplicaBarProps {
  desired: number;
  ready: number;
  allocated: number;
  reserved?: number;
}

/**
 * Compact stacked bar showing the breakdown of fleet replicas.
 * Segments: green=ready, yellow=allocated, purple=reserved, grey=unavailable/creating.
 */
export function ReplicaBar({ desired, ready, allocated, reserved = 0 }: ReplicaBarProps) {
  const total = Math.max(desired, 1);
  const active = ready + allocated + reserved;
  const unavailable = Math.max(0, desired - active);

  const pct = (n: number) => `${Math.min(100, Math.round((n / total) * 100))}%`;

  const parts = [
    { value: ready, color: 'success.main', label: 'Ready' },
    { value: allocated, color: 'warning.main', label: 'Allocated' },
    { value: reserved, color: 'secondary.main', label: 'Reserved' },
    { value: unavailable, color: 'action.disabledBackground', label: 'Unavailable' },
  ].filter(p => p.value > 0);

  const tooltipLines = [
    `Ready: ${ready}`,
    `Allocated: ${allocated}`,
    ...(reserved > 0 ? [`Reserved: ${reserved}`] : []),
    ...(unavailable > 0 ? [`Unavailable/Creating: ${unavailable}`] : []),
    `Desired: ${desired}`,
  ].join(' · ');

  return (
    <Tooltip title={tooltipLines}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
        <Box
          sx={{
            flex: 1,
            height: 8,
            borderRadius: 1,
            display: 'flex',
            overflow: 'hidden',
            bgcolor: 'action.hover',
          }}
        >
          {parts.map((p, i) => (
            <Box key={i} sx={{ width: pct(p.value), bgcolor: p.color, height: '100%' }} />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {active}/{desired}
        </Typography>
      </Box>
    </Tooltip>
  );
}
