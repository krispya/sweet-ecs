import { BufferAttribute } from 'three';

export function wrapBufferAttribute(
	attribute: BufferAttribute,
	callback: () => void
): BufferAttribute {
	// Replace needsUpdate with a getter/setter that calls the callback.
	Object.defineProperties(attribute, {
		_needsUpdate: {
			value: attribute.needsUpdate,
			writable: true,
			configurable: true,
		},
		needsUpdate: {
			get() {
				return this._needsUpdate;
			},
			set(value) {
				this._needsUpdate = value;
				callback();
			},
			configurable: true,
		},
	});

	return attribute;
}

export function resetBufferAttribute(attribute: BufferAttribute): BufferAttribute {
	// Reset needsUpdate to the original value.
	Object.defineProperty(attribute, 'needsUpdate', {
		value: (attribute as any)._needsUpdate,
		writable: true,
		configurable: true,
	});

	delete (attribute as any)._needsUpdate;

	return attribute;
}
