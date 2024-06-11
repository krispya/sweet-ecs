import { Component } from '@sweet-ecs/core';

export class Velocity extends Component {
	x = 0;
	y = 0;

	constructor(
		initialState: (() => { x: number; y: number }) | { x: number; y: number } = { x: 0, y: 0 }
	) {
		super();

		if (typeof initialState === 'function') {
			this.x = initialState().x;
			this.y = initialState().y;
		} else {
			this.x = initialState.x;
			this.y = initialState.y;
		}
	}
}
