import { Component } from '@sweet-ecs/core';

export class Circle extends Component.define({ radius: 0 }) {
	constructor(radius = 0) {
		super();
		this.radius = radius;
	}
}
