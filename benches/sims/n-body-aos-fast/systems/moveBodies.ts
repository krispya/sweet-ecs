import { bodyQuery } from '../queries/queries';
import { CONSTANTS } from '../constants';
import { Velocity } from '../components/Velocity';
import { Position } from '../components/Position';
import { World } from '../world';

export const moveBodies = (world: World) => {
	const eids = bodyQuery(world);
	const { delta } = world.time;

	const positions = Position.instances;
	const velocities = Velocity.instances;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];

		// Update position based on velocity and the global SPEED factor
		positions[eid].x += CONSTANTS.SPEED * velocities[eid].x * delta;
		positions[eid].y += CONSTANTS.SPEED * velocities[eid].y * delta;
	}

	return world;
};
