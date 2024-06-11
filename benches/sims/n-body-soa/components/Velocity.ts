import { Component, ComponentState } from '@sweet-ecs/core';

export class Velocity extends Component.createSoA({ x: 0, y: 0 }) {
	constructor(initialState?: ComponentState<Velocity>) {
		super(initialState);
	}
}
