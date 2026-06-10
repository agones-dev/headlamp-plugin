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
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { AgonesGameServerAllocation, AllocationPriority } from '../resources/gameserverallocation';
import { buildAllocationBody } from '../utils/buildAllocationBody';
import { UtilBar } from './UtilBar';

interface AllocationResult {
  state: string;
  gameServerName?: string;
  address?: string;
  ports?: Array<{ name: string; port: number }>;
  nodeName?: string;
  counters?: Record<string, { count: number; capacity: number }>;
  lists?: Record<string, { values: string[]; capacity: number }>;
}

interface AllocationDialogProps {
  open: boolean;
  onClose: () => void;
  fleetName: string;
  namespace: string;
}

interface CounterFilter {
  key: string;
  minAvailable: string;
}
interface ListFilter {
  key: string;
  containsValue: string;
  minAvailable: string;
}
interface CounterMut {
  key: string;
  action: 'Increment' | 'Decrement';
  amount: string;
}
interface ListMut {
  key: string;
  addValues: string;
}

const rowSx = { display: 'flex', gap: 1, mb: 1, alignItems: 'center' };

const emptyPriority = (): AllocationPriority => ({ type: 'Counter', key: '', order: 'Descending' });
const emptyCounterF = (): CounterFilter => ({ key: '', minAvailable: '' });
const emptyListF = (): ListFilter => ({ key: '', containsValue: '', minAvailable: '' });
const emptyCounterMut = (): CounterMut => ({ key: '', action: 'Increment', amount: '1' });
const emptyListMut = (): ListMut => ({ key: '', addValues: '' });

function SectionLabel({ title, tooltip }: { title: string; tooltip: string }) {
  return (
    <Tooltip title={tooltip}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ cursor: 'default', borderBottom: '1px dashed', borderColor: 'text.disabled' }}
      >
        {title}
      </Typography>
    </Tooltip>
  );
}

function SectionHeader({
  title,
  tooltip,
  onAdd,
  addLabel,
  disabled,
}: {
  title: string;
  tooltip: string;
  onAdd: () => void;
  addLabel: string;
  disabled: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
      <SectionLabel title={title} tooltip={tooltip} />
      <Button size="small" onClick={onAdd} disabled={disabled}>
        {addLabel}
      </Button>
    </Box>
  );
}

