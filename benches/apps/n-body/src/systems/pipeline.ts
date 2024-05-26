import { moveBodies, setInitial, updateColor, updateGravity, updateTime } from '@sim/n-body-soa';
import { World } from '@sweet-ecs/core';
import { syncThreeObjects } from './syncThreeObjects';
import { render } from './render';

export const pipeline = (world: World) => {
	updateTime(world);
	setInitial(world);
	updateGravity(world);
	moveBodies(world);
	updateColor(world);
	syncThreeObjects(world);
	render(world);
	return world;
};
