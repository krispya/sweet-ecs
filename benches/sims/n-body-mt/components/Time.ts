import { Component } from '@sweet-ecs/core';

export class Time extends Component.define({
	then: { type: 'float64', default: performance.now() },
	delta: { type: 'float64', default: 0 },
}) {}
