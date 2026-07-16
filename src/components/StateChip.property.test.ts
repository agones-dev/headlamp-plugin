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

import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { StateChip } from './StateChip';

/**
 * The complete set of valid MUI Chip color values.
 *
 * @see {@link https://mui.com/material-ui/api/chip/#chip-prop-color | MUI Chip color prop}
 */
const VALID_CHIP_COLORS = new Set([
  'default',
  'primary',
  'secondary',
  'error',
  'info',
  'success',
  'warning',
]);

/**
 * Known Agones GameServer lifecycle states and their expected chip colors.
 * Used as the expected-value reference — the actual mapping lives inside
 * the StateChip component's internal STATE_COLORS constant.
 *
 * @see {@link https://agones.dev/site/docs/reference/gameserver/#gameserver-state-diagram | Agones GameServer State Diagram}
 */
const KNOWN_STATE_COLORS: Record<string, string> = {
  PortAllocation: 'info',
  Creating: 'info',
  Starting: 'info',
  Scheduled: 'info',
  RequestReady: 'info',
  Ready: 'success',
  Allocated: 'warning',
  Reserved: 'secondary',
  Shutdown: 'default',
  Error: 'error',
  Unhealthy: 'error',
};

describe('StateChip — property tests', () => {
  it('should never crash and always produce a valid element for any arbitrary string input', () => {
    fc.assert(
      fc.property(fc.string(), state => {
        // Directly call the component function to execute its internal logic
        // (STATE_COLORS lookup, Chip rendering) rather than just creating a descriptor.
        const element = StateChip({ state });
        expect(element).toBeDefined();
        expect(element.props).toBeDefined();
      })
    );
  });

  it('should always resolve to a valid MUI Chip color for any input', () => {
    fc.assert(
      fc.property(fc.string(), state => {
        // Directly invoke the component to exercise the real STATE_COLORS mapping.
        const element = StateChip({ state });
        const color: string = element.props.color;
        expect(VALID_CHIP_COLORS.has(color)).toBe(true);
      })
    );
  });

  it('should map every known Agones state to its documented color', () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.keys(KNOWN_STATE_COLORS)), state => {
        // Invoke the real component and verify its output color matches
        // the expected color from KNOWN_STATE_COLORS (the reference document).
        const element = StateChip({ state });
        const color: string = element.props.color;
        expect(color).toBe(KNOWN_STATE_COLORS[state]);
      })
    );
  });
});
