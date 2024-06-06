import { CONSTANTS } from '@sim/n-body';
import { Entity, World } from '@sweet-ecs/core';
import * as THREE from 'three';
import { ThreeInstances } from '../components/ThreeInstances';
import { scene } from '../scene';

let inited = false;

export function init({ world }: { world: World }) {
	if (inited) return;

	// Init the instances meshes for Three.
	const eid = Entity.in(world);

	// I'm not sure why it matters, but you can't set iniitial radius to 1 or everything is invisible.
	const geometry = new THREE.CircleGeometry(CONSTANTS.MAX_RADIUS / 1.5, 12);
	const material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1, 1, 1) });
	const instancedMesh = new THREE.InstancedMesh(geometry, material, CONSTANTS.NBODIES);

	scene.add(instancedMesh);

	Entity.add(new ThreeInstances(instancedMesh), eid);

	inited = true;
}
