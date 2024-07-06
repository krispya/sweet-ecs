import { InstancedMesh, Mesh, Object3D } from 'three';
import { TurboWebGLRenderer } from '../turbo-webgl-renderer';
import { bindInstancedMesh } from './bind-instanced-mesh';

export function createTwin<T extends Object3D>(target: T, renderer: TurboWebGLRenderer) {
	let twin: T;

	if (target.constructor === Mesh) {
		const mesh = target as Mesh;
		twin = new Mesh(mesh.geometry, mesh.material) as unknown as T;
	} else if (target.constructor === InstancedMesh) {
		const instancedMesh = target as InstancedMesh;
		const twinInstancedMesh = new InstancedMesh(
			instancedMesh.geometry,
			instancedMesh.material,
			0
		);
		bindInstancedMesh(instancedMesh, twinInstancedMesh);

		twin = twinInstancedMesh as unknown as T;
	} else {
		// @ts-expect-error
		twin = new target.constructor();
		twin.copy(target);
	}

	target.userData.instanceId = -1;
	target.userData.twin = twin;

	// Copy matrices from the original mesh by ref so that the twin is always synced.
	twin.matrix = target.matrix;
	twin.matrixWorld = target.matrixWorld;
	twin.matrixAutoUpdate = false;
	twin.matrixWorldAutoUpdate = false;
	twin.userData.twinOf = target;

	renderer.twins.set(target, twin);
	renderer.renderScene.add(twin);
}
