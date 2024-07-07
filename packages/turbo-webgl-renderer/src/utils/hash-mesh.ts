import { Color, Euler, Material, Mesh, Texture, TypedArray } from 'three';
import { EXCLUDED_MAT_PROPS, UNIFORM_MAT_PROPS } from '../constants';

const keyItems: any[] = [];

export function hashMesh(mesh: Mesh): string {
	keyItems.length = 0;

	// Starting with geometry, we sample the indices, each attribute,
	// morph attributes, and draw range.
	if (mesh.geometry.index) {
		keyItems.push(mesh.geometry.index.array.length);
		sampleArray(keyItems, mesh.geometry.index.array, 5);
	}

	for (const attribute of Object.values(mesh.geometry.attributes)) {
		keyItems.push(attribute.array.length);
		sampleArray(keyItems, attribute.array, 3);
	}

	for (const morphAttribute of Object.values(mesh.geometry.morphAttributes)) {
		for (const attribute of morphAttribute) {
			keyItems.push(attribute.array.length);
			sampleArray(keyItems, attribute.array, 3);
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
		if (EXCLUDED_MAT_PROPS.includes(prop)) continue;

		if (UNIFORM_MAT_PROPS.includes(prop)) {
			keyItems.push(prop);
			return;
		}

		const value = material[prop as keyof Material];

		if (value instanceof Color) {
			keyItems.push(value.getHexString());
			continue;
		}

		if (value instanceof Euler) {
			keyItems.push(value.x, value.y, value.z, value.order);
			continue;
		}

		if (value instanceof Texture) {
			keyItems.push(value.id);
			continue;
		}

		keyItems.push(material[prop as keyof Material]);
	}
}

function sampleArray(
	target: string[],
	array: number[] | TypedArray,
	sampleRate: number,
	precision = 4
) {
	const length = array.length;
	if (length <= sampleRate) {
		for (let i = 0; i < length; i++) {
			const value = array[i].toString();
			const cutOff = value.substring(0, precision);
			target.push(cutOff);
		}
	}

	const step = Math.floor(length / sampleRate);
	for (let i = 0; i < sampleRate; i++) {
		const index = i * step;
		const value = array[index].toString();
		const cutOff = value.substring(0, precision);
		target.push(cutOff);
	}
}
