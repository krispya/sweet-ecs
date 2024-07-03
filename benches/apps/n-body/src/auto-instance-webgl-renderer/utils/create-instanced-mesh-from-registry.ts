import { Material, InstancedMesh } from 'three';
import { DerivedBufferGeometry } from '../instanced-uniform-mesh/derived-objects/derived-buffer-geometry';
import { createInstancedUniformsDerivedMaterial } from '../instanced-uniform-mesh/derived-objects/instanced-uniform-derived-material';
import { InstancedUniformsMesh } from '../instanced-uniform-mesh/instanced-uniform-mesh';
import { MeshRegistry } from '../types';
import { nearestPowerOfTwo } from './nearest-power-of-two';

export function createInstancedMeshFromRegistry(meshRegistry: MeshRegistry) {
	// Use the first mesh to create the instanced mesh.
	const mesh = meshRegistry.array[0];

	let isShared = true;
	let geometry = mesh.geometry;
	let material = mesh.material;

	if (!meshRegistry.isShared.geometry) {
		geometry = mesh.geometry.clone();
		isShared = false;
	}

	if (!meshRegistry.isShared.material) {
		material = (mesh.material as Material).clone();
		isShared = false;
	}

	let instancedMesh: InstancedMesh;

	if (isShared) {
		instancedMesh = new InstancedMesh(
			geometry,
			material,
			nearestPowerOfTwo(meshRegistry.array.length)
		);
	} else {
		instancedMesh = new InstancedUniformsMesh(
			new DerivedBufferGeometry(geometry),
			createInstancedUniformsDerivedMaterial(material as Material),
			nearestPowerOfTwo(meshRegistry.array.length)
		);
	}

	instancedMesh.count = meshRegistry.array.length;
	instancedMesh.name = meshRegistry.hash;

	return instancedMesh;
}
