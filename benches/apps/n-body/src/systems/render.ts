import { World } from '@sweet-ecs/core';
import { scene } from '../scene';
import { camera, renderer } from '../main';
import { Mesh } from '../components/Mesh';

export const render = (_props: { world: World }) => {
	renderer.render(scene, camera);

	const mesh = Mesh.get(1000).object;

	console.log(
		'render: geometries',
		renderer.info.memory.geometries,
		'size',
		renderer.registry.get(mesh.userData.hash)?.array.length,
		renderer.registry.get(mesh.userData.hash)?.set.size
	);

	mesh.geometry.setDrawRange(0, 1000);
};
