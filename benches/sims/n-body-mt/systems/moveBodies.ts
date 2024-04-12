import { defineSystem } from '@bitecs/classic';
import { bodyQuery } from '../queries/bodyQuery';
import { Position, Velocity } from '../components';
import { CONSTANTS } from '../constants';
import { WorldMT } from '../world';

export const moveBodies = defineSystem((world: WorldMT) => {
	const { delta } = world.time;
	const eids = bodyQuery(world);

	const positions = Position.store;
	const velocities = Velocity.store;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];

		// Update position based on velocity and the global SPEED factor
		positions.x[eid] += CONSTANTS.SPEED * velocities.x[eid] * delta;
		positions.y[eid] += CONSTANTS.SPEED * velocities.y[eid] * delta;
	}

	return world;
});
