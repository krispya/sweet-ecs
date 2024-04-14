import {
	createWorld,
	type World as bitWorld,
	resetWorld,
	Query,
	SYMBOLS,
	deleteWorld,
} from '@bitecs/classic';
import { ResizeCallback } from './types';
import { universe, universeResizeCallbacks } from '../universe/universe';

export interface World extends bitWorld {}

export class World {
	#resizeCallbacks: ResizeCallback[] = [];

	constructor(size?: number) {
		createWorld(this, size);
		universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
	}

	reset() {
		resetWorld(this, this.size);
	}

	query(query: Query) {
		return query(this);
	}

	get size() {
		return this[SYMBOLS.$size];
	}

	set size(size: number) {
		this[SYMBOLS.$size] = size;
		this.#resizeCallbacks.forEach((cb) => cb(this, size));
		universeResizeCallbacks.forEach((cb) => cb(this, universe.getSize()));
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
}
