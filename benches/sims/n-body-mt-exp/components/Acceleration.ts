import { Component } from '@sweet-ecs/core';

export class Acceleration extends Component.define({
	x: { type: 'float64' },
	y: { type: 'float64' },
}) {}
