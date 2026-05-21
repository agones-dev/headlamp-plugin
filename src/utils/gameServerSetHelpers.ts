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

import { KubeObject } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import { Fleet } from '../resources/fleet';
import { GameServerSet } from '../resources/gameserverset';
import { FLEET_NAME_LABEL } from './agonesLabels';

/** Mirrors metav1.IsControlledBy — fleet must be the controlling owner. */
export function isControlledBy(child: KubeObject, owner: KubeObject): boolean {
  const refs = child.metadata.ownerReferences ?? [];
  return refs.some(
    ref => ref.uid === owner.metadata.uid && ref.controller === true
  );
}

/** Template equality check (Agones uses Semantic.DeepEqual on spec.template). */
export function templatesMatch(
  a: { template?: object },
  b: { template?: object }
): boolean {
  return JSON.stringify(a.template ?? {}) === JSON.stringify(b.template ?? {});
}

export type GameServerSetPhase = 'active' | 'retiring' | 'unknown';

/**
 * Active when spec.template matches the fleet's template (pkg/fleets/controller.go).
 * Among duplicates, the oldest creationTimestamp wins as active.
 */
export function getGameServerSetPhase(
  gss: GameServerSet,
  fleet: Fleet | undefined,
  siblings: GameServerSet[]
): GameServerSetPhase {
  if (!fleet) return 'unknown';
  if (!templatesMatch(gss.spec, fleet.spec)) return 'retiring';

  const matching = siblings.filter(s => templatesMatch(s.spec, fleet.spec));
  if (matching.length <= 1) return 'active';

  const oldest = matching.reduce((a, b) =>
    new Date(a.metadata.creationTimestamp ?? 0) <=
    new Date(b.metadata.creationTimestamp ?? 0)
      ? a
      : b
  );
  return oldest.metadata.uid === gss.metadata.uid ? 'active' : 'retiring';
}

/** Fleet-owned GameServerSets: label selector + ownerRef filter (pkg/fleets/fleets.go). */
export function filterGameServerSetsByFleet(
  sets: GameServerSet[],
  fleet: Fleet
): GameServerSet[] {
  const fleetName = fleet.metadata.name;
  return sets.filter(
    gss =>
      gss.metadata.namespace === fleet.metadata.namespace &&
      gss.metadata.labels?.[FLEET_NAME_LABEL] === fleetName &&
      isControlledBy(gss, fleet)
  );
}
