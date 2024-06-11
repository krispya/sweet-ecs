import { World } from '@sweet-ecs/core';
import { CONSTANTS } from '.';
import { Time } from './components/Time';

export const world = new World(CONSTANTS.NBODIES * 2);
world.add(Time);
