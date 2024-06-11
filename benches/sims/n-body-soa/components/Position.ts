import { Component, ComponentState } from '@sweet-ecs/core';

export class Position extends Component.createSoA({ x: 0, y: 0 }) {
	constructor(initialState?: ComponentState<Position>) {
		super(initialState);
	}
}
