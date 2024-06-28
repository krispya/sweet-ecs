import { Color, Euler, Material, Mesh, Texture, TypedArray } from 'three';

// prettier-ignore
const excludedMaterialProps = ['uuid', 'name', 'userData', 'version', 'isMeshBasicMaterial', 'isMaterial'];

export function hashMesh(mesh: Mesh): string {
	const keyItems: any[] = [];

	// Starting with geometry, we sample the indices, each attribute,
	// morph attributes, and draw range.
	if (mesh.geometry.index) {
		keyItems.push(mesh.geometry.index.array.length);
		keyItems.push(sampleArray(mesh.geometry.index.array, 5));
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

	// Next, we hash the material.
	if (Array.isArray(mesh.material)) {
		for (const material of mesh.material) {
			hashMaterial(material, keyItems);
		}
	} else {
		hashMaterial(mesh.material, keyItems);
	}

	return keyItems.join('-');
}

function hashMaterial(material: Material, keyItems: any[]) {
	for (const prop of Object.keys(material)) {
		if (excludedMaterialProps.includes(prop)) continue;

		const value = material[prop as keyof Material];

		if (value instanceof Color) {
			keyItems.push(value.getHex());
			continue;
		}

		if (value instanceof Euler) {
			keyItems.push(...value.toArray());
			continue;
		}

		if (value instanceof Texture) {
			keyItems.push(value.id);
			continue;
		}

		keyItems.push(material[prop as keyof Material]);
	}
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
