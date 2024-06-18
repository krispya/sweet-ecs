import {
	createWorld,
	type World as bitWorld,
	resetWorld,
	SYMBOLS,
	deleteWorld,
	query as queryBit,
	Queue,
	addPrefab,
	defineWorld,
	registerWorld,
	QueryResult,
	enableManualEntityRecycling,
	enableBufferedQueries,
} from 'bitecs';
import { ResizeCallback } from './types';
import { universe, universeResizeCallbacks } from '../universe/universe';
import { addComponent, addComponentInstance } from '../component/methods/add-component';
import { removeComponent } from '../component/methods/remove-component';
import { hasComponent } from '../component/methods/has-component';
import { Entity } from '../entity/entity';
import { Component } from '../component/component';

export interface World extends bitWorld {}

type WorldOptions = {
	size?: number;
	manualRecycling?: boolean;
	bufferedQueries?: boolean;
};

export class World {
	#resizeCallbacks: ResizeCallback[] = [];
	#id: number;
	#onRegisterCallbacks: (() => void)[] = [];
	#isRegistered: boolean;
	#size: number = -1;

	constructor(options?: WorldOptions);
	constructor(options?: WorldOptions, pure = false) {
		if (pure) {
			defineWorld(this, options?.size);
			this.#isRegistered = false;
			this.#id = -1;
		} else {
			createWorld(this, options?.size);
			this.#isRegistered = true;
			this.#size = this[SYMBOLS.$size];

			// A Prefab is ignored by queries, so we make one here for the world.
			this.#id = addPrefab(this);

			universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
		}

		// Set options.
		if (options?.manualRecycling) enableManualEntityRecycling(this);
		if (options?.bufferedQueries) enableBufferedQueries(this);
	}

	reset() {
		resetWorld(this, this.size);
		this.#id = addPrefab(this);
	}

	query(components: (typeof Component)[]): QueryResult<typeof this>;
	query(components: Queue): QueryResult<typeof this>;
	query(args: any) {
		return queryBit(this, args);
	}

	get size() {
		return this[SYMBOLS.$size];
	}

	set size(size: number) {
		this[SYMBOLS.$size] = size;
		this.#size = size;
		this.#resizeCallbacks.forEach((cb) => cb(this, size));
		universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
	}

	get id() {
		return this.#id;
	}

	protected set id(id: number) {
		this.#id = id;
	}

	get isRegistered() {
		return this.#isRegistered;
	}

	onResize(callback: ResizeCallback) {
		this.#resizeCallbacks.push(callback);

		return () => {
			this.#resizeCallbacks = this.#resizeCallbacks.filter((cb) => cb !== callback);
		};
	}

	destroy() {
		// Destroy all the entities.
		const entities = [...this.getEntities()];
		for (let i = 0; i < entities.length; i++) {
			Entity.destroy(entities[i]);
		}

		// Destroy the world.
		deleteWorld(this);
		this.#isRegistered = false;
		this.#resizeCallbacks = [];
		this.#onRegisterCallbacks = [];
		this.#id = -1;
		universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
	}

	add<T extends typeof Component>(component: T | InstanceType<T>) {
		if (typeof component === 'function') {
			addComponent(this, component, this.id);
		} else {
			addComponentInstance(this, component, this.id);
		}
	}

	get<T extends typeof Component>(component: T): InstanceType<T> | undefined {
		return component.get(this.#id);
	}

	remove<T extends typeof Component>(component: T) {
		removeComponent(this, component, this.#id);
	}

	has<T extends typeof Component>(component: T) {
		return hasComponent(this, component, this.#id);
	}

	getEntities() {
		return this[SYMBOLS.$entityArray];
	}

	onRegister(callback: () => void) {
		this.#onRegisterCallbacks.push(callback);

		return () => {
			this.#onRegisterCallbacks = this.#onRegisterCallbacks.filter((cb) => cb !== callback);
		};
	}

	register() {
		// Ensure the world has all the necessary properties.
		// The get wiped if destroy is called.
		defineWorld(this, this.#size);

		// Register to connect it to the universe.
		registerWorld(this);

		// Reset all the Sweet ECS properties.
		this.#id = addPrefab(this);
		this.#isRegistered = true;

		// Call all the callbacks.
		this.#onRegisterCallbacks.forEach((cb) => cb());
		universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
	}

	static define(options?: WorldOptions): World {
		// @ts-expect-error
		return new World(options, true);
	}
}
