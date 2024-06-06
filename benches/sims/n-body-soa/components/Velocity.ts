import { Component } from '@sweet-ecs/core';

export class Velocity extends Component.define({ x: 0, y: 0 }) {
	constructor(x = 0, y = 0) {
		super();
		this.x = x;
		this.y = y;
	}
}
