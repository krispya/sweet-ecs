import { InstancedMesh, Matrix4, Mesh } from 'three';
import { AutoInstanceWebGLRenderer } from '../auto-instance-webgl-renderer';
import { resetBufferGeometryMethods } from './wrap-buffer-geometry-methods';
import { createTwin } from './create-twin';

const lastMatrix = new Matrix4();

export function detachMeshInstance(
	renderer: AutoInstanceWebGLRenderer,
	mesh: Mesh,
	instancedMesh: InstancedMesh
) {
	const meshes = renderer.registry.get(mesh.userData.hash)!;

	resetBufferGeometryMethods(mesh.geometry);
	mesh.geometry.copy(instancedMesh.geometry);
	if (!Array.isArray(mesh.material) && !Array.isArray(instancedMesh.material)) {
		mesh.material.copy(instancedMesh.material);
	}

	// Remove the instance. Reduce the count and swap.
	const lastId = instancedMesh.count - 1;
	const lastMesh = meshes.array[lastId];
	instancedMesh.getMatrixAt(lastId, lastMatrix);
	instancedMesh.setMatrixAt(mesh.userData.instanceId, lastMatrix);
	instancedMesh.count = lastId;

	// Swap the last mesh with the mesh we are detaching.
	meshes.array[mesh.userData.instanceId] = lastMesh;
	lastMesh.userData.instanceId = mesh.userData.instanceId;

	// Remove from the registry.
	meshes.set.delete(mesh);
	meshes.array.splice(mesh.userData.instanceId, 1);

	createTwin(mesh, renderer);
}
