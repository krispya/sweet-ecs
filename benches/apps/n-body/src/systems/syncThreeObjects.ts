import { Circle, Color, Position } from '@sim/n-body';
import { ThreeInstances } from '../components/ThreeInstances';
import * as THREE from 'three';
import { World } from '@sweet-ecs/core';

const normalize = (x: number, min: number, max: number) => (x - min) / (max - min);

const dummy = new THREE.Object3D();
const dummyColor = new THREE.Color();

// AoS version. Compatible with all component formats.

export const syncThreeObjects = ({ world }: { world: World }) => {
	const eids = world.query([Position, Circle, Color]);
	const instanceId = world.query([ThreeInstances])[0];

	const instancedMesh = ThreeInstances.getInstances()[instanceId].value;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		const position = Position.get(eid);
		const circle = Circle.get(eid);
		const color = Color.get(eid);

		dummy.position.set(position.x, position.y, 0);

		const radius = normalize(circle.radius, 0, 60);
		dummy.scale.set(radius, radius, radius);

		dummy.updateMatrix();

		instancedMesh.setMatrixAt(i, dummy.matrix);

		const r = normalize(color.r, 0, 255);
		const g = normalize(color.g, 0, 255);
		const b = normalize(color.b, 0, 255);
		dummyColor.setRGB(r, g, b);
		instancedMesh.setColorAt(i, dummyColor);
	}

	instancedMesh.instanceMatrix.needsUpdate = true;
	instancedMesh.instanceColor!.needsUpdate = true;
};
