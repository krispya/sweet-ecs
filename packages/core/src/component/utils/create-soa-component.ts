import { Component, Component as ComponentCore } from '../component';
import { PropsFromSchema, Schema, SoAComponent } from '../types';

type ComponentInstance<T = {}, TSchema extends Schema = {}> = Component &
	PropsFromSchema<TSchema> &
	T;

// Declaraing the accessors on the class definition gives a large performance boost
// compared to using `defineProperties` on the prototype. So we eval it.

export function createSoAComponent<T = {}, TSchema extends Schema = {}>(
	schema: TSchema,
	Component: typeof ComponentCore,
	$isInitialized: symbol,
	$hierarchy: symbol,
	$initialState: symbol,
	$entityId: symbol
): SoAComponent<ComponentInstance<T, TSchema>, TSchema> {
	let classDefinition = `
	'use strict';
	class SoAComponent extends Component {
		static schema = {};
		static normalizedSchema = {};
		static store = {};
		static instances = [];
		static [$isInitialized] = true;
		static [$hierarchy] = [];

		constructor(initialState) {
			super();
			Object.keys(this.constructor.schema).forEach(key => {
				this[key] = this.constructor.schema[key];
			});

			if (typeof initialState === 'function') {
				this[$initialState] = initialState;	
			} else if (typeof initialState === 'object') {
				this[$initialState] = () => initialState;
			}
		}

		set(state) {
			if (typeof state === 'function') state = state();
			for (const key in state) {
				instance[key] = state[key];
			}
			return this;
		}
  	`;

	// Dynamically add getters and setters for each schema property.
	for (const key of Object.keys(schema)) {
		classDefinition += `
		get ${key}() {
			return this.constructor.store['${key}'][this[$entityId]];
		}

		set ${key}(value) {
			this.constructor.store['${key}'][this[$entityId]] = value;
		}
	`;
	}

	classDefinition += `};
  	return SoAComponent;
  	`;

	// return classDefinition;
	return new Function(
		'schema',
		'Component',
		'$isInitialized',
		'$hierarchy',
		'$initialState',
		'$entityId',
		classDefinition
	)(schema, Component, $isInitialized, $hierarchy, $initialState, $entityId) as SoAComponent<
		ComponentInstance<T, TSchema>,
		TSchema
	>;
}
