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

import { Link, SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';
import { AutoscalerStatusChip } from '../../components/AutoscalerStatusChip';
import { FleetAutoscaler } from '../../resources/fleetautoscaler';

export function FleetAutoscalerList() {
  const [autoscalers] = FleetAutoscaler.useList();

  return (
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
                <Typography variant="body2" color="text.secondary">Loading…</Typography>
              </TableCell>
            </TableRow>
          ) : autoscalers.map(a => (
            <TableRow key={a.metadata.uid}>
              <TableCell><Link kubeObject={a}>{a.metadata.name}</Link></TableCell>
              <TableCell>{a.metadata.namespace}</TableCell>
              <TableCell>{a.fleetName}</TableCell>
              <TableCell>{a.policyType}</TableCell>
              <TableCell>{a.currentReplicas} / {a.desiredReplicas}</TableCell>
              <TableCell>
                {a.lastScaleTime ? new Date(a.lastScaleTime).toLocaleString() : '—'}
              </TableCell>
              <TableCell>
                <AutoscalerStatusChip ableToScale={a.ableToScale} scalingLimited={a.scalingLimited} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionBox>
  );
}