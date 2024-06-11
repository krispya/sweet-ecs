import { Component, ComponentState } from '@sweet-ecs/core';

export class Circle extends Component.createSoA({ radius: 0 }) {
	constructor(initialState?: ComponentState<Circle> | number) {
		if (typeof initialState === 'number') initialState = { radius: initialState };
		super(initialState);
	}
}
