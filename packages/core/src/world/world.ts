import {
	createWorld,
	type World as bitWorld,
	resetWorld,
	SYMBOLS,
	deleteWorld,
	query as queryBit,
	Queue,
	Component,
} from '@bitecs/classic';
import { ResizeCallback } from './types';
import { universe, universeResizeCallbacks } from '../universe/universe';
import { ComponentConstructor } from '../component/types';

export interface World extends bitWorld {}

let idCounter = 0;

export class World {
	#resizeCallbacks: ResizeCallback[] = [];
	#singletons = new Map<ComponentConstructor, Component>();
	#id: number = idCounter++;

	constructor(size?: number) {
		createWorld(this, size);
		universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
	}

	reset() {
		resetWorld(this, this.size);
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

	add(component: ComponentConstructor) {
		this.#singletons.set(component, new component());
	}

	get<T extends ComponentConstructor>(component: T): InstanceType<T> | undefined {
		return this.#singletons.get(component);
	}

	remove(component: ComponentConstructor) {
		this.#singletons.delete(component);
	}
}
