import { moveBodies, setInitial, updateColor, updateGravity, updateTime } from '@sim/n-body-mt';
import { World } from '@sweet-ecs/core';
import { syncThreeObjects } from './syncThreeObjects';
import { render } from './render';

export const pipeline = async (world: World) => {
	updateTime(world);
	setInitial(world);
	await updateGravity(world);
	moveBodies(world);
	updateColor(world);
	syncThreeObjects(world);
	render(world);
	return world;
};
