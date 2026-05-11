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
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { Fleet } from '../resources/fleet';

interface ReplicasControlProps {
  fleet: Fleet;
  /** Minimum allowed replicas (default 0) */
  min?: number;
  /** Maximum allowed replicas (default 1000) */
  max?: number;
}

export function ReplicasControl({ fleet, min = 0, max = 1000 }: ReplicasControlProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const current = fleet.desiredReplicas;

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue(String(current));
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  const handleConfirm = async () => {
    const next = parseInt(inputValue, 10);
    if (isNaN(next) || next < min || next > max) {
      setError(`Enter a number between ${min} and ${max}`);
      return;
    }
    setLoading(true);
    setOpen(false);
    try {
      await fleet.patch({ spec: { replicas: next } });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') handleClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 60 }}>
        <CircularProgress size={16} />
      </Box>
    );
  }

  return (
    <>
      <Tooltip title="Click to set replicas">
        <Typography
          variant="body2"
          onClick={handleOpen}
          sx={{
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-block',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
          }}
        >
          {current}
        </Typography>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Set replicas for {fleet.metadata.name}</DialogTitle>
        <DialogContent>
          <TextField

            fullWidth
            type="number"
            label="Desired replicas"
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            inputProps={{ min, max }}
            error={!!error}
            helperText={error || `Current: ${current}`}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}