import { Component, ComponentState } from '@sweet-ecs/core';

export class Velocity extends Component {
	declare x: number;
	declare y: number;

	constructor(initialState: ComponentState<Velocity> = { x: 0, y: 0 }) {
		super(initialState);
	}
}
