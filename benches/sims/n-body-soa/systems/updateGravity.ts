import { defineSystem } from '@bitecs/classic';
import { bodyQuery } from '../queries/queries';
import { Velocity } from '../components/Velocity';
import { Mass } from '../components/Mass';
import { computeGravitationalForce } from './computeGravitationalForce';
import { World } from '@sweet-ecs/core';

export const updateGravity = defineSystem((world: World) => {
	const eids = bodyQuery(world);

	const velocities = Velocity.store;
	const masses = Mass.store;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];

		const { forceX, forceY } = computeGravitationalForce(world, eid);

		// Apply computed force to entity's velocity, adjusting for its mass
		velocities.x[eid] += forceX / masses.value[eid];
		velocities.y[eid] += forceY / masses.value[eid];
	}
});
