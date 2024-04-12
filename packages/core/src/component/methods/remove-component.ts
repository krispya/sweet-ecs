import { removeComponent as removeComponentBit } from '@bitecs/classic';
import { World } from '../../world/world';
import { ComponentConstructor } from '../types';

export function removeComponent(world: World, component: ComponentConstructor, entityId: number) {
	// Remove instance.
	delete component.instances[entityId];
	removeComponentBit(world, component, entityId);
}
