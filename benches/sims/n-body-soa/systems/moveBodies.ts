import { defineSystem } from '@bitecs/classic';
import { bodyQuery } from '../queries/queries';
import { CONSTANTS } from '../constants';
import { Velocity } from '../components/Velocity';
import { Position } from '../components/Position';

export const moveBodies = defineSystem((world) => {
	const eids = bodyQuery(world);

	const positions = Position.store;
	const velocities = Velocity.store;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];

		// Update position based on velocity and the global SPEED factor
		positions.x[eid] += CONSTANTS.SPEED * velocities.x[eid];
		positions.y[eid] += CONSTANTS.SPEED * velocities.y[eid];
	}

	return world;
});
