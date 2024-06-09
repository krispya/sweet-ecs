import { Schema } from '../types';
import { isInitialized, hierarchy } from '../symbols';

export function createExtendedComponentString(schema: Schema) {
	let classDefinition = `
	class ExtendedComponent extends Component {
	  static schema = {};
	  static store = {};
	  static instances = [];
	  static [isInitialized] = true;
	  static [hierarchy] = [];

	  constructor() {
		super();
		Object.keys(this.constructor.schema).forEach(key => {
		  this[key] = this.constructor.schema[key];
		});
	  }
  	`;

	// Dynamically add getters and setters for each schema property.
	for (const key of Object.keys(schema)) {
		classDefinition += `
	  get ${key}() {
		return this.constructor.store['${key}'][this.#entityId];
	  }

	  set ${key}(value) {
		this.constructor.store['${key}'][this.#entityId] = value;
	  }
	`;
	}

	classDefinition += `};
  	ExtendedComponent;
  	`;

	return classDefinition;
}
