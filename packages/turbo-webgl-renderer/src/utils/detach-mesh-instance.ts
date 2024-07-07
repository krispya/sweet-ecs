import { BufferAttribute, InstancedMesh, Matrix4, Mesh } from 'three';
import { TurboWebGLRenderer } from '../turbo-webgl-renderer';
import { bindMatrix4, unbindMatrix4 } from './bind-matrix4';
import { createTwin } from './create-twin';
import { resetBufferGeometryMethods } from './wrap-buffer-geometry-methods';
import { resetBufferAttribute } from './wrap-buffer-attribute';

const lastMatrix = new Matrix4();

export function detachMeshInstance(
	renderer: TurboWebGLRenderer,
	mesh: Mesh,
	instancedMesh: InstancedMesh,
	isShared: { geometry: boolean; material: boolean } = { geometry: false, material: false }
) {
	const meshes = renderer.registries.get(mesh.userData.hash)!;

	// Reset the methods so there isn't a recusive detaching loop when copying.
	resetBufferGeometryMethods(mesh.geometry);

	for (const name in mesh.geometry.attributes) {
		const attribute = mesh.geometry.attributes[name] as BufferAttribute;
		resetBufferAttribute(attribute);
	}

	// Copy the geometry if it is not shared.
	// Materials are not bound so we don't need to touch them.
	if (!isShared.geometry) mesh.geometry.copy(instancedMesh.geometry);

	// Unbind the matrix before the ID is swapped.
	unbindMatrix4(mesh.matrixWorld);

	// Remove the instance. Reduce the count and swap.
	const lastId = instancedMesh.count - 1;
	const lastMesh = meshes.array[lastId];
	instancedMesh.getMatrixAt(lastId, lastMatrix);
	instancedMesh.setMatrixAt(mesh.userData.instanceId, lastMatrix);
	instancedMesh.count = lastId;
	instancedMesh.instanceMatrix.needsUpdate = true;

	// Swap the last mesh with the mesh we are detaching.
	meshes.array[mesh.userData.instanceId] = lastMesh;
	lastMesh.userData.instanceId = mesh.userData.instanceId;

	// Rebind the world matrix.
	bindMatrix4(instancedMesh, mesh.userData.instanceId, lastMesh.matrixWorld);

	// Remove from the registry.
	meshes.set.delete(mesh);
	meshes.array.pop();

	// Create twin.
	createTwin(mesh, renderer);
}
