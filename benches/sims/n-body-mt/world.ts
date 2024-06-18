import { World } from '@sweet-ecs/core';
import { Time, Workers } from '.';

export const world = new World({ bufferedQueries: true });
world.add(Time);
world.add(Workers);
