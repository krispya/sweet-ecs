import { World } from '@sweet-ecs/core';
import { Time } from '../components/Time';

export const updateTime = (world: World) => {
	const time = world.get(Time)!;
	const now = performance.now();
	const delta = now - time.then;
	time.delta = delta / 100;
	time.then = now;
	return world;
};
