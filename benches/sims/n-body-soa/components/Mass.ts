import { Component, ComponentState } from '@sweet-ecs/core';

export class Mass extends Component.createSoA({ value: 0 }) {
	constructor(initialState?: ComponentState<Mass> | number) {
		if (typeof initialState === 'number') initialState = { value: initialState };
		super(initialState);
	}
}
