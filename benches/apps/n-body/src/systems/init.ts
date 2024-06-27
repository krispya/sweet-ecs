import { CONSTANTS, Mass, Position, Velocity } from '@sim/n-body';
import { Entity, World } from '@sweet-ecs/core';
import * as THREE from 'three';
import { Mesh } from '../components/Mesh';
import { scene } from '../scene';

let inited = false;

export function init({ world }: { world: World }) {
	if (inited) return;

	const eids = world.query([Position, Velocity, Mass]);

	for (const eid of eids) {
		const bodyGeo = new THREE.CircleGeometry(CONSTANTS.MAX_RADIUS / 1.5, 12);
		bodyGeo.name = 'body-geometry';
		bodyGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(3), 3));

		const bodyMat = new THREE.MeshBasicMaterial({
			color: new THREE.Color().setRGB(1, 1, 1),
			vertexColors: true,
		});
		bodyMat.name = 'body-material';

		const mesh = new THREE.Mesh(bodyGeo, bodyMat);

		scene.add(mesh);
		Entity.add(new Mesh(mesh), eid);
	}

	inited = true;
}
