import { addComponent as addComponentBit, IsA } from 'bitecs';
import { World } from '../../world/world';
import { Component } from '../component';
import { $isInitialized, $hierarchy, $initialState } from '../symbols';

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

	initialize(component);
	addComponentBit(world, component, entityId);

	// Create instance.
	component.instances[entityId] = new component().setEntityId(entityId);

	// Set SoA default values.
	if (Object.keys(component.normalizedSchema).length > 0) setSoADefaults<T>(component, entityId);
}

export function addComponentInstance<T extends Component>(
	world: World,
	instance: T,
	entityId: number
) {
	const component = instance.constructor as typeof Component;

	initialize(component);
	addComponentBit(world, component, entityId);

	// Set instance.
	instance.setEntityId(entityId);
	component.instances[entityId] = instance;

	// Set SoA default values.
	if (Object.keys(component.normalizedSchema).length > 0) {
		setSoADefaults(component, entityId);

		if (instance[$initialState]) {
			const initial = instance[$initialState]();
			for (const key in initial) {
				(instance as Record<string, any>)[key] = (initial as Record<string, any>)[key];
			}
		}
	}
}

function initialize(component: typeof Component) {
	if (Object.hasOwn(component, $isInitialized) === false) {
		component.instances = [];
		component[$isInitialized] = true;

		let proto = Object.getPrototypeOf(component);
		while (Object.hasOwn(proto, $isInitialized) === true && proto !== Component) {
			component[$hierarchy].push(proto);
			proto = Object.getPrototypeOf(proto);
		}
	}
}

function setSoADefaults<T extends typeof Component = typeof Component>(
	component: T,
	entityId: number
) {
	for (const key in component.normalizedSchema) {
		if (component.normalizedSchema[key].type === 'constructor') {
			component.store[key][entityId] = new component.normalizedSchema[key].default();
		} else {
			component.store[key][entityId] = component.normalizedSchema[key].default;
		}
	}
}
