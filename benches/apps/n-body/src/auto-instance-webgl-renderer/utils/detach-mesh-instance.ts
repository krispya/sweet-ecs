import { BufferAttribute, BufferGeometry, InstancedMesh, Matrix4, Mesh } from 'three';
import { AutoInstanceWebGLRenderer, builtinAttributes } from '../auto-instance-webgl-renderer';
import { unbindMatrix4 } from './bind-matrix4';
import { createTwin } from './create-twin';
import { resetBufferGeometryMethods } from './wrap-buffer-geometry-methods';
import { unbindBufferAttribute } from './bind-buffer-attribute';

const lastMatrix = new Matrix4();

export function detachMeshInstance(
	renderer: AutoInstanceWebGLRenderer,
	mesh: Mesh,
	instancedMesh: InstancedMesh
) {
	const meshes = renderer.registry.get(mesh.userData.hash)!;

	// Reset the methods so there isn't a recusive detaching loop when copying.
	resetBufferGeometryMethods(mesh.geometry);

	// Copy the geometry and unbind the attributes manually.
	copyGeometryWithoutAttributes(mesh.geometry, instancedMesh.geometry);

	for (const name of Object.keys(mesh.geometry.attributes)) {
		if (builtinAttributes.includes(name)) continue;
		unbindBufferAttribute(mesh.geometry.attributes[name] as BufferAttribute);
	}

	// Copy the
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

	// Create twin.
	unbindMatrix4(mesh.matrix);
	createTwin(mesh, renderer);
}

function copyGeometryWithoutAttributes(target: BufferGeometry, source: BufferGeometry) {
	target.index = null;
	target.morphAttributes = {};
	target.groups = [];
	target.boundingBox = null;
	target.boundingSphere = null;

	const data = {};
	target.name = source.name;
	const index = source.index;

	if (index !== null) {
		target.setIndex(index.clone());
	}

	// morph attributes

	const morphAttributes = source.morphAttributes;

	for (const name in morphAttributes) {
		const array = [];
		const morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

		for (let i = 0, l = morphAttribute.length; i < l; i++) {
			array.push(morphAttribute[i].clone(data));
		}

		target.morphAttributes[name] = array;
	}

	target.morphTargetsRelative = source.morphTargetsRelative;

	// groups

	const groups = source.groups;

	for (let i = 0, l = groups.length; i < l; i++) {
		const group = groups[i];
		target.addGroup(group.start, group.count, group.materialIndex);
	}

	// bounding box

	const boundingBox = source.boundingBox;

	if (boundingBox !== null) {
		target.boundingBox = boundingBox.clone();
	}

	// bounding sphere

	const boundingSphere = source.boundingSphere;

	if (boundingSphere !== null) {
		target.boundingSphere = boundingSphere.clone();
	}

	// draw range

	target.drawRange.start = source.drawRange.start;
	target.drawRange.count = source.drawRange.count;

	// user data

	target.userData = source.userData;

	return target;
}
