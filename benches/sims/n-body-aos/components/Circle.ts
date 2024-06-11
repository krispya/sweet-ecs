import { Component, ComponentState } from '@sweet-ecs/core';

export class Circle extends Component {
	declare radius: number;

	constructor(initialState: ComponentState<Circle> | number = 0) {
		if (typeof initialState === 'number') initialState = { radius: initialState };
		super(initialState);
	}
}
