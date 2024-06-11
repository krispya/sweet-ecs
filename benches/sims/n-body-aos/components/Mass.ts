import { Component } from '@sweet-ecs/core';

export class Mass extends Component {
	constructor(public value = 0) {
		super();
	}
}
