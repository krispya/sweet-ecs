import { Component } from '@sweet-ecs/core';

export class Position extends Component.define({ x: 0, y: 0 }) {
	// x = 0;
	// y = 0;
	// store = (this.constructor as typeof Position).store;
	// get x() {
	// 	return this.store.x[0];
	// }
	// set x(value: number) {
	// 	this.store.x[0] = value;
	// }
	// get y() {
	// 	return this.store.y[0];
	// }
	// set y(value: number) {
	// 	this.store.y[0] = value;
	// }
}
