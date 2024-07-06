import { BufferAttribute, InstancedBufferAttribute } from 'three';

export const builtinAttributes = ['position', 'uv', 'normal', 'color'];

export function bindBufferAttribute(
	instanceAttribute: InstancedBufferAttribute,
	id: number,
	attribute: BufferAttribute
) {
	const array = instanceAttribute.array.subarray(
		id * attribute.itemSize,
		id * attribute.itemSize + attribute.itemSize
	);

	// Copy the attribute elements into the buffer subarray.
	for (let i = 0; i < attribute.itemSize; i++) {
		array[i] = attribute.array[i];
	}

	attribute.array = array;

	// Add an accessor to the bound attribute for needsUpdate.
	Object.defineProperty(attribute, 'needsUpdate', {
		get() {
			return instanceAttribute.needsUpdate;
		},
		set(value: boolean) {
			instanceAttribute.needsUpdate = value;
		},
		configurable: true,
	});
}

export function unbindBufferAttribute(attribute: BufferAttribute) {
	// Replace the accessor with the original needsUpdate property.
	Object.defineProperty(attribute, 'needsUpdate', {
		value: attribute.needsUpdate,
		writable: true,
		configurable: true,
	});

	// Reset the array.
	attribute.array = attribute.array.slice();

	return attribute;
}
