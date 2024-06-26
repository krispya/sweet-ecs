import { CONSTANTS, Mass, Position, Velocity } from '@sim/n-body';
import { Entity, World } from '@sweet-ecs/core';
import * as THREE from 'three';
import { InstancedMesh } from '../components/ThreeInstances';
import { scene } from '../scene';
import { Mesh } from '../components/Mesh';

let inited = false;

export function init({ world }: { world: World }) {
	if (inited) return;

	// Init the instances meshes for Three.
	// const eid = Entity.in(world);

	// I'm not sure why it matters, but you can't set iniitial radius to 1 or everything is invisible.
	// const geometry = new THREE.CircleGeometry(CONSTANTS.MAX_RADIUS / 1.5, 12);
	// const material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1, 1, 1) });
	// const instancedMesh = new THREE.InstancedMesh(geometry, material, CONSTANTS.NBODIES);

	// scene.add(instancedMesh);
	// Entity.add(new InstancedMesh(instancedMesh), eid);

	const eids = world.query([Position, Velocity, Mass]);

	for (const eid of eids) {
		const bodyGeo = new THREE.CircleGeometry(CONSTANTS.MAX_RADIUS / 1.5, 12);
		bodyGeo.name = 'body-geometry';

		const bodyMat = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1, 1, 1) });
		bodyMat.name = 'body-material';

		const mesh = new THREE.Mesh(bodyGeo, bodyMat);

		scene.add(mesh);
		Entity.add(new Mesh(mesh), eid);
	}

	inited = true;
}
