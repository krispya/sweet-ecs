import { Component } from '@sweet-ecs/core';

export class Color extends Component {
	constructor(public r = 0, public g = 0, public b = 0, public a = 0) {
		super();
	}
}
