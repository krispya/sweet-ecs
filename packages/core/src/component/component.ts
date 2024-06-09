import { NormalizedSchema, PropsFromSchema, RecosntructedComponent, Schema, Store } from './types';
import { createExtendedComponentString } from './utils/create-extended-component-string';
import { createStore } from './utils/create-store';
import { isWorker } from './utils/is-worker';
import { normalizeSchema } from './utils/normalize-schema';
import { isInitialized } from './symbols';

export class Component {
	static schema: Schema = {};
	static normalizedSchema: NormalizedSchema = {};
	static store: Store = {};
	static instances: Component[] = [];
	static [isInitialized] = false;

	// This is so typeof Component extends any derived constructor.
	constructor(...args: any[]) {}

	#entityId: number = 0;

	getEntityId() {
		return this.#entityId;
	}

	setEntityId(entityId: number) {
		this.#entityId = entityId;
		return this;
	}

	static get<T extends typeof Component>(this: T, entityId: number): InstanceType<T> {
		const instance = this.instances[entityId] as InstanceType<T>;
		return instance;
	}

	// Declaraing the accessors on the class definition gives a large performance boost
	// compared to using `defineProperties` on the prototype. So we eval it. However, this
	// requires all the functions and properties to be in the same scope so it is inlined.
	static define<T = {}, TSchema extends Schema = {}>(schema: TSchema = {} as TSchema) {
		type ComponentInstance = Component & PropsFromSchema<TSchema> & T;

		const component = eval(createExtendedComponentString(schema));
		component.schema = schema;
		component.normalizedSchema = normalizeSchema(schema);
		// Don't create a store for workers. Instead, we hydrate.
		if (!isWorker()) component.store = createStore(schema);

		return component as unknown as RecosntructedComponent<ComponentInstance, TSchema>;
	}
}
