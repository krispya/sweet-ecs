import { Material } from 'three';

const uniform = ['color', 'opacity', 'alphaTest', 'emissive'];
const exclude = ['uuid', 'id', 'userData', 'version'];
const allExclude = [...uniform, ...exclude];

export function bindMaterial(material: Material) {
	// Replace all properties that are NOT methods with a setter that console logs
	// Ignore allExlude properties
	for (const prop in material) {
		if (allExclude.includes(prop)) continue;

		const value = material[prop as keyof Material];
		Object.defineProperty(material, prop, {
			get() {
				return value;
			},
			set(value: any) {
				console.log(`Setting ${prop} to ${value}`);
			},
			configurable: true,
		});
	}
}
