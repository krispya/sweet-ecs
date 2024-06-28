import { World } from '@sweet-ecs/core';
import { Time } from '../components/Time';

export const updateTime = ({ world }: { world: World }) => {
	const time = world.get(Time)!;

	if (time.then === 0) time.then = performance.now();

	const now = performance.now();
	const delta = now - time.then;
	time.delta = delta / 100;
	time.then = now;
};
