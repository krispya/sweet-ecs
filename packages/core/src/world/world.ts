import {
	createWorld,
	type World as bitWorld,
	resetWorld,
	SYMBOLS,
	deleteWorld,
	query as queryBit,
	Queue,
	removeEntity as removeEntityBit,
	addPrefab,
} from '@bitecs/classic';
import { ResizeCallback } from './types';
import { universe, universeResizeCallbacks } from '../universe/universe';
import { ComponentArgs, ComponentConstructor } from '../component/types';
import { addComponent } from '../component/methods/add-component';
import { removeComponent } from '../component/methods/remove-component';

export interface World extends bitWorld {}

export class World {
	#resizeCallbacks: ResizeCallback[] = [];
	#id: number;

	constructor(size?: number) {
		createWorld(this, size);

		// A Prefab is ignored by queries, so we make one here for the world.
		this.#id = addPrefab(this);

		universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
	}

	reset() {
		resetWorld(this, this.size);
		this.#id = addPrefab(this);
	}

	query(components: ComponentConstructor[]): Uint32Array;
	query(components: Queue): Uint32Array;
	query(args: any) {
		return queryBit(this, args);
	}

	get size() {
		return this[SYMBOLS.$size];
	}

	set size(size: number) {
		this[SYMBOLS.$size] = size;
		this.#resizeCallbacks.forEach((cb) => cb(this, size));
		universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
	}

	get id() {
		return this.#id;
	}

	protected set id(id: number) {
		this.#id = id;
	}

	onResize(callback: ResizeCallback) {
		this.#resizeCallbacks.push(callback);

		return () => {
			this.#resizeCallbacks = this.#resizeCallbacks.filter((cb) => cb !== callback);
		};
	}

	destroy() {
		deleteWorld(this);
		universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
	}

	add<T extends ComponentConstructor>(component: T, ...args: ComponentArgs<T>) {
		addComponent(this, component, this.#id, ...args);
	}

	get<T extends ComponentConstructor>(component: T): InstanceType<T> | undefined {
		return component.get(this.#id);
	}

	remove<T extends ComponentConstructor>(component: T) {
		removeComponent(this, component, this.#id);
	}
}
