import { Component } from '@sweet-ecs/core';

export class Color extends Component.define({
	r: { type: 'uint8' },
	g: { type: 'uint8' },
	b: { type: 'uint8' },
	a: { type: 'uint8' },
}) {}
