import { CONSTANTS, Mass, Position, Velocity } from '@sim/n-body';
import { Entity, World } from '@sweet-ecs/core';
import * as THREE from 'three';
import { Mesh } from '../components/Mesh';
import { scene } from '../scene';
import { camera, renderer } from '../main';

let inited = false;

export function init({ world }: { world: World }) {
	if (inited) return;

	const eids = world.query([Position, Velocity, Mass]);

	const geometry = new THREE.CircleGeometry(CONSTANTS.MAX_RADIUS / 1.5, 12);
	geometry.name = 'body-geometry';
	geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(3), 3));
	geometry.attributes.color.setXYZ(0, 1, 1, 1);

	for (const eid of eids) {
		const material = new THREE.MeshBasicMaterial({
			color: new THREE.Color().setRGB(1, 1, 1),
			vertexColors: true,
		});
		material.name = 'body-material';

		// Set unique color for each body.
		material.color.setHSL(Math.random(), 1, 0.5);

		const mesh = new THREE.Mesh(geometry, material);

		scene.add(mesh);
		Entity.add(new Mesh(mesh), eid);
	}

	// Frontload initing the renderer.
	renderer.init(scene, camera);

	inited = true;
}
