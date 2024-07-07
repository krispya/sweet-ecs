import { Mesh, Object3D, Scene } from 'three';
import { hashMesh } from './hash-mesh';
import { TurboWebGLRenderer } from '../turbo-webgl-renderer';
import { createTwin } from './create-twin';

export class MeshRegistry {
	set: Set<Mesh> = new Set();
	array: Mesh[] = [];
	isShared: {
		geometry: boolean;
		material: boolean;
	} = { geometry: false, material: false };
	hash: string = '';
	isMaterialArray: boolean = false;
	isIgnored: boolean = false;

	constructor(props: Partial<MeshRegistry>) {
		Object.assign(this, props);
	}
}

export function updateRegistry(
	object3D: Object3D,
	registry: Map<string, MeshRegistry>,
	renderer: TurboWebGLRenderer
) {
	object3D.traverse((child) => {
		// Don't process the scene itself.
		if (child instanceof Scene) return;

		if (child instanceof Mesh) {
			const hash = hashMesh(child);

			if (!registry.has(hash)) {
				registry.set(
					hash,
					new MeshRegistry({
						hash,
						isMaterialArray: Array.isArray(child.material),
						isIgnored: !!child.userData.ignore,
						isShared: { geometry: true, material: true },
					})
				);
			}

			const meshRegistry = registry.get(hash)!;

			let isShared = { geometry: false, material: false };
			if (meshRegistry.set.size > 0) {
				const first = meshRegistry.array[0];
				isShared = {
					geometry: first.geometry === child.geometry,
					material: first.material === child.material,
				};
			}

			meshRegistry.set.add(child);
			meshRegistry.array.push(child);
			meshRegistry.isShared = isShared;

			child.userData.hash = hash;
		} else {
			// Create a twin.
			createTwin(child, renderer);
		}
	});
}
