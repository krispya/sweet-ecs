import { World } from '@sweet-ecs/core';
import { CONSTANTS } from '.';
import { Time } from './components/Time';

export const world = new World(CONSTANTS.NBODIES + CONSTANTS.NBODIES * 0.1);
world.add(Time);
