import { addEntity, getEntityComponents, removeEntity } from '@bitecs/classic';
import { addComponent } from '../component/methods/add-component';
import { World } from '../world/world';
import { hasComponent } from '../component/methods/has-component';
import { ComponentArgs, ComponentConstructor } from '../component/types';
import { removeComponent } from '../component/methods/remove-component';

export class Entity {
	static worldMap: World[] = [];
	static instances: Entity[] = [];

	world: World;
	id: number;
	#onRegisterCallbacks: (() => void)[] = [];

	constructor(world: World);
	constructor(world: World, pure = false) {
		if (pure) {
			this.world = world;
			this.id = -1;
		} else {
			this.world = world;
			this.id = addEntity(world);
			(this.constructor as typeof Entity).instances[this.id] = this;
		}
	}

	add<T extends ComponentConstructor>(component: T, ...args: ComponentArgs<T>): this {
		addComponent(this.world, component, this.id, ...args);
		return this;
	}

	has(component: ComponentConstructor) {
		return hasComponent(this.world, component, this.id);
	}

	get<T extends ComponentConstructor>(component: T): InstanceType<T> | null {
		return component.get(this.id);
	}

	getAll() {
		return getEntityComponents(this.world, this.id);
	}

	remove<T extends ComponentConstructor>(component: T): this {
		removeComponent(this.world, component, this.id);
		return this;
	}

	destroy() {
		removeEntity(this.world, this.id);
		this.#onRegisterCallbacks = [];
		this.id = -1;
		delete (this.constructor as typeof Entity).instances[this.id];
	}

	get isRegistered() {
		return this.id !== -1;
	}

	onRegister(callback: () => void) {
		this.#onRegisterCallbacks.push(callback);

		return () => {
			this.#onRegisterCallbacks = this.#onRegisterCallbacks.filter((cb) => cb !== callback);
		};
	}

	register() {
		if (this.id !== -1) return false;
		this.id = addEntity(this.world);
		this.#onRegisterCallbacks.forEach((cb) => cb());
		(this.constructor as typeof Entity).instances[this.id] = this;
		return true;
	}

	// Static methods
	static define(world: World, id?: number): Entity {
		// @ts-expect-error
		const entity = new Entity(world, true);

		// If an ID is provided, define the entity object for the existing ID.
		if (id !== undefined) entity.id = id;

		return entity;
	}

	static in(world: World): number {
		const id = addEntity(world);
		this.worldMap[id] = world;
		return id;
	}

	static add<T extends ComponentConstructor>(
		component: T,
		id: number,
		...args: ComponentArgs<T>
	): boolean {
		const world = this.worldMap[id];
		if (!world) return false;
		addComponent(world, component, id, ...args);
		return true;
	}

	static has(component: ComponentConstructor, id: number): boolean {
		const world = this.worldMap[id];
		if (!world) return false;
		return hasComponent(world, component, id);
	}

	static get<T extends ComponentConstructor>(component: T, id: number): InstanceType<T> | null {
		const world = this.worldMap[id];
		if (!world) return null;
		return component.get(id);
	}

	static remove<T extends ComponentConstructor>(component: T, id: number): boolean {
		const world = this.worldMap[id];
		if (!world) return false;
		removeComponent(world, component, id);
		return true;
	}

	static destroy(id: number): boolean {
		// Clean up the entity object if it exists.
		if (this.instances[id]) {
			this.instances[id].destroy();
			return true;
		} else {
			const world = this.worldMap[id];
			if (!world) return false;
			removeEntity(world, id);
			delete this.worldMap[id];
			return true;
		}
	}
}
