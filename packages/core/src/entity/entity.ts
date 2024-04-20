import { addEntity, removeEntity } from '@bitecs/classic';
import { addComponent } from '../component/methods/add-component';
import { World } from '../world/world';
import { hasComponent } from '../component/methods/has-component';
import { ComponentArgs, ComponentConstructor } from '../component/types';

export class Entity {
	static worldMap = [] as World[];

	world: World;
	id: number;

	constructor(world: World) {
		this.world = world;
		this.id = addEntity(world);
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

	destroy() {
		removeEntity(this.world, this.id);
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

	static destory(id: number): boolean {
		const world = this.worldMap[id];
		if (!world) return false;
		removeEntity(world, id);
		return true;
	}
}
