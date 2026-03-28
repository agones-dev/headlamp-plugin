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

import { DetailsGrid, SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useParams } from 'react-router-dom';
import { FleetLink } from '../../components/FleetLink';
import { ReplicaBar } from '../../components/ReplicaBar';
import { Fleet } from '../../resources/fleet';
import { FleetAutoscaler } from '../../resources/fleetautoscaler';

function policyExtraInfo(item: FleetAutoscaler) {
  const policy = item.spec.policy;

  switch (item.policyType) {
    case 'Buffer':
      return [
        { name: 'Buffer Size', value: item.bufferSize },
        { name: 'Min Replicas', value: item.minReplicas },
        { name: 'Max Replicas', value: item.maxReplicas },
      ];

    case 'Counter':
      return [
        { name: 'Counter Key', value: policy.counter?.key ?? '—' },
        { name: 'Buffer Size', value: policy.counter?.bufferSize ?? '—' },
        { name: 'Min Capacity', value: policy.counter?.minCapacity ?? '—' },
        { name: 'Max Capacity', value: policy.counter?.maxCapacity ?? '—' },
      ];

    case 'List':
      return [
        { name: 'List Key', value: policy.list?.key ?? '—' },
        { name: 'Buffer Size', value: policy.list?.bufferSize ?? '—' },
        { name: 'Min Capacity', value: policy.list?.minCapacity ?? '—' },
        { name: 'Max Capacity', value: policy.list?.maxCapacity ?? '—' },
      ];

    case 'Webhook':
      return [
        {
          name: 'Webhook URL',
          value:
            policy.webhook?.url ??
            (policy.webhook?.service
              ? `${policy.webhook.service.namespace}/${policy.webhook.service.name}${policy.webhook.service.path ?? ''}`
              : '—'),
        },
      ];

    case 'Schedule':
      return [
        {
          name: 'Cron Schedule',
          value: policy.schedule?.activePeriod?.schedule ?? '—',
        },
        {
          name: 'Timezone',
          value: policy.schedule?.activePeriod?.timezone ?? '—',
        },
        {
          name: 'Nested Policy',
          value: policy.schedule?.policy?.type ?? '—',
        },
      ];

    case 'Chain':
      return [
        {
          name: 'Chain Entries',
          value: policy.chain?.length ?? 0,
        },
        ...(policy.chain ?? []).map((entry, i) => ({
          name: `  [${i}] ${entry.id}`,
          value: entry.type,
        })),
      ];

    default:
      return [];
  }
}

function policyExplanation(item: FleetAutoscaler): string {
  const policy = item.spec.policy;
  const min = item.minReplicas;
  const max = item.maxReplicas;
  const bounds = (minVal?: number, maxVal?: number) => {
    if (minVal !== null && minVal !== undefined && maxVal !== null && maxVal !== undefined) return `, keeping replicas between ${minVal} and ${maxVal}`;
    if (minVal !== null && minVal !== undefined) return `, never below ${minVal} replicas`;
    if (maxVal !== null && maxVal !== undefined) return `, never above ${maxVal} replicas`;
    return '';
  };

  switch (item.policyType) {
    case 'Buffer': {
      const buf = item.bufferSize;
      const isPercent = typeof buf === 'string' && buf.endsWith('%');
      return isPercent
        ? `Keeps ${buf} of total replicas in Ready state as a buffer. If Ready drops below that percentage, new servers are started${bounds(min, max)}.`
        : `Keeps ${buf} server(s) in Ready state at all times. If fewer than ${buf} are ready, new servers are started${bounds(min, max)}.`;
    }
    case 'Counter': {
      const c = policy.counter;
      return `Watches the "${c?.key}" counter across all game servers. Scales the fleet so there are always ${c?.bufferSize} available counter slots in reserve. Capacity stays between ${c?.minCapacity ?? '?'} and ${c?.maxCapacity ?? '?'}.`;
    }
    case 'List': {
      const l = policy.list;
      return `Watches the "${l?.key}" list across all game servers. Scales the fleet so there are always ${l?.bufferSize} empty list slots available. Capacity stays between ${l?.minCapacity ?? '?'} and ${l?.maxCapacity ?? '?'}.`;
    }
    case 'Webhook':
      return `Scaling decisions are delegated to an external webhook. The webhook receives current fleet state and responds with the desired replica count.`;
    case 'Schedule': {
      const sched = policy.schedule?.activePeriod?.schedule;
      const tz = policy.schedule?.activePeriod?.timezone ?? 'UTC';
      const nested = policy.schedule?.policy?.type ?? 'Buffer';
      return sched
        ? `Active on cron schedule "${sched}" (${tz}). Outside that window the fleet idles. During active periods, uses a ${nested} policy to scale.`
        : `Scales according to a time-based schedule, using a ${nested} policy during active windows.`;
    }
    case 'Chain': {
      const n = policy.chain?.length ?? 0;
      return `Evaluates ${n} policy rule(s) in order and applies the first one whose conditions match. This allows time-based or condition-based policy switching.`;
    }
    default:
      return 'Unknown policy type.';
  }
}

