import { Mesh } from 'three';
import { AutoInstanceWebGLRenderer } from '../auto-instance-webgl-renderer';

export function createTwin(mesh: Mesh, renderer: AutoInstanceWebGLRenderer) {
	const twin = new Mesh(mesh.geometry, mesh.material);
	mesh.userData.instanceId = -1;

	// Copy matrices from the original mesh by ref so that the twin is always synced.
	twin.matrix = mesh.matrix;
	twin.matrixWorld = mesh.matrixWorld;

	renderer.twins.set(mesh, twin);
	renderer.transformedScene.add(twin);
}
