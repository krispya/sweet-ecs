import { addComponent as addComponentBit } from 'bitecs';
import { World } from '../../world/world';
import { Component } from '../component';

export function addComponent<T extends typeof Component>(
	world: World,
	component: T,
	entityId: number
) {
	// If the constructor requires arguments, throw an error.
	if (component.length > 0) {
		throw new Error(
			`Cannot add component "${component.name}" to entity ${entityId} because it requires arguments.`
		);
	}

	addComponentBit(world, component, entityId);

	// Create instance.
	component.instances[entityId] = new component().setEntityId(entityId);

	// Set default values.
	for (const key in component.normalizedSchema) {
		if (component.normalizedSchema[key].type === 'constructor') {
			component.store[key][entityId] = new component.normalizedSchema[key].default();
		} else {
			component.store[key][entityId] = component.normalizedSchema[key].default;
		}
	}
}

export function addComponentInstance<T extends Component>(
	world: World,
	instance: T,
	entityId: number
) {
	const component = instance.constructor as typeof Component;
	addComponentBit(world, component, entityId);

	// Make a snapshot of the current values.
	const snapshot: Record<string, any> = {};
	for (const key in component.normalizedSchema) {
		snapshot[key] = instance[key as keyof T];
	}

	// Set instance.
	instance.setEntityId(entityId);
	component.instances[entityId] = instance;

	// Set snapshot values.
	for (const key in snapshot) {
		component.store[key][entityId] = snapshot[key];
	}
}
