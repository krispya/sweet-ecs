import { Component } from '@sweet-ecs/core';

export class Velocity extends Component.createSoA({
	x: { type: 'float64' },
	y: { type: 'float64' },
}) {}
