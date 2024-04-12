import { defineSystem } from '@bitecs/classic';
import { bodyQuery } from '../queries/queries';
import { CONSTANTS } from '../constants';
import { Velocity } from '../components/Velocity';
import { Position } from '../components/Position';

export const moveBodies = defineSystem((world) => {
	const eids = bodyQuery(world);

	const positions = Position.instances;
	const velocities = Velocity.instances;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];

		// Update position based on velocity and the global SPEED factor
		positions[eid].x += CONSTANTS.SPEED * velocities[eid].x;
		positions[eid].y += CONSTANTS.SPEED * velocities[eid].y;
	}

	return world;
});
