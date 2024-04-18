import { Entity, World } from '@sweet-ecs/core';
import { CONSTANTS, init as initSim } from '@sim/n-body-mt';
import { ThreeInstances } from '../components/ThreeInstances';
import * as THREE from 'three';
import { scene } from '../scene';

export function init(world: World) {
	// Init the instances meshes for Three.
	const eid = Entity.in(world);

	// I'm not sure why it matters, but you can't set iniitial radius to 1 or everything is invisible.
	const geometry = new THREE.SphereGeometry(CONSTANTS.MAX_RADIUS / 1.5, 12, 12);
	const material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(1, 1, 1) });
	const instancedMesh = new THREE.InstancedMesh(geometry, material, CONSTANTS.NBODIES);

	scene.add(instancedMesh);

	Entity.add(ThreeInstances, eid, [instancedMesh]);

	initSim(world);
}
