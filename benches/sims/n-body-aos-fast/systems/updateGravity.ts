import { defineSystem } from '@bitecs/classic';
import { bodyQuery } from '../queries/queries';
import { Velocity } from '../components/Velocity';
import { Mass } from '../components/Mass';
import { computeGravitationalForce } from './computeGravitationalForce';
import { World } from '@sweet-ecs/core';

export const updateGravity = defineSystem((world: World) => {
	const eids = bodyQuery(world);

	const velocities = Velocity.instances;
	const masses = Mass.instances;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		const { forceX, forceY } = computeGravitationalForce(world, eid);

		// Apply computed force to entity's velocity, adjusting for its mass
		velocities[eid].x += forceX / masses[eid].value;
		velocities[eid].y += forceY / masses[eid].value;
	}
});
