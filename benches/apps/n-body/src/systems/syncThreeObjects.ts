import { Circle, Color, Position, bodyQuery } from '@sim/n-body-soa';
import { ThreeInstances } from '../components/ThreeObject';
import * as THREE from 'three';
import { World } from '@sim/n-body-soa/world';
import { query } from '@sweet-ecs/core';

const normalize = (x: number, min: number, max: number) => (x - min) / (max - min);

const dummy = new THREE.Object3D();
const color = new THREE.Color();

export const syncThreeObjects = (world: World) => {
	const eids = bodyQuery(world);
	const instanceId = query(world, [ThreeInstances])[0];

	const instancedMesh = ThreeInstances.instances[instanceId].value;
	const positions = Position.store;
	const circles = Circle.store;
	const colors = Color.store;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		dummy.position.set(positions.x[eid], positions.y[eid], 0);

		const radius = normalize(circles.radius[eid], 0, 60);
		dummy.scale.set(radius, radius, radius);

		dummy.updateMatrix();

		instancedMesh.setMatrixAt(eid, dummy.matrix);

		const r = normalize(colors.r[eid], 0, 255);
		const g = normalize(colors.g[eid], 0, 255);
		const b = normalize(colors.b[eid], 0, 255);
		color.setRGB(r, g, b);
		instancedMesh.setColorAt(eid, color);
	}

	instancedMesh.instanceMatrix.needsUpdate = true;
	instancedMesh.instanceColor!.needsUpdate = true;
};
