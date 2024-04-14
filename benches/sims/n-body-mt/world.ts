import { World as WorldCore } from '@sweet-ecs/core';
import { CONSTANTS } from '.';

export class World extends WorldCore {
	workers: Record<string, Worker[]> = {};
	time = {
		then: performance.now(),
		delta: 0,
	};

	constructor(size?: number) {
		super(size);
	}
}

export const world = new World(CONSTANTS.NBODIES);
