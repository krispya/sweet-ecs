import { Schema } from '../types';

export function createExtendedComponentString(schema: Schema) {
	let classDefinition = `
	class ExtendedComponent extends Component {
	  static schema = {};
	  static store = {};
	  static instances = [];

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
		return this.constructor.store['${key}'][this.getEntityId()];
	  }

	  set ${key}(value) {
		this.constructor.store['${key}'][this.getEntityId()] = value;
	  }
	`;
	}

	// Close the class definition
	classDefinition += `};
  ExtendedComponent;
  `;

	return classDefinition;
}
