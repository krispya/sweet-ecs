import { Schema } from '../types';

export function createExtendedComponentString(schema: Schema) {
	let classDefinition = `
	class ExtendedComponent extends Component {
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
  	ExtendedComponent;
  	`;

	return classDefinition;
}
