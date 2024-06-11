import { Component } from '@sweet-ecs/core';

export class Circle extends Component.createSoA({ radius: 0 }) {
	constructor(initialState: (() => { radius: number }) | number = 0) {
		if (typeof initialState === 'function') {
			super(initialState);
		} else {
			super(() => ({ radius: initialState }));
		}
	}
}
