import { World } from '@sweet-ecs/core';
import { CONSTANTS } from '.';

export class WorldMT extends World {
	workers: Record<string, Worker[]> = {};
	time = {
		then: performance.now(),
		delta: 0,
	};

	constructor(size?: number) {
		super(size);
	}
}

export const world = new WorldMT(CONSTANTS.NBODIES);
