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
import Typography from '@mui/material/Typography';
import React from 'react';

interface UtilBarProps {
  value: number;
  max: number;
  showLabel?: 'fraction' | 'percent' | false;
}

export function UtilBar({ value, max, showLabel = 'fraction' }: UtilBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = pct >= 90 ? '#f44336' : pct >= 70 ? '#ff9800' : '#4caf50';
  const label =
    showLabel === 'fraction' ? `${value} / ${max}` :
    showLabel === 'percent'  ? `${Math.round(pct)}%` :
    null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flex: 1, height: 6, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: color, borderRadius: 1 }} />
      </Box>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 52, textAlign: 'right' }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}