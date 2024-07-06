import { Mesh, Scene } from 'three';
import { MeshRegistry } from '../types';
import { hashMesh } from './hash-mesh';
import { TurboWebGLRenderer } from '../turbo-webgl-renderer';
import { createTwin } from './create-twin';

export function createMeshRegistry(
	scene: Scene,
	registry: Map<string, MeshRegistry>,
	renderer: TurboWebGLRenderer
) {
	scene.traverse((child) => {
		// Don't process the scene itself.
		if (child instanceof Scene) return;

		if (child instanceof Mesh) {
			const hash = hashMesh(child);

			if (!registry.has(hash)) {
				registry.set(hash, {
					set: new Set(),
					array: [],
					isShared: { geometry: true, material: true },
					hash,
					isMaterialArray: Array.isArray(child.material),
					isIgnored: !!child.userData.ignore,
				});
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
