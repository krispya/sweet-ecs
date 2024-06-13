import { Component } from '@sweet-ecs/core';

export class Acceleration extends Component.createSoA({ x: { type: 'f64' }, y: { type: 'f64' } }) {}
