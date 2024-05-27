import { removeComponent as removeComponentBit } from '@bitecs/classic';
import { World } from '../../world/world';
import { Component } from '../component';

export function removeComponent(world: World, component: typeof Component, entityId: number) {
	// Remove instance.
	delete component.instances[entityId];
	removeComponentBit(world, component, entityId);
}
