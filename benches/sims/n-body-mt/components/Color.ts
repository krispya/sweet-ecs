import { Component } from '@sweet-ecs/core';

export class Color extends Component.createSoA({
	r: { type: 'ui8' },
	g: { type: 'ui8' },
	b: { type: 'ui8' },
	a: { type: 'ui8' },
}) {}
