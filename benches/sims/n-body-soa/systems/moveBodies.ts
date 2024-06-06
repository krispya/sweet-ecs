import { CONSTANTS } from '../constants';
import { Velocity } from '../components/Velocity';
import { Position } from '../components/Position';
import { World } from '@sweet-ecs/core';
import { Time } from '../components/Time';

export const moveBodies = ({ world }: { world: World }) => {
	const { delta } = world.get(Time)!;
	const eids = world.query([Position, Velocity]);

	const positions = Position.store;
	const velocities = Velocity.store;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];

		// Update position based on velocity and the global SPEED factor
		positions.x[eid] += CONSTANTS.SPEED * velocities.x[eid] * delta;
		positions.y[eid] += CONSTANTS.SPEED * velocities.y[eid] * delta;
	}
};
