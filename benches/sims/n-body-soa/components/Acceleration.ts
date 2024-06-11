import { Component } from '@sweet-ecs/core';

export class Acceleration extends Component.createSoA({ x: 0, y: 0 }) {
	constructor(x = 0, y = 0) {
		super(() => ({ x, y }));
	}
}