export function AllocationDialog({ open, onClose, fleetName, namespace }: AllocationDialogProps) {
  const [labelSelector, setLabelSelector] = useState('');
  const [gameServerState, setGameServerState] = useState<'Ready' | 'Allocated'>('Ready');
  const [scheduling, setScheduling] = useState<'Packed' | 'Distributed'>('Packed');
  const [priorities, setPriorities] = useState<AllocationPriority[]>([]);
  const [counterFilters, setCounterFilters] = useState<CounterFilter[]>([]);
  const [listFilters, setListFilters] = useState<ListFilter[]>([]);
  const [counterMuts, setCounterMuts] = useState<CounterMut[]>([]);
  const [listMuts, setListMuts] = useState<ListMut[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AllocationResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setLabelSelector(`agones.dev/fleet=${fleetName}`);
      setGameServerState('Ready');
      setScheduling('Packed');
      setPriorities([]);
      setCounterFilters([]);
      setListFilters([]);
      setCounterMuts([]);
      setListMuts([]);
      setResult(null);
      setError('');
    }
  }, [open, fleetName]);

  const updater =
    <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) =>
    (i: number, patch: Partial<T>) =>
      setter(arr => arr.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));

  const remover =
    <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) =>
    (i: number) =>
      setter(arr => arr.filter((_, idx) => idx !== i));

  const updatePriority = updater(setPriorities);
  const updateCounterF = updater(setCounterFilters);
  const updateListF = updater(setListFilters);
  const updateCounterMut = updater(setCounterMuts);
  const updateListMut = updater(setListMuts);

  const handleAllocate = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    const body = buildAllocationBody({
      namespace,
      labelSelector,
      gameServerState,
      scheduling,
      priorities,
      counterFilters,
      listFilters,
      counterMuts,
      listMuts,
    });

    try {
      const response = (await ApiProxy.apply(
        body as Parameters<typeof ApiProxy.apply>[0]
      )) as AgonesGameServerAllocation;
      const st = response?.status;
      setResult({
        state: st?.state ?? 'Unknown',
        gameServerName: st?.gameServerName,
        address: st?.address,
        ports: st?.ports,
        nodeName: st?.nodeName,
        counters: st?.counters,
        lists: st?.lists,
      });
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const stateColor = (s: string): 'success' | 'warning' | 'error' | 'default' =>
    s === 'Allocated' ? 'success' : s === 'Contention' ? 'warning' : 'error';

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Allocate Game Server</DialogTitle>
      <DialogContent>
        {!result ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Creates a <code>GameServerAllocation</code> in namespace <strong>{namespace}</strong>{' '}
              targeting fleet <strong>{fleetName}</strong>.
            </Typography>

            {/* Label selector */}
            <TextField
              label="Label Selector"
              value={labelSelector}
              onChange={e => setLabelSelector(e.target.value)}
              helperText="key=value pairs, comma-separated"
              fullWidth
              size="small"
              disabled={loading}
            />

            {/* Scheduling + State */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" fullWidth disabled={loading}>
                <InputLabel>Scheduling</InputLabel>
                <Select
                  value={scheduling}
                  label="Scheduling"
                  onChange={e => setScheduling(e.target.value as 'Packed' | 'Distributed')}
                >
                  <MenuItem value="Packed">Packed — bin-pack onto fewest nodes</MenuItem>
                  <MenuItem value="Distributed">Distributed — spread across nodes</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth disabled={loading}>
                <InputLabel>GS State</InputLabel>
                <Select
                  value={gameServerState}
                  label="GS State"
                  onChange={e => setGameServerState(e.target.value as 'Ready' | 'Allocated')}
                >
                  <MenuItem value="Ready">Ready — standard</MenuItem>
                  <MenuItem value="Allocated">Allocated — high-density reuse</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider />

            {/* Counter filters */}
            <Box>
              <SectionHeader
                title="Counter filters (optional)"
                tooltip="Only consider GameServers where this counter has enough available capacity (capacity − count ≥ minAvailable)."
                onAdd={() => setCounterFilters(f => [...f, emptyCounterF()])}
                addLabel="+ Filter"
                disabled={loading}
              />
              {counterFilters.map((f, i) => (
                <Box key={i} sx={rowSx}>
                  <TextField
                    label="Counter key"
                    value={f.key}
                    size="small"
                    sx={{ flex: 1 }}
                    disabled={loading}
                    placeholder="e.g. rooms"
                    onChange={e => updateCounterF(i, { key: e.target.value })}
                  />
                  <TextField
                    label="Min available"
                    value={f.minAvailable}
                    size="small"
                    sx={{ width: 120 }}
                    disabled={loading}
                    type="number"
                    inputProps={{ min: 0 }}
                    onChange={e => updateCounterF(i, { minAvailable: e.target.value })}
                  />
                  <Button
                    size="small"
                    disabled={loading}
                    sx={{ minWidth: 0, px: 1 }}
                    onClick={() => remover(setCounterFilters)(i)}
                  >
                    ✕
                  </Button>
                </Box>
              ))}
              {counterFilters.length === 0 && (
                <Typography variant="caption" color="text.disabled">
                  No counter filters — any server matches.
                </Typography>
              )}
            </Box>

            {/* List filters */}
            <Box>
              <SectionHeader
                title="List filters (optional)"
                tooltip="Only consider GameServers where this list contains a specific value or has room for more entries."
                onAdd={() => setListFilters(f => [...f, emptyListF()])}
                addLabel="+ Filter"
                disabled={loading}
              />
              {listFilters.map((f, i) => (
                <Box key={i} sx={rowSx}>
                  <TextField
                    label="List key"
                    value={f.key}
                    size="small"
                    sx={{ flex: 1 }}
                    disabled={loading}
                    placeholder="e.g. players"
                    onChange={e => updateListF(i, { key: e.target.value })}
                  />
                  <TextField
                    label="Contains value"
                    value={f.containsValue}
                    size="small"
                    sx={{ flex: 1 }}
                    disabled={loading}
                    placeholder="e.g. alice"
                    onChange={e => updateListF(i, { containsValue: e.target.value })}
                  />
                  <TextField
                    label="Min available"
                    value={f.minAvailable}
                    size="small"
                    sx={{ width: 110 }}
                    disabled={loading}
                    type="number"
                    inputProps={{ min: 0 }}
                    onChange={e => updateListF(i, { minAvailable: e.target.value })}
                  />
                  <Button
                    size="small"
                    disabled={loading}
                    sx={{ minWidth: 0, px: 1 }}
                    onClick={() => remover(setListFilters)(i)}
                  >
                    ✕
                  </Button>
                </Box>
              ))}
              {listFilters.length === 0 && (
                <Typography variant="caption" color="text.disabled">
                  No list filters.
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Mutations */}
            <Box>
              <SectionHeader
                title="Mutations (applied atomically on allocation)"
                tooltip="Atomically modify the allocated GameServer's counters/lists as part of the allocation. Safe — no race conditions."
                onAdd={() => setCounterMuts(m => [...m, emptyCounterMut()])}
                addLabel="+ Counter"
                disabled={loading}
              />
              {counterMuts.map((m, i) => (
                <Box key={i} sx={rowSx}>
                  <TextField
                    label="Counter key"
                    value={m.key}
                    size="small"
                    sx={{ flex: 1 }}
                    disabled={loading}
                    placeholder="e.g. rooms"
                    onChange={e => updateCounterMut(i, { key: e.target.value })}
                  />
                  <FormControl size="small" sx={{ width: 140 }} disabled={loading}>
                    <InputLabel>Action</InputLabel>
                    <Select
                      value={m.action}
                      label="Action"
                      onChange={e =>
                        updateCounterMut(i, { action: e.target.value as 'Increment' | 'Decrement' })
                      }
                    >
                      <MenuItem value="Increment">Increment</MenuItem>
                      <MenuItem value="Decrement">Decrement</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Amount"
                    value={m.amount}
                    size="small"
                    sx={{ width: 80 }}
                    disabled={loading}
                    type="number"
                    inputProps={{ min: 1 }}
                    onChange={e => updateCounterMut(i, { amount: e.target.value })}
                  />
                  <Button
                    size="small"
                    disabled={loading}
                    sx={{ minWidth: 0, px: 1 }}
                    onClick={() => remover(setCounterMuts)(i)}
                  >
                    ✕
                  </Button>
                </Box>
              ))}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: counterMuts.length > 0 ? 1 : 0,
                }}
              >
                <Box />
                <Button
                  size="small"
                  onClick={() => setListMuts(m => [...m, emptyListMut()])}
                  disabled={loading}
                >
                  + List
                </Button>
              </Box>
              {listMuts.map((m, i) => (
                <Box key={i} sx={rowSx}>
                  <TextField
                    label="List key"
                    value={m.key}
                    size="small"
                    sx={{ flex: 1 }}
                    disabled={loading}
                    placeholder="e.g. players"
                    onChange={e => updateListMut(i, { key: e.target.value })}
                  />
                  <TextField
                    label="Add values (comma-sep)"
                    value={m.addValues}
                    size="small"
                    sx={{ flex: 2 }}
                    disabled={loading}
                    placeholder="e.g. alice, bob"
                    onChange={e => updateListMut(i, { addValues: e.target.value })}
                  />
                  <Button
                    size="small"
                    disabled={loading}
                    sx={{ minWidth: 0, px: 1 }}
                    onClick={() => remover(setListMuts)(i)}
                  >
                    ✕
                  </Button>
                </Box>
              ))}
              {counterMuts.length === 0 && listMuts.length === 0 && (
                <Typography variant="caption" color="text.disabled">
                  No mutations — GameServer state unchanged on allocation.
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Priorities */}
            <Box>
              <SectionHeader
                title="Priorities (optional)"
                tooltip="Sort candidates before picking. Descending = bin-pack (reuse fullest server). Ascending = spread (pick emptiest)."
                onAdd={() => setPriorities(p => [...p, emptyPriority()])}
                addLabel="+ Priority"
                disabled={loading}
              />
              {priorities.map((p, i) => (
                <Box key={i} sx={rowSx}>
                  <FormControl size="small" sx={{ width: 110 }} disabled={loading}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={p.type}
                      label="Type"
                      onChange={e =>
                        updatePriority(i, { type: e.target.value as 'Counter' | 'List' })
                      }
                    >
                      <MenuItem value="Counter">Counter</MenuItem>
                      <MenuItem value="List">List</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Key"
                    value={p.key}
                    size="small"
                    sx={{ flex: 1 }}
                    disabled={loading}
                    placeholder="e.g. rooms"
                    onChange={e => updatePriority(i, { key: e.target.value })}
                  />
                  <FormControl size="small" sx={{ width: 150 }} disabled={loading}>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={p.order}
                      label="Order"
                      onChange={e =>
                        updatePriority(i, { order: e.target.value as 'Ascending' | 'Descending' })
                      }
                    >
                      <MenuItem value="Descending">Descending — reuse</MenuItem>
                      <MenuItem value="Ascending">Ascending — spread</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    size="small"
                    disabled={loading}
                    sx={{ minWidth: 0, px: 1 }}
                    onClick={() => remover(setPriorities)(i)}
                  >
                    ✕
                  </Button>
                </Box>
              ))}
              {priorities.length === 0 && (
                <Typography variant="caption" color="text.disabled">
                  No priorities — any matching server is picked.
                </Typography>
              )}
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
          </Box>
        ) : (
          /* Result */
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="subtitle2">Result:</Typography>
              <Chip label={result.state} color={stateColor(result.state)} size="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />

            {result.state === 'Allocated' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography variant="body2">
                  <strong>Server:</strong> {result.gameServerName ?? '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {result.address ?? '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Ports:</strong>{' '}
                  {result.ports?.map(p => `${p.name}:${p.port}`).join(', ') ?? '—'}
                </Typography>
                <Typography variant="body2">
                  <strong>Node:</strong> {result.nodeName ?? '—'}
                </Typography>

                {result.counters && Object.keys(result.counters).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Counters after allocation
                    </Typography>
                    {Object.entries(result.counters).map(([key, c]) => (
                      <Box key={key} sx={{ mt: 0.5 }}>
                        <Typography variant="body2">
                          <strong>{key}:</strong> {c.count} / {c.capacity}
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            ({c.capacity - c.count} available)
                          </Typography>
                        </Typography>
                        <UtilBar value={c.count} max={c.capacity} />
                      </Box>
                    ))}
                  </Box>
                )}

                {result.lists && Object.keys(result.lists).length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Lists after allocation
                    </Typography>
                    {Object.entries(result.lists).map(([key, l]) => (
                      <Box key={key} sx={{ mt: 0.5 }}>
                        <Typography variant="body2">
                          <strong>{key}:</strong> {l.values.length} / {l.capacity}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.25 }}>
                          {l.values.map(v => (
                            <Chip key={v} label={v} size="small" />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {result.state === 'UnAllocated'
                  ? 'No game servers matched the selector or none are available.'
                  : 'Allocation contention — retry.'}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && (
          <Button
            onClick={handleAllocate}
            variant="contained"
            disabled={loading || !labelSelector.trim()}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? 'Allocating…' : 'Allocate'}
          </Button>
        )}
        {result?.state === 'Contention' && (
          <Button variant="contained" onClick={() => setResult(null)}>
            Retry
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
