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
import { ReplicaBar } from '../../components/ReplicaBar';
import { ReplicasControl } from '../../components/ReplicasControl';
import { Fleet } from '../../resources/fleet';

export function FleetList() {
  const [fleets] = Fleet.useList();

  return (
    <ResourceListView
      title="Fleets"
      data={fleets}
      columns={[
        'name',
        'namespace',
        {
          id: 'scheduling',
          label: 'Scheduling',
          getValue: (fleet: Fleet) => fleet.scheduling,
        },
        {
          id: 'desired',
          label: 'Desired',
          render: (fleet: Fleet) => <ReplicasControl fleet={fleet} />,
          getValue: (fleet: Fleet) => fleet.desiredReplicas,
        },
        {
          id: 'replicaStatus',
          label: 'Replica Status',
          render: (fleet: Fleet) => (
            <ReplicaBar
              desired={fleet.desiredReplicas}
              ready={fleet.readyReplicas}
              allocated={fleet.allocatedReplicas}
              reserved={fleet.reservedReplicas}
            />
          ),
          getValue: (fleet: Fleet) =>
            `${fleet.readyReplicas}/${fleet.allocatedReplicas}/${fleet.desiredReplicas}`,
        },
      ]}
    />
  );
}
