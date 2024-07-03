import { Mesh, Object3D } from 'three';
import { AutoInstanceWebGLRenderer } from '../auto-instance-webgl-renderer';

export function createTwin<T extends Object3D>(target: T, renderer: AutoInstanceWebGLRenderer) {
	let twin: T;

	if (target.constructor === Mesh) {
		twin = new Mesh((target as Mesh).geometry, (target as Mesh).material) as unknown as T;
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
