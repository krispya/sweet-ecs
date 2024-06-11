import { Component, ComponentState } from '@sweet-ecs/core';

export class Position extends Component {
	declare x: number;
	declare y: number;

	constructor(initialState: ComponentState<Position> = { x: 0, y: 0 }) {
		super(initialState);
	}
}
