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

import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
  SimpleTable,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import React from 'react';
import { useParams } from 'react-router-dom';
import { FleetLink } from '../../components/FleetLink';
import { GameServerStatusBanner } from '../../components/GameServerStatusBanner';
import { StateChip } from '../../components/StateChip';
import { UtilBar } from '../../components/UtilBar';
import { GameServer } from '../../resources/gameserver';

/** Shows merged spec+status port info including portPolicy. */
function PortsSection({ gameServer }: { gameServer: GameServer }) {
  const merged = gameServer.mergedPorts;
  if (merged.length === 0) return null;

  return (
    <SectionBox title="Ports">
      <SimpleTable
        columns={[
          { label: 'Name', getter: (p: any) => p.name },
          { label: 'Host Port', getter: (p: any) => p.hostPort ?? '—' },
          { label: 'Container Port', getter: (p: any) => p.containerPort ?? '—' },
          { label: 'Protocol', getter: (p: any) => p.protocol },
          { label: 'Policy', getter: (p: any) => p.portPolicy },
        ]}
        data={merged}
      />
    </SectionBox>
  );
}

/** Unified row shape for counters and lists in the SimpleTable. */
interface CounterListRow {
  type: 'Counter' | 'List';
  key: string;
  used: number;
  capacity: number;
  available: number;
  values?: string[];
}

function CountersListsSection({ gameServer }: { gameServer: GameServer }) {
  const counters = Object.entries(gameServer.counters);
  const lists = Object.entries(gameServer.lists);

  if (counters.length === 0 && lists.length === 0) return null;

  const rows: CounterListRow[] = [
    ...counters.map(([key, c]) => ({
      type: 'Counter' as const,
      key,
      used: c.count,
      capacity: c.capacity,
      available: c.capacity - c.count,
    })),
    ...lists.map(([key, l]) => {
      const count = l.values?.length ?? 0;
      return {
        type: 'List' as const,
        key,
        used: count,
        capacity: l.capacity,
        available: l.capacity - count,
        values: l.values,
      };
    }),
  ];

  return (
    <SectionBox title="Counters &amp; Lists">
      <SimpleTable
        columns={[
          {
            label: 'Type',
            getter: (r: CounterListRow) => <Chip label={r.type} size="small" variant="outlined" />,
          },
          {
            label: 'Key',
            getter: (r: CounterListRow) => <strong>{r.key}</strong>,
          },
          {
            label: 'Used / Capacity',
            getter: (r: CounterListRow) => (
              <>
                {r.used} / {r.capacity}
                {r.type === 'List' && r.values && r.values.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {r.values.map(v => (
                      <Chip key={v} label={v} size="small" />
                    ))}
                  </Box>
                )}
              </>
            ),
          },
          {
            label: 'Available',
            getter: (r: CounterListRow) => r.available,
          },
          {
            label: 'Utilization',
            getter: (r: CounterListRow) => <UtilBar value={r.used} max={r.capacity} />,
            cellProps: { sx: { minWidth: 160 } },
          },
        ]}
        data={rows}
      />
    </SectionBox>
  );
}

/** Shows health check and SDK server configuration from spec. */
function ConfigurationSection({ gameServer }: { gameServer: GameServer }) {
  const health = gameServer.spec.health;
  const sdk = gameServer.spec.sdkServer;

  if (!health && !sdk) return null;

  const rows: Array<{ name: string; value: React.ReactNode; hide?: boolean }> = [];

  if (health) {
    rows.push(
      { name: 'Health Checking', value: health.disabled ? 'Disabled' : 'Enabled' },
      {
        name: 'Initial Delay',
        value:
          health.initialDelaySeconds !== null && health.initialDelaySeconds !== undefined
            ? `${health.initialDelaySeconds}s`
            : '—',
      },
      {
        name: 'Period',
        value:
          health.periodSeconds !== null && health.periodSeconds !== undefined
            ? `${health.periodSeconds}s`
            : '—',
      },
      { name: 'Failure Threshold', value: health.failureThreshold ?? '—' }
    );
  }

  if (sdk) {
    rows.push(
      { name: 'SDK Log Level', value: sdk.logLevel ?? '—' },
      { name: 'SDK gRPC Port', value: sdk.grpcPort ?? '—' },
      { name: 'SDK HTTP Port', value: sdk.httpPort ?? '—' }
    );
  }

  return (
    <SectionBox title="Configuration">
      <NameValueTable rows={rows} />
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
          { name: 'State', value: <StateChip state={item.state} /> },
          { name: 'Address', value: item.address || '—' },
          { name: 'Ports', value: item.ports || '—' },
          { name: 'Node', value: item.nodeName || '—' },
        ]
      }
      extraSections={item =>
        item && [
          <GameServerStatusBanner state={item.state} />,
          <PortsSection gameServer={item} />,
          <CountersListsSection gameServer={item} />,
          <ConfigurationSection gameServer={item} />,
        ]
      }
    />
  );
}
