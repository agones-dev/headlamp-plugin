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

import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { AutoscalerStatusChip } from '../../components/AutoscalerStatusChip';
import { FleetAutoscaler } from '../../resources/fleetautoscaler';

export function FleetAutoscalerList() {
  const [autoscalers] = FleetAutoscaler.useList();

  return (
    <ResourceListView
      title="Fleet Autoscalers"
      data={autoscalers}
      columns={[
        'name',
        'namespace',
        {
          id: 'fleet',
          label: 'Fleet',
          getValue: (a: FleetAutoscaler) => a.fleetName,
        },
        {
          id: 'policy',
          label: 'Policy',
          getValue: (a: FleetAutoscaler) => a.policyType,
        },
        {
          id: 'replicas',
          label: 'Current / Desired',
          getValue: (a: FleetAutoscaler) => `${a.currentReplicas} / ${a.desiredReplicas}`,
        },
        {
          id: 'lastScale',
          label: 'Last Scale',
          getValue: (a: FleetAutoscaler) =>
            a.lastScaleTime ? new Date(a.lastScaleTime).toLocaleString() : '—',
        },
        {
          id: 'status',
          label: 'Status',
          render: (a: FleetAutoscaler) => (
            <AutoscalerStatusChip ableToScale={a.ableToScale} scalingLimited={a.scalingLimited} />
          ),
          getValue: (a: FleetAutoscaler) =>
            !a.ableToScale ? 'Blocked' : a.scalingLimited ? 'Limited' : 'OK',
        },
      ]}
    />
  );
}
