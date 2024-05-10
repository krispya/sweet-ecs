import { addEntity, getEntityComponents, removeEntity } from '@bitecs/classic';
import { addComponent } from '../component/methods/add-component';
import { World } from '../world/world';
import { hasComponent } from '../component/methods/has-component';
import { ComponentArgs, ComponentConstructor } from '../component/types';
import { removeComponent } from '../component/methods/remove-component';

export class Entity {
	static worldMap = [] as World[];

	world: World;
	id: number;
	#onActiveCallbacks: (() => void)[] = [];

	constructor(world: World, empty = false) {
		if (empty) {
			this.world = world;
			this.id = -1;
		} else {
			this.world = world;
			this.id = addEntity(world);
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
		this.id = -1;
	}

	get isActive() {
		return this.id !== -1;
	}

	onActive(callback: () => void) {
		this.#onActiveCallbacks.push(callback);

		return () => {
			this.#onActiveCallbacks = this.#onActiveCallbacks.filter((cb) => cb !== callback);
		};
	}

	// Static methods

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

	static destory(id: number): boolean {
		const world = this.worldMap[id];
		if (!world) return false;
		removeEntity(world, id);
		return true;
	}

	static activate(entity: Entity): boolean {
		if (entity.id !== -1) return false;
		entity.id = addEntity(entity.world);
		entity.#onActiveCallbacks.forEach((cb) => cb());
		return true;
	}

	static deactive(entity: Entity): boolean {
		if (entity.id === -1) return false;
		removeEntity(entity.world, entity.id);
		entity.id = -1;
		return true;
	}
}
