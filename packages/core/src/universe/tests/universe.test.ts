import { beforeEach, describe, expect, it, vi } from 'vitest';
import { universe } from '../universe';
import { World } from '../..';

describe('Universe', () => {
	beforeEach(() => {
		universe.worlds.length = 0;
	});

	it('size is equal to total world size', () => {
		const world1 = new World(10);
		const world2 = new World(20);

		expect(world1.size).toBe(10);
		expect(world2.size).toBe(20);

		expect(universe.getSize()).toBe(30);
	});

	it('calls resize callbacks when a world is resized', () => {
		const worldA = new World(10);
		const worldB = new World(20);
		const callback = vi.fn();

		const off = universe.onResize(callback);

		expect(callback).toHaveBeenCalledTimes(0);

		worldA.size = 20;

		expect(callback).toHaveBeenCalledTimes(1);

		worldB.size = 30;

		expect(callback).toHaveBeenCalledTimes(2);

		off();

		worldA.size = 40;

		expect(callback).toHaveBeenCalledTimes(2);
	});
});
