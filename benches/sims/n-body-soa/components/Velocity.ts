import { Component } from '@sweet-ecs/core';

export class Velocity extends Component.createSoA({ x: 0, y: 0 }) {
	constructor(
		initial: (() => { x: number; y: number }) | { x: number; y: number } = () => ({ x: 0, y: 0 })
	) {
		if (typeof initial === 'function') {
			super(initial);
		} else {
			super(() => initial);
		}
	}
}
