import { Component } from '@sweet-ecs/core';

export class Workers extends Component.createSoA<{ workers: Record<string, Worker[]> }>() {
	workers: Record<string, Worker[]> = {};
}
