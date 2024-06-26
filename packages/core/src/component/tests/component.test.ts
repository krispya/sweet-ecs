import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Component } from '../component';
import { World } from '../../world/world';
import { Entity } from '../../entity/entity';
import { addComponent, addComponentInstance } from '../methods/add-component';
import { hasComponent } from '../methods/has-component';
import exp from 'constants';
import { removeComponent } from '../methods/remove-component';

class Foo {
	bar = 'bar';
}

describe('Component', () => {
	const world = new World(100);

	beforeEach(() => {
		world.reset();
	});

	it('creates with define', () => {
		class Test extends Component.createSoA({
			number: 2,
			string: 'hello',
			array: [] as number[],
			instance: Foo,
			f64: { type: 'float64' },
			uint16: { type: 'uint16' },
			number2: { type: 'number', default: 10 },
		}) {}

		expect(Test).toHaveProperty('schema');
		expect(Test).toHaveProperty('store');
		expect(Test).toHaveProperty('instances');

		expect(Test.store.number).toBeDefined();
		expect(Test.store.string).toBeDefined();
		expect(Test.store.array).toBeDefined();
		expect(Test.store.instance).toBeDefined();
		expect(Test.store.f64).toBeDefined();
		expect(Test.store.f64).toBeInstanceOf(Float64Array);
		expect(Test.store.uint16).toBeDefined();
		expect(Test.store.uint16).toBeInstanceOf(Uint16Array);
		expect(Test.store.number2).toBeDefined();
	});

	it('supports AoS', () => {
		class Test extends Component.createSoA({ number: 0, instance: Foo }) {}

		const eid = Entity.in(world);
		addComponent(world, Test, eid);

		const test = Test.get(eid)!;
		test.number = 11;

		expect(test.number).toBe(11);
		expect(test.instance).toBeInstanceOf(Foo);
		expect(Test.store.number[eid]).toBe(11);
		expect(Test.store.instance[eid]).toBeInstanceOf(Foo);
	});

	it('supports SoA', () => {
		class Test extends Component.createSoA({ number: 0 }) {}

		const eid = Entity.in(world);
		addComponent(world, Test, eid);

		Test.store.number[eid] = 11;

		expect(Test.store.number[eid]).toBe(11);
		expect(Test.get(eid)!.number).toBe(11);
	});

	it('adds to an entity', () => {
		class Test extends Component.createSoA({ number: 0 }) {}

		const eid = Entity.in(world);
		addComponent(world, Test, eid);
		const test = Test.get(eid)!;

		expect(hasComponent(world, Test, eid)).toBe(true);
		expect(test.number).toBe(0);
	});

	it('removes from an entity', () => {
		class Test extends Component.createSoA({ number: 0 }) {}

		const eid = Entity.in(world);
		addComponent(world, Test, eid);

		expect(hasComponent(world, Test, eid)).toBe(true);
		expect(Test.get(eid)).toBeDefined();

		removeComponent(world, Test, eid);

		expect(hasComponent(world, Test, eid)).toBe(false);
		expect(Test.get(eid)).toBeUndefined();
	});

	it('resizes buffer stores when world resizes', () => {
		class Test extends Component.createSoA({ f64: { type: 'float64' } }) {}

		const eid = Entity.in(world);
		addComponent(world, Test, eid);

		expect(Test.store.f64.length).toBe(100);

		world.size = 200;

		expect(Test.store.f64.length).toBe(200);
	});

	it('adds a component instance to an entity', () => {
		class Test extends Component.createSoA({ number: 11 }) {
			constructor(number: number) {
				super(() => ({ number }));
			}
		}

		const eid = Entity.in(world);
		const instance = new Test(1);
		addComponentInstance(world, instance, eid);

		expect(hasComponent(world, Test, eid)).toBe(true);
		expect(Test.get(eid)).toBe(instance);
		expect(instance.number).toBe(1);
		expect(Test.store.number[eid]).toBe(1);
	});

	it('initializes properties on add', () => {
		class Test extends Component {
			number = 11;
		}

		expect(Object.hasOwn(Test, 'instances')).toBe(false);

		const eid = Entity.in(world);
		addComponent(world, Test, eid);

		expect(Object.hasOwn(Test, 'instances')).toBe(true);
	});

	// it('has a hierarchy of components', () => {
	// 	class Test extends Component {}

	// 	const eid = Entity.in(world);
	// 	addComponent(world, Test, eid);

	// 	class Test2 extends Test {}

	// 	const eid2 = Entity.in(world);
	// 	addComponent(world, Test2, eid2);
	// });
});
