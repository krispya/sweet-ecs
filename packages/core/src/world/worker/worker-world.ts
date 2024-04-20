import { Queue, hashComponentsByKey } from '../..';
import { ComponentConstructor } from '../../component/types';
import { SweetWorkerScope } from '../types';
import { World } from '../world';

const _self = self as unknown as SweetWorkerScope;

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
