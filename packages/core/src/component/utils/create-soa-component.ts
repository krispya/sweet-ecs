import { Component, Component as ComponentCore } from '../component';
import { PropsFromSchema, Schema, SoAComponent } from '../types';

type ComponentInstance<T = {}, TSchema extends Schema = {}> = Component &
	PropsFromSchema<TSchema> &
	T;

// Evaling the class definition with static keys optimizes performance.

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

			if (initialState !== undefined) {
				if (typeof initialState === 'function') {
					this[$initialState] = initialState;	
				} else if (typeof initialState === 'object') {
					this[$initialState] = () => initialState;
				}
			}
		`;

	// Add getters/setters to the instance so they are enumberable.
	for (const key in schema) {
		classDefinition += `Object.defineProperty(this, '${key}', {
			get() {
				return this.constructor.store['${key}'][this[$entityId]];
			},
			set(value) {
				this.constructor.store['${key}'][this[$entityId]] = value;
			},
			enumerable: true,
		});
		`;
	}

	classDefinition += `}

		set(state) {
			if (typeof state === 'function') state = state();
			for (const key in state) {
				instance[key] = state[key];
			}
			return this;
		}
	};
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
