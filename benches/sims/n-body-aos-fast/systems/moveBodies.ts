import { World } from '@sweet-ecs/core';
import { CONSTANTS } from '../constants';
import { Position, Time, Velocity } from '@sim/n-body-aos';

export const moveBodies = (world: World) => {
	const eids = world.query([Position, Velocity]);
	const { delta } = world.get(Time)!;

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
