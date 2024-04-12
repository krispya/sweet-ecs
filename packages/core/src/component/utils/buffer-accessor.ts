import { PlayEntityId } from '../../entity/types';
import { TypedArray } from '../../types/game-types';

export class BufferAccessor {
	public buffer: TypedArray;
	public entityId: PlayEntityId;

	constructor(buffer: TypedArray, entityId: PlayEntityId) {
		this.buffer = buffer;
		this.entityId = entityId;
	}

	read() {
		return this.buffer[this.entityId];
	}

	write(value: number) {
		this.buffer[this.entityId] = value;
	}
}
