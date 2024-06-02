import { hasComponent as hasComponentBit } from 'bitecs';
import { World } from '../../world/world';
import { Component } from '../component';

export function hasComponent(world: World, component: typeof Component, entityId: number) {
	return hasComponentBit(world, component, entityId);
}
