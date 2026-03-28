/*
 * Copyright 2025 The Kubernetes Authors
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
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import React from 'react';

interface PreviewPanelProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

export function PreviewPanel({ title, children }: PreviewPanelProps) {
  return (
    <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
      <Box sx={{ mb: 1 }}>{title}</Box>
      <Divider sx={{ mb: 1 }} />
      {children}
    </Paper>
  );
}