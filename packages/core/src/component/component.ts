import { ComponentConstructor, NormalizedSchema, OmitConstructor, Schema, Store } from './types';
import { createExtendedComponentString } from './utils/create-extended-component-string';
import { createStore } from './utils/create-store';
import { normalizeSchema } from './utils/normalize-schema';

export class Component {
	static schema: Schema = {};
	static normalizedSchema: NormalizedSchema = {};
	static store: Store = {};
	static instances: Component[] = [];

	#entityId: number = 0;

	getEntityId() {
		return this.#entityId;
	}

	setEntityId(entityId: number) {
		this.#entityId = entityId;
		return this;
	}

	static get<T extends ComponentConstructor>(this: T, entityId: number): InstanceType<T> {
		const instance = this.instances[entityId] as InstanceType<T>;
		return instance;
	}

	// Declaraing the accessors on the class definition gives a large performance boost
	// compared to using `defineProperties` on the prototype. So we eval it. However, this
	// requires all the functions and properties to be in the same scope so it is inlined.
	static define<T = {}, TSchema extends Schema = {}>(schema: TSchema = {} as TSchema) {
		type ComponentInstance = Component & {
			[P in keyof TSchema]: TSchema[P];
		} & T;

		const component = eval(createExtendedComponentString(schema));
		component.schema = schema;
		component.normalizedSchema = normalizeSchema(schema);
		component.store = createStore(schema);

		return component as unknown as (new () => ComponentInstance) &
			Omit<OmitConstructor<typeof Component>, 'instances' | 'schema' | 'store'> & {
				store: Store<TSchema>;
				schema: TSchema;
				instances: ComponentInstance[];
			};
	}
}
