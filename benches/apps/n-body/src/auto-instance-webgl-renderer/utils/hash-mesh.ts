import { Mesh, TypedArray } from 'three';

export function hashMesh(mesh: Mesh): string {
	const keyItems: any[] = [];

	// Starting with geometry, we sample the indices, each attribute,
	// morph attributes, and draw range.
	if (mesh.geometry.index) {
		keyItems.push(mesh.geometry.index.array.length);
		keyItems.push(sampleArray(mesh.geometry.index.array, 3));
	}

	for (const attribute of Object.values(mesh.geometry.attributes)) {
		keyItems.push(attribute.array.length);
		keyItems.push(sampleArray(attribute.array, 3));
	}

	for (const morphAttribute of Object.values(mesh.geometry.morphAttributes)) {
		for (const attribute of morphAttribute) {
			keyItems.push(attribute.array.length);
			keyItems.push(sampleArray(attribute.array, 3));
		}
	}

	keyItems.push(mesh.geometry.drawRange.start);
	keyItems.push(mesh.geometry.drawRange.count);

	// TODO: Material!

	return keyItems.join('-');
}

function sampleArray(array: number[] | TypedArray, sampleRate: number, precision = 4): number[] {
	const length = array.length;
	if (length <= sampleRate) {
		return Array.from(array, (value) => parseFloat(value.toFixed(precision)));
	}

	const step = Math.floor(length / sampleRate);
	return Array.from({ length: sampleRate }, (_, index) => {
		const i = index * step;
		return parseFloat(array[i].toFixed(precision));
	});
}
