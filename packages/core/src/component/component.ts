import {
	NormalizedSchema,
	PropsFromSchema,
	SoAComponent,
	Schema,
	Store,
	ComponentState,
	ComponentProps,
} from './types';
import { createSoAComponent } from './utils/create-soa-component';
import { createStore } from './utils/create-store';
import { isWorker } from './utils/is-worker';
import { normalizeSchema } from './utils/normalize-schema';
import { $isInitialized, $hierarchy, $entityId, $initialState } from './symbols';

export class Component<T = Record<string, any>> {
	static schema: Schema = {};
	static normalizedSchema: NormalizedSchema = {};
	static store: Store = {};
	static instances: Component[] = [];
	static [$isInitialized] = false;
	static [$hierarchy]: (typeof Component)[] = [];

	[$entityId]: number = 0;
	[$initialState]?: () => ComponentProps<Component>;

	// This is so typeof Component extends any derived constructor.
	constructor(initialState?: ComponentState<Component<T>>);
	constructor(...args: any[]) {
		if (typeof args[0] === 'function') Object.assign(this, args[0]());
		else if (typeof args[0] === 'object') Object.assign(this, args[0]);

		// Make private properties hidden.
		Object.defineProperties(this, {
			[$entityId]: {
				enumerable: false,
				writable: true,
			},
			[$initialState]: {
				enumerable: false,
				writable: true,
			},
		});
	}

	getEntityId() {
		return this[$entityId];
	}

	setEntityId(entityId: number) {
		this[$entityId] = entityId;
		return this;
	}

	set<T extends Component>(this: T, state: ComponentState<T>) {
		if (typeof state === 'function') {
			Object.assign(this, state());
		} else if (typeof state === 'object') {
			Object.assign(this, state);
		}
		return this;
	}

	static get<T extends typeof Component>(this: T, entityId: number): InstanceType<T> {
		const instance = this.instances[entityId] as InstanceType<T>;
		return instance;
	}

	static createSoA<T = {}, TSchema extends Schema = {}>(schema: TSchema = {} as TSchema) {
		const component = createSoAComponent<T, TSchema>(
			schema,
			Component,
			$isInitialized,
			$hierarchy,
			$initialState,
			$entityId
		);
		component.schema = schema;
		component.normalizedSchema = normalizeSchema(schema);
		// Don't create a store for workers. Instead, we hydrate.
		if (!isWorker()) component.store = createStore(schema);

		return component;
	}

	static getInstances<T extends typeof Component>(this: T) {
		return this.instances as InstanceType<T>[];
	}
}
