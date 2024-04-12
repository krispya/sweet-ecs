import { addComponent as addComponentBit } from '@bitecs/classic';
import { World } from '../../world/world';
import { ComponentArgs, ComponentConstructor } from '../types';

export function addComponent<T extends ComponentConstructor>(
	world: World,
	component: T,
	entityId: number,
	...args: ComponentArgs<T>
) {
	addComponentBit(world, component, entityId);

	// Create instance.
	const _args = args[0] || [];
	component.instances[entityId] = new component(..._args).setEntityId(entityId);

	// Set default values.
	for (const key in component.normalizedSchema) {
		if (component.normalizedSchema[key].type === 'constructor') {
			component.store[key][entityId] = new component.normalizedSchema[key].default();
		} else {
			component.store[key][entityId] = component.normalizedSchema[key].default;
		}
	}
}
