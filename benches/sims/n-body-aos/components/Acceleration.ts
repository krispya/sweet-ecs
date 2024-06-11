import { Component } from '@sweet-ecs/core';

export class Acceleration extends Component {
	constructor(public x = 0, public y = 0) {
		super();
	}
}