function ExplainerSection({ item, fleet }: { item: FleetAutoscaler; fleet: Fleet | null }) {
  const explanation = policyExplanation(item);
  const current = item.currentReplicas;
  const desired = item.desiredReplicas;
  const ready = fleet?.readyReplicas ?? 0;
  const allocated = fleet?.allocatedReplicas ?? 0;
  const reserved = fleet?.reservedReplicas ?? 0;

  return (
    <SectionBox title="How This Autoscaler Works">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Chip label={item.policyType} color="primary" size="small" sx={{ mt: 0.25, flexShrink: 0 }} />
          <Typography variant="body2">{explanation}</Typography>
        </Box>

        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary', width: '35%' }}>Replica Status</TableCell>
              <TableCell>
                <ReplicaBar
                  desired={current}
                  ready={ready}
                  allocated={allocated}
                  reserved={reserved}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ color: 'text.secondary' }}>Current → Desired</TableCell>
              <TableCell>
                {current === desired ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{current}</Typography>
                    <Chip label="stable" color="success" size="small" />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{current} → {desired}</Typography>
                    <Chip label="scaling" color="warning" size="small" />
                  </Box>
                )}
              </TableCell>
            </TableRow>
            {item.scalingLimited && (
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Scaling Limit</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="Hit min/max bounds" color="warning" size="small" />
                    <Typography variant="body2" color="text.secondary">
                      The autoscaler wants to scale further but is capped by configured limits.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
            {!item.ableToScale && (
              <TableRow>
                <TableCell sx={{ color: 'text.secondary' }}>Scaling Blocked</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label="Unable to scale" color="error" size="small" />
                    <Typography variant="body2" color="text.secondary">
                      Check fleet status and autoscaler events for the cause.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </SectionBox>
  );
}

export function FleetAutoscalerDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [fleets] = Fleet.useList({ namespace });

  return (
    <DetailsGrid
      resourceType={FleetAutoscaler}
      name={name}
      namespace={namespace}
      withEvents
      extraInfo={item =>
        item && [
          {
            name: 'Fleet',
            value: item.fleetName
              ? <FleetLink namespace={item.metadata.namespace} name={item.fleetName} />
              : '—',
          },
          { name: 'Policy Type', value: item.policyType },
          ...policyExtraInfo(item),
          {
            name: 'Sync Interval',
            value: item.syncInterval ? `${item.syncInterval}s` : '—',
          },
          { name: 'Current Replicas', value: item.currentReplicas },
          { name: 'Desired Replicas', value: item.desiredReplicas },
          { name: 'Able to Scale', value: item.ableToScale ? 'Yes' : 'No' },
          {
            name: 'Scaling Limited',
            value: item.scalingLimited ? (
              <Chip label="Limited — hit min/max bounds" color="warning" size="small" />
            ) : (
              'No'
            ),
          },
          {
            name: 'Last Scale Time',
            value: item.lastScaleTime
              ? new Date(item.lastScaleTime).toLocaleString()
              : '—',
          },
          ...(item.lastAppliedPolicy
            ? [{ name: 'Last Applied Policy', value: item.lastAppliedPolicy }]
            : []),
        ]
      }
      extraSections={item => {
        if (!item) return [];
        const fleet = fleets?.find(f => f.metadata.name === item.fleetName && f.metadata.namespace === item.metadata.namespace) ?? null;
        return [<ExplainerSection item={item} fleet={fleet} />];
      }}
    />
  );
}