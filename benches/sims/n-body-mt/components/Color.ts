import { Component } from '@sweet-ecs/core';

export class Color extends Component.define({
	r: Uint8Array,
	g: Uint8Array,
	b: Uint8Array,
	a: Uint8Array,
}) {}
