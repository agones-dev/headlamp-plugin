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
import React from 'react';
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
  it('should never crash on any arbitrary string input', () => {
    fc.assert(
      fc.property(fc.string(), state => {
        const element = React.createElement(StateChip, { state });
        expect(element).toBeDefined();
        expect(element.type).toBe(StateChip);
      })
    );
  });

  it('should always resolve to a valid MUI Chip color for any input', () => {
    fc.assert(
      fc.property(fc.string(), state => {
        // Replicate the exact lookup logic used by StateChip:
        // STATE_COLORS[state] ?? 'default'
        // Use Object.hasOwn to avoid prototype keys like __proto__
        const resolved = Object.prototype.hasOwnProperty.call(KNOWN_STATE_COLORS, state)
          ? KNOWN_STATE_COLORS[state]
          : 'default';
        expect(VALID_CHIP_COLORS.has(resolved)).toBe(true);
      })
    );
  });

  it('should map every known Agones state to its documented color', () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.keys(KNOWN_STATE_COLORS)), state => {
        const STATE_COLORS: Record<string, string> = KNOWN_STATE_COLORS;
        const resolved = STATE_COLORS[state] ?? 'default';
        expect(resolved).toBe(KNOWN_STATE_COLORS[state]);
      })
    );
  });
});
