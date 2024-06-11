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

		constructor(initial) {
			super();
			Object.keys(this.constructor.schema).forEach(key => {
				this[key] = this.constructor.schema[key];
			});
			this[$initialState] = initial
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
