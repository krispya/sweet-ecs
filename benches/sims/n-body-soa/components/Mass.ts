import { Component } from '@sweet-ecs/core';

export class Mass extends Component.createSoA({ value: 0 }) {
	constructor(value = 0) {
		super(() => ({ value }));
	}
}
