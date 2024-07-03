import { Scene, Mesh, InstancedMesh } from 'three';
import { MeshRegistry } from '../types';
import { hashMesh } from './hash-mesh';

export function createMeshRegistry(scene: Scene, registry: Map<string, MeshRegistry>) {
	scene.traverse((child) => {
		if (!(child instanceof Mesh) || child instanceof InstancedMesh) return;

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
	});
}
