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

import { DetailsGrid, SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React from 'react';
import { useParams } from 'react-router-dom';
import { FleetLink } from '../../components/FleetLink';
import { UtilBar } from '../../components/UtilBar';
import { GameServer } from '../../resources/gameserver';

/** Shows merged spec+status port info including portPolicy. */
function PortsSection({ gameServer }: { gameServer: GameServer }) {
  const merged = gameServer.mergedPorts;
  if (merged.length === 0) return null;

  return (
    <SectionBox title="Ports">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Host Port</TableCell>
            <TableCell>Container Port</TableCell>
            <TableCell>Protocol</TableCell>
            <TableCell>Policy</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {merged.map((p, i) => (
            <TableRow key={i}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.hostPort ?? '—'}</TableCell>
              <TableCell>{p.containerPort ?? '—'}</TableCell>
              <TableCell>{p.protocol}</TableCell>
              <TableCell>{p.portPolicy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionBox>
  );
}

function CountersListsSection({ gameServer }: { gameServer: GameServer }) {
  const counters = Object.entries(gameServer.counters);
  const lists = Object.entries(gameServer.lists);

  if (counters.length === 0 && lists.length === 0) return null;

  return (
    <SectionBox title="Counters &amp; Lists">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Key</TableCell>
            <TableCell>Used / Capacity</TableCell>
            <TableCell>Available</TableCell>
            <TableCell sx={{ minWidth: 160 }}>Utilization</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {counters.map(([key, c]) => (
            <TableRow key={`counter-${key}`}>
              <TableCell>
                <Chip label="Counter" size="small" variant="outlined" />
              </TableCell>
              <TableCell>
                <strong>{key}</strong>
              </TableCell>
              <TableCell>
                {c.count} / {c.capacity}
              </TableCell>
              <TableCell>{c.capacity - c.count}</TableCell>
              <TableCell>
                <UtilBar value={c.count} max={c.capacity} />
              </TableCell>
            </TableRow>
          ))}
          {lists.map(([key, l]) => {
            const count = l.values?.length ?? 0;
            return (
              <TableRow key={`list-${key}`}>
                <TableCell>
                  <Chip label="List" size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <strong>{key}</strong>
                </TableCell>
                <TableCell>
                  {count} / {l.capacity}
                  {count > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {l.values.map(v => (
                        <Chip key={v} label={v} size="small" />
                      ))}
                    </Box>
                  )}
                </TableCell>
                <TableCell>{l.capacity - count}</TableCell>
                <TableCell>
                  <UtilBar value={count} max={l.capacity} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </SectionBox>
  );
}

/** Shows health check and SDK server configuration from spec. */
function ConfigurationSection({ gameServer }: { gameServer: GameServer }) {
  const health = gameServer.spec.health;
  const sdk = gameServer.spec.sdkServer;

  if (!health && !sdk) return null;

  const rows: Array<{ label: string; value: React.ReactNode }> = [];

  if (health) {
    rows.push(
      { label: 'Health Checking', value: health.disabled ? 'Disabled' : 'Enabled' },
      {
        label: 'Initial Delay',
        value:
          health.initialDelaySeconds !== null && health.initialDelaySeconds !== undefined
            ? `${health.initialDelaySeconds}s`
            : '—',
      },
      {
        label: 'Period',
        value:
          health.periodSeconds !== null && health.periodSeconds !== undefined
            ? `${health.periodSeconds}s`
            : '—',
      },
      { label: 'Failure Threshold', value: health.failureThreshold ?? '—' }
    );
  }

  if (sdk) {
    rows.push(
      { label: 'SDK Log Level', value: sdk.logLevel ?? '—' },
      { label: 'SDK gRPC Port', value: sdk.grpcPort ?? '—' },
      { label: 'SDK HTTP Port', value: sdk.httpPort ?? '—' }
    );
  }

  return (
    <SectionBox title="Configuration">
      <Table size="small">
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.label}>
              <TableCell sx={{ color: 'text.secondary', width: '40%' }}>{row.label}</TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionBox>
  );
}

export function GameServerDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  return (
    <DetailsGrid
      resourceType={GameServer}
      name={name}
      namespace={namespace}
      withEvents
      extraInfo={item =>
        item && [
          {
            name: 'Fleet',
            value: item.fleet ? (
              <FleetLink namespace={item.metadata.namespace} name={item.fleet} />
            ) : (
              '—'
            ),
          },
          { name: 'State', value: item.state },
          { name: 'Address', value: item.address || '—' },
          { name: 'Ports', value: item.ports || '—' },
          { name: 'Node', value: item.nodeName || '—' },
        ]
      }
      extraSections={item =>
        item && [
          <PortsSection gameServer={item} />,
          <CountersListsSection gameServer={item} />,
          <ConfigurationSection gameServer={item} />,
        ]
      }
    />
  );
}
