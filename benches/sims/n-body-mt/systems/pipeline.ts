import { setInitial } from './setInitial';
import { moveBodies } from './moveBodies';
import { updateColor } from './updateColor';
import { updateTime } from './updateTime';
import { World } from '@sweet-ecs/core';
import { updateGravity } from './updateGravity.main';

export const pipeline = async (world: World) => {
	updateTime(world);
	setInitial(world);
	await updateGravity(world);
	moveBodies(world);
	updateColor(world);
};
