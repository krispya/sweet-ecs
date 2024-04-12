import { Component } from '@sweet-ecs/core';

export class Mass extends Component.define({ value: 0 }) {
	// value = 0;
	// store = (this.constructor as typeof Mass).store;
	// get value() {
	// 	return this.store.value[0];
	// }
	// set value(value: number) {
	// 	this.store.value[0] = value;
	// }
}
