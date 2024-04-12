import { isSabSupported } from '@bitecs/utils';
import { NormalizedSchemaField, Schema, Store } from '../types';
import { universe } from '../../universe/universe';
import { normalizeSchema } from './normalize-schema';

export function createStore<T extends Schema>(schema: T): Store<T> {
	const normalizedSchema = normalizeSchema(schema);
	const store = {} as any;

	for (const key in schema) {
		if (isTypedArray(normalizedSchema[key])) {
			// Create a SharedArrayBuffer if supported, otherwise create an ArrayBuffer.
			const constructor =
				TypedArrayMap[normalizedSchema[key].type as keyof typeof TypedArrayMap];
			const byteLength = universe.getSize() * constructor.BYTES_PER_ELEMENT;
			const buffer = isSabSupported()
				? new SharedArrayBuffer(byteLength)
				: new ArrayBuffer(byteLength);
			store[key] = new constructor(buffer);

			// Resize the store if the world size changes
			universe.onResize((world, size) => {
				const newBuffer = isSabSupported()
					? new SharedArrayBuffer(size * constructor.BYTES_PER_ELEMENT)
					: new ArrayBuffer(size * constructor.BYTES_PER_ELEMENT);
				const newStore = new constructor(newBuffer);
				newStore.set(store[key]);

				store[key] = newStore;
			});
		} else {
			store[key] = [];
		}
	}

	return store;
}

const TypedArrayMap = {
	float64: Float64Array,
	float32: Float32Array,
	int32: Int32Array,
	int16: Int16Array,
	int8: Int8Array,
	uint32: Uint32Array,
	uint16: Uint16Array,
	uint8: Uint8Array,
	uint8clamped: Uint8ClampedArray,
};

function isTypedArray(field: NormalizedSchemaField) {
	// prettier-ignore
	return field.type === 'float64' || field.type === 'float32' || field.type === 'int32' || field.type === 'int16' || field.type === 'int8' || field.type === 'uint32' || field.type === 'uint16' || field.type === 'uint8' || field.type === 'uint8clamped';
}
