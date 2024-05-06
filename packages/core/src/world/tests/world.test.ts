import { beforeEach, describe, expect, it, vi } from 'vitest';
import { World } from '../world';
import { SYMBOLS } from '@bitecs/classic';
import { Entity } from '../../entity/entity';
import { getTotalWorldSize } from '../methods/getTotalWorldSize';
import { universe } from '../../universe/universe';
import { Component } from '../../component/component';

describe('World', () => {
	beforeEach(() => {
		universe.reset();
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

		// All worlds have an entity for themselves, so we expect 2.
		expect(world[SYMBOLS.$entityArray]).toHaveLength(2);

		world.reset();

		// On reset we expect 1 entity, the world itself.
		expect(world[SYMBOLS.$entityArray]).toHaveLength(1);
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

	it('can add singletons', () => {
		const world = new World();

		class Time extends Component.define({ current: 0, delta: 0 }) {}

		world.add(Time);
		const time = world.get(Time);
		if (time) time.current = 1;

		expect(time).toBeDefined();
		expect(time).toBeInstanceOf(Time);
		expect(Time.store.current[world.id]).toBe(1);
	});

	it('can remove singletons', () => {
		const world = new World();

		class Time extends Component.define({ current: 0, delta: 0 }) {}

		world.add(Time);
		const time = world.get(Time);

		expect(time).toBeDefined();
		expect(time).toBeInstanceOf(Time);

		world.remove(Time);

		expect(world.get(Time)).toBeUndefined();
	});

	it('has a unique id', () => {
		const world1 = new World();
		const world2 = new World();

		expect(world1.id).not.toBe(world2.id);
	});
});
