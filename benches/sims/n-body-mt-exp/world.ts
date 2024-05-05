import { World } from '@sweet-ecs/core';
import { CONSTANTS, Workers, Time } from '.';

export const world = new World(CONSTANTS.NBODIES);
world.add(Time);
world.add(Workers);
