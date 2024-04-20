import { setInitial } from './setInitial';
import { moveBodies } from './moveBodies';
import { updateColor } from './updateColor';
import { updateTime } from './time';
import { World } from '@sweet-ecs/core';
import { updateGravity } from './updateGravity.common';

export const pipeline = async (world: World) => {
	updateTime(world);
	setInitial(world);
	await updateGravity.main(world);
	moveBodies(world);
	updateColor(world);
};
