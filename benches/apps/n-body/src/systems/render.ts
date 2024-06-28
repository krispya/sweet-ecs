import { World } from '@sweet-ecs/core';
import { scene } from '../scene';
import { camera, renderer } from '../main';
import { Mesh } from '../components/Mesh';

let once = false;

export const render = ({ world }: { world: World }) => {
	renderer.render(scene, camera);

	console.log('render: geometries', renderer.info.memory.geometries);

	// const mesh = Mesh.get(1000).object;
	// mesh.geometry.setDrawRange(0, 1000);

	const eids = world.query([Mesh]);

	if (!once) {
		for (let i = 0; i < 1000; i++) {
			const mesh = Mesh.get(eids[i]).object;
			mesh.geometry.setDrawRange(0, 1000);
		}
	}

	once = true;
};
