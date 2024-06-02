import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Entity } from '../entity';
import { World } from '../../world/world';
import { SYMBOLS } from 'bitecs';
import { Component } from '../../component/component';

describe('Entity', () => {
	const world = new World();

	beforeEach(() => {
		world.reset();
	});

	describe('with objects', () => {
		it('creates an entity', () => {
			const entity = new Entity(world);
			expect(entity).toBeDefined();
			expect(entity).toBeInstanceOf(Entity);
			expect(world[SYMBOLS.$entityArray]).toContain(entity.id);
		});

		it('adds a component', () => {
			class Test extends Component {
				public number = 0;
			}
			const entity = new Entity(world).add(Test);

			expect(entity.has(Test)).toBe(true);
		});

		it('adds a component instance', () => {
			class Test extends Component {
				constructor(public number: number) {
					super();
				}
			}
			const entity = new Entity(world).add(new Test(11));

			expect(entity.has(Test)).toBe(true);
			expect(entity.get(Test)!.number).toBe(11);
		});

		it('gets a component', () => {
			class Test extends Component {
				public number = 0;
			}
			const entity = new Entity(world).add(Test);
			const test = entity.get(Test);

			expect(test).toBeDefined();
			expect(test).toBeInstanceOf(Test);
		});

		it('can define without side effects', () => {
			const entity = Entity.define(world);

			expect(world.getEntities()).toHaveLength(1);
			expect(entity.isRegistered).toBe(false);
		});

		it('can manually register after defined', () => {
			const entity = Entity.define(world);
			entity.register();

			expect(world.getEntities()).toHaveLength(2);
			expect(entity.isRegistered).toBe(true);
		});

		it('destroying entity by ID also destroys object', () => {
			const entity = new Entity(world);

			expect(Entity.instances[entity.id]).toBeDefined();

			Entity.destroy(entity.id);

			expect(Entity.instances[entity.id]).toBeUndefined();
			expect(entity.isRegistered).toBe(false);
		});
	});

	describe('without objects', () => {
		it('creates an entity', () => {
			const id = Entity.in(world);
			expect(world[SYMBOLS.$entityArray]).toContain(id);
		});

		it('adds a component', () => {
			class Test extends Component {
				public number = 0;
			}
			const eid = Entity.in(world);
			Entity.add(Test, eid);

			expect(Entity.has(Test, eid)).toBe(true);
		});

		it('gets a component', () => {
			class Test extends Component {
				public number = 0;
			}
			const eid = Entity.in(world);
			Entity.add(Test, eid);
			const test = Entity.get(Test, eid);

			expect(test).toBeDefined();
			expect(test).toBeInstanceOf(Test);
		});
	});
});
