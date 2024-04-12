import { Component } from '@sweet-ecs/core';

export class Circle extends Component.define({ radius: 0 }) {
	// radius = 0;
	// store = (this.constructor as typeof Circle).store;
	// get radius() {
	// 	return this.store.radius[0];
	// }
	// set radius(value: number) {
	// 	this.store.radius[0] = value;
	// }
}
