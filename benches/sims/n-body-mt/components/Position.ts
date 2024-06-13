import { Component, ComponentState } from '@sweet-ecs/core';

export class Position extends Component.createSoA({ x: { type: 'f64' }, y: { type: 'f64' } }) {
	constructor(initialState?: ComponentState<Position>) {
		super(initialState);
	}
}
