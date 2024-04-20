import { Queue } from '..';
import { ComponentConstructor } from '../component/types';
import { World } from './world';

export class WorkerWorld extends World {
	constructor(id: number, size?: number) {
		super(size);
		this.id = id;
	}

	query(components: ComponentConstructor[]): Uint32Array;
	query(components: Queue): Uint32Array;
	query(args: any) {
		self.postMessage({ type: 'query', hash: 'hash', worldId: this.id });
		return new Uint32Array();
	}
}
