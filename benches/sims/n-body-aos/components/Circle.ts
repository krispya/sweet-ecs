import { Component } from '@sweet-ecs/core';

export class Circle extends Component {
	radius = 0;

	constructor(initialState: (() => { radius: number }) | number = 0) {
		super();
		if (typeof initialState === 'function') {
			this.radius = initialState().radius;
		} else {
			this.radius = initialState;
		}
	}
}
