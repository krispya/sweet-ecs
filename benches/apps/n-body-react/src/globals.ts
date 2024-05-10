import { Component, World } from '@sweet-ecs/core';

export class Time extends Component.define({ current: 0, delta: 0 }) {}
export class Position extends Component.define({ x: 0, y: 0 }) {}
export class Velocity extends Component.define({ x: 0, y: 0 }) {}
export class Mass extends Component.define({ value: 1 }) {}

export const world = new World(100);
