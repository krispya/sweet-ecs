import { setInitial } from './setInitial';
import { updateGravity } from './updateGravity';
import { moveBodies } from './moveBodies';
import { updateColor } from './updateColor';
import { updateTime } from './updateTime';
import { World } from '@sweet-ecs/core';

export const pipeline = (world: World) => {
	updateTime(world);
	setInitial(world);
	updateGravity(world);
	moveBodies(world);
	updateColor(world);
	return world;
};
