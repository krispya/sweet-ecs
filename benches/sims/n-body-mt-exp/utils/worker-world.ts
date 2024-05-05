import { Queue } from '@sweet-ecs/core';
import { ComponentConstructor } from '@sweet-ecs/core/src/component/types';
import { SweetWorkerScope } from '@sweet-ecs/core/src/world/types';
import { World } from '@sweet-ecs/core/src/world/world';
import { hashComponentsByKey } from './hash-components-by-key';

const getGlobal = () => {
	if (typeof self !== 'undefined') {
		return self;
	} else if (typeof window !== 'undefined') {
		return window;
	} else if (typeof global !== 'undefined') {
		return global;
	} else {
		// Undefined context, could throw an error or handle accordingly
		throw new Error('Unknown context');
	}
};

const _self = getGlobal() as unknown as SweetWorkerScope;

export class WorkerWorld extends World {
	constructor(id: number, size?: number) {
		super(size);
		this.id = id;
	}

	query(components: ComponentConstructor[]): Uint32Array;
	query(components: Queue): Uint32Array;
	query(args: any) {
		const components = Array.isArray(args) ? args : [];

		const hash = hashComponentsByKey(components, _self.componentToKeyMap);

		if (_self.queryBuffers[hash]) {
			const buffer = _self.queryBuffers[hash];
			const entities = getEntitiesFromBuffers(buffer);
			return entities;
		} else {
			console.log('Querying main thread for', components);
			_self.postMessage({ type: 'query', hash });
			return new Uint32Array();
		}
	}
}

function getEntitiesFromBuffers(buffer: SharedArrayBuffer) {
	const view = new Uint32Array(buffer);
	const length = view[0];
	const entities = new Uint32Array(buffer, 4, length);
	return entities;
}
