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

import { Link, SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';
import { AutoscalerStatusChip } from '../../components/AutoscalerStatusChip';
import { ReplicaBar } from '../../components/ReplicaBar';
import { StateChip } from '../../components/StateChip';
import { Fleet } from '../../resources/fleet';
import { FleetAutoscaler } from '../../resources/fleetautoscaler';
import { GameServer } from '../../resources/gameserver';

const STATE_ORDER = [
  'Ready',
  'Allocated',
  'Reserved',
  'Creating',
  'Scheduled',
  'RequestReady',
  'Shutdown',
  'Unhealthy',
  'Error',
];

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Card variant="outlined" sx={{ minWidth: 110 }}>
      <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: color ?? 'text.primary' }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

const STATE_COLORS: Record<string, string> = {
  Ready: 'success.main',
  Allocated: 'warning.main',
  Unhealthy: 'error.main',
  Error: 'error.main',
};

export function AgonesOverview() {
  const [gameServers] = GameServer.useList();
  const [fleets] = Fleet.useList();
  const [autoscalers] = FleetAutoscaler.useList();

  const stateCounts = (gameServers ?? []).reduce<Record<string, number>>((acc, gs) => {
    const s = gs.state || 'Unknown';
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  const unhealthyServers = (gameServers ?? []).filter(
    gs => gs.state === 'Unhealthy' || gs.state === 'Error'
  );
  const limitedAutoscalers = (autoscalers ?? []).filter(a => a.scalingLimited);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        Agones Overview
      </Typography>

      {/* ── Alerts ─────────────────────────────────────────────────────────── */}
      {(unhealthyServers.length > 0 || limitedAutoscalers.length > 0) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {unhealthyServers.length > 0 && (
            <Alert severity="error">
              {unhealthyServers.length} game server
              {unhealthyServers.length > 1 ? 's are' : ' is'} in Unhealthy/Error state:{' '}
              {unhealthyServers
                .slice(0, 3)
                .map(gs => gs.metadata.name)
                .join(', ')}
              {unhealthyServers.length > 3 ? ` and ${unhealthyServers.length - 3} more` : ''}
            </Alert>
          )}
          {limitedAutoscalers.length > 0 && (
            <Alert severity="warning">
              {limitedAutoscalers.length} autoscaler
              {limitedAutoscalers.length > 1 ? 's are' : ' is'} scaling-limited (reached min/max
              bounds): {limitedAutoscalers.map(a => a.metadata.name).join(', ')}
            </Alert>
          )}
        </Box>
      )}

      {/* ── GameServer state breakdown ──────────────────────────────────────── */}
      <SectionBox title="Game Servers">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <StatCard label="Total" value={gameServers?.length ?? 0} />
          {STATE_ORDER.filter(s => stateCounts[s]).map(s => (
            <StatCard key={s} label={s} value={stateCounts[s]} color={STATE_COLORS[s]} />
          ))}
          {Object.keys(stateCounts)
            .filter(s => !STATE_ORDER.includes(s))
            .map(s => (
              <StatCard key={s} label={s} value={stateCounts[s]} />
            ))}
        </Box>
      </SectionBox>

      {/* ── Fleets summary ──────────────────────────────────────────────────── */}
      <SectionBox title="Fleets">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Namespace</TableCell>
              <TableCell>Scheduling</TableCell>
              <TableCell>Replica Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!fleets ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    Loading…
                  </Typography>
                </TableCell>
              </TableRow>
            ) : fleets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" color="text.secondary">
                    No fleets found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              fleets.map(fleet => (
                <TableRow key={fleet.metadata.uid}>
                  <TableCell>
                    <Link kubeObject={fleet}>{fleet.metadata.name}</Link>
                  </TableCell>
                  <TableCell>{fleet.metadata.namespace}</TableCell>
                  <TableCell>{fleet.scheduling}</TableCell>
                  <TableCell>
                    <ReplicaBar
                      desired={fleet.desiredReplicas}
                      ready={fleet.readyReplicas}
                      allocated={fleet.allocatedReplicas}
                      reserved={fleet.reservedReplicas}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SectionBox>

      {/* ── Autoscalers summary ─────────────────────────────────────────────── */}
      <SectionBox title="Fleet Autoscalers">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Namespace</TableCell>
              <TableCell>Fleet</TableCell>
              <TableCell>Policy</TableCell>
              <TableCell>Current / Desired</TableCell>
              <TableCell>Last Scale</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!autoscalers ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary">
                    Loading…
                  </Typography>
                </TableCell>
              </TableRow>
            ) : autoscalers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary">
                    No autoscalers found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              autoscalers.map(a => (
                <TableRow key={a.metadata.uid}>
                  <TableCell>
                    <Link kubeObject={a}>{a.metadata.name}</Link>
                  </TableCell>
                  <TableCell>{a.metadata.namespace}</TableCell>
                  <TableCell>{a.fleetName}</TableCell>
                  <TableCell>{a.policyType}</TableCell>
                  <TableCell>
                    {a.currentReplicas} / {a.desiredReplicas}
                  </TableCell>
                  <TableCell>
                    {a.lastScaleTime ? new Date(a.lastScaleTime).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell>
                    <AutoscalerStatusChip
                      ableToScale={a.ableToScale}
                      scalingLimited={a.scalingLimited}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </SectionBox>

      {/* ── Recent unhealthy game servers ───────────────────────────────────── */}
      {unhealthyServers.length > 0 && (
        <SectionBox title="Unhealthy / Error Game Servers">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Namespace</TableCell>
                <TableCell>Fleet</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Node</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unhealthyServers.map(gs => (
                <TableRow key={gs.metadata.uid}>
                  <TableCell>
                    <Link kubeObject={gs}>{gs.metadata.name}</Link>
                  </TableCell>
                  <TableCell>{gs.metadata.namespace}</TableCell>
                  <TableCell>{gs.fleet || '—'}</TableCell>
                  <TableCell>
                    <StateChip state={gs.state} />
                  </TableCell>
                  <TableCell>{gs.nodeName || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionBox>
      )}
    </Box>
  );
}
