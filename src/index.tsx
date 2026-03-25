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

import { registerMapSource, registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { DetailsGrid, ResourceListView } from '@kinvolk/headlamp-plugin/lib/components/common';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Fleet } from './resources/fleet';
import { agonesMapSource } from './mapView';

registerMapSource(agonesMapSource);

// Top-level "Agones" sidebar entry
registerSidebarEntry({
  parent: null,
  name: 'agones',
  label: 'Agones',
  url: '/agones/fleets',
  icon: 'mdi:gamepad-square',
});

// "Fleets" subsection under "Agones"
registerSidebarEntry({
  parent: 'agones',
  name: 'agones-fleets',
  label: 'Fleets',
  url: '/agones/fleets',
});

registerRoute({
  path: '/agones/fleets/:namespace/:name',
  sidebar: 'agones-fleets',
  name: 'agones-fleet',
  component: () => {
    const { namespace, name } = useParams<{ namespace: string; name: string }>();
    return (
      <DetailsGrid
        resourceType={Fleet}
        name={name}
        namespace={namespace}
        withEvents
        extraInfo={item =>
          item && [
            { name: 'Scheduling', value: item.scheduling },
            { name: 'Desired Replicas', value: item.desiredReplicas },
            { name: 'Current Replicas', value: item.currentReplicas },
            { name: 'Ready Replicas', value: item.readyReplicas },
            { name: 'Allocated Replicas', value: item.allocatedReplicas },
          ]
        }
      />
    );
  },
});

registerRoute({
  path: '/agones/fleets',
  sidebar: 'agones-fleets',
  name: 'agones-fleets',
  exact: true,
  component: () => (
    <ResourceListView
      title="Fleets"
      resourceClass={Fleet}
      columns={[
        'name',
        'namespace',
        {
          id: 'scheduling',
          label: 'Scheduling',
          getValue: (item: Fleet) => item.scheduling,
        },
        {
          id: 'desired',
          label: 'Desired',
          getValue: (item: Fleet) => item.desiredReplicas,
        },
        {
          id: 'current',
          label: 'Current',
          getValue: (item: Fleet) => item.currentReplicas,
        },
        {
          id: 'allocated',
          label: 'Allocated',
          getValue: (item: Fleet) => item.allocatedReplicas,
        },
        {
          id: 'ready',
          label: 'Ready',
          getValue: (item: Fleet) => item.readyReplicas,
        },
        'age',
      ]}
    />
  ),
});
