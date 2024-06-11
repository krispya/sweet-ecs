import { Component } from '@sweet-ecs/core';

export class Time extends Component {
	constructor(public then = 0, public delta = 0) {
		super();
	}
}
