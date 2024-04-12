import { beforeEach, describe, expect, it, vi } from 'vitest';
import { World } from '../world';
import { SYMBOLS } from '@bitecs/classic';
import { Entity } from '../../entity/entity';
import { getTotalWorldSize } from '../methods/getTotalWorldSize';
import { universe } from '../../universe/universe';

describe('World', () => {
	beforeEach(() => {
		universe.worlds.length = 0;
	});

	it('creates a world instance', () => {
		const world = new World();

		// The world returned is an instance.
		expect(world).toBeDefined();
		expect(world).toBeInstanceOf(World);

		// The world is properly added to the internal worlds array.
		expect(universe.worlds).toContain(world);
		expect(universe.worlds).toHaveLength(1);
	});

	it('resets the world', () => {
		const world = new World();
		Entity.in(world);

		expect(world[SYMBOLS.$entityArray]).toHaveLength(1);

		world.reset();

		expect(world[SYMBOLS.$entityArray]).toHaveLength(0);
	});

	it('can get total world size', () => {
		const world1 = new World(10);
		const world2 = new World(20);

		expect(world1[SYMBOLS.$size]).toBe(10);
		expect(world2[SYMBOLS.$size]).toBe(20);

		expect(getTotalWorldSize()).toBe(30);
	});

	it('can be resized with a callback', () => {
		const world = new World(10);
		const callback = vi.fn();

		const off = world.onResize(callback);

		expect(callback).toHaveBeenCalledTimes(0);

		world.size = 20;

		expect(callback).toHaveBeenCalledTimes(1);

		off();

		world.size = 30;

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('can be destroyed', () => {
		const world = new World();

		expect(universe.worlds).toContain(world);
		expect(universe.worlds).toHaveLength(1);

		world.destroy();

		expect(universe.worlds).not.toContain(world);
		expect(universe.worlds).toHaveLength(0);
	});
});
