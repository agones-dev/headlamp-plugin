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
import React from 'react';
import { useParams } from 'react-router-dom';
import { FleetLink } from '../../components/FleetLink';
import { GameServerTable } from '../../components/GameServerTable';
import { GameServerSetPhaseChip } from '../../components/GameServerSetPhaseChip';
import { ReplicaBar } from '../../components/ReplicaBar';
import { Fleet } from '../../resources/fleet';
import { GameServer } from '../../resources/gameserver';
import { GameServerSet } from '../../resources/gameserverset';
import { GAME_SERVER_SET_LABEL } from '../../utils/agonesLabels';
import {
  filterGameServerSetsByFleet,
  getGameServerSetPhase,
} from '../../utils/gameServerSetHelpers';

function GameServersSection({ gameServers }: { gameServers: GameServer[] | null }) {
  return (
    <SectionBox title="Game Servers">
      <GameServerTable gameServers={gameServers ?? []} />
    </SectionBox>
  );
}

export function GameServerSetDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [gameServers] = GameServer.useList({
    namespace,
    labelSelector: `${GAME_SERVER_SET_LABEL}=${name}`,
  });
  const [fleets] = Fleet.useList({ namespace });
  const [allSets] = GameServerSet.useList({ namespace });

  return (
    <DetailsGrid
      resourceType={GameServerSet}
      name={name}
      namespace={namespace}
      withEvents
      extraInfo={item => {
        if (!item) return [];
        const fleet = fleets?.find(f => f.metadata.name === item.fleet);
        const siblings =
          fleet && allSets ? filterGameServerSetsByFleet(allSets, fleet) : [];
        const phase = getGameServerSetPhase(item, fleet, siblings);

        return [
          {
            name: 'Fleet',
            value: item.fleet
              ? <FleetLink namespace={item.metadata.namespace} name={item.fleet} />
              : '—',
          },
          { name: 'Phase', value: <GameServerSetPhaseChip phase={phase} /> },
          { name: 'Scheduling', value: item.scheduling },
          { name: 'Desired Replicas', value: item.desiredReplicas },
          {
            name: 'Replica Status',
            value: (
              <ReplicaBar
                desired={item.desiredReplicas}
                ready={item.readyReplicas}
                allocated={item.allocatedReplicas}
                reserved={item.reservedReplicas}
              />
            ),
          },
          { name: 'Shutdown Replicas', value: item.shutdownReplicas },
        ];
      }}
      extraSections={() => [<GameServersSection gameServers={gameServers ?? null} />]}
    />
  );
}
