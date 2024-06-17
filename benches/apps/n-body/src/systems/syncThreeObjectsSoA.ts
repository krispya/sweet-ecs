import { Circle, Color, Position } from '@sim/n-body';
import { ThreeInstances } from '../components/ThreeInstances';
import * as THREE from 'three';
import { World } from '@sweet-ecs/core';

const normalize = (x: number, min: number, max: number) => (x - min) / (max - min);

const dummy = new THREE.Object3D();
const dummyColor = new THREE.Color();

// SoA version. Technically fastest though it's not noticeable here.

export const syncThreeObjects = ({ world }: { world: World }) => {
	const eids = world.query([Position, Circle, Color]);
	const instanceId = world.query([ThreeInstances])[0];

	const instancedMesh = ThreeInstances.getInstances()[instanceId].value;
	const positions = Position.store;
	const circles = Circle.store;
	const colors = Color.store;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		dummy.position.set(positions.x[eid], positions.y[eid], 0);

		const radius = normalize(circles.radius[eid], 0, 60);
		dummy.scale.set(radius, radius, radius);

		dummy.updateMatrix();

		instancedMesh.setMatrixAt(i, dummy.matrix);

		const r = normalize(colors.r[eid], 0, 255);
		const g = normalize(colors.g[eid], 0, 255);
		const b = normalize(colors.b[eid], 0, 255);
		dummyColor.setRGB(r, g, b);
		instancedMesh.setColorAt(i, dummyColor);
	}

	instancedMesh.instanceMatrix.needsUpdate = true;
	instancedMesh.instanceColor!.needsUpdate = true;
};
