import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Entity } from '../entity';
import { World } from '../../world/world';
import { SYMBOLS } from '@bitecs/classic';
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

		it('gets a component', () => {
			class Test extends Component {
				public number = 0;
			}
			const entity = new Entity(world).add(Test);
			const test = entity.get(Test);

			expect(test).toBeDefined();
			expect(test).toBeInstanceOf(Test);
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
