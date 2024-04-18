import { Component } from '@sweet-ecs/core';

export class Workers extends Component.define<{ workers: Record<string, Worker[]> }>() {
	workers: Record<string, Worker[]> = {};
}
