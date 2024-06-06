import { Component } from '@sweet-ecs/core';

export class Mass extends Component.define({ value: 0 }) {
	constructor(value = 0) {
		super();
		this.value = value;
	}
}
