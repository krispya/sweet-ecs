import { Component } from '@sweet-ecs/core';

export class Circle extends Component.createSoA({ radius: { type: 'float64' } }) {}
