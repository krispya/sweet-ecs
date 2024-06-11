import { Component } from '../component';

export function setSoADefaults<T extends typeof Component = typeof Component>(
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
