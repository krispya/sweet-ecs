import { Time } from '@sim/n-body-aos';
import { World } from '@sweet-ecs/core';

export const updateTime = (world: World) => {
	const time = world.get(Time)!;
	const now = performance.now();
	const delta = now - time.then;
	time.delta = delta / 100;
	time.then = now;
	return world;
};
