import { CONSTANTS } from '../constants';
import { Velocity } from '../components/Velocity';
import { Position } from '../components/Position';
import { World } from '@sweet-ecs/core';
import { Time } from '../components/Time';

export const moveBodies = ({ world }: { world: World }) => {
	const eids = world.query([Position, Velocity]);
	const { delta } = world.get(Time)!;

	const positions = Position.instances as Position[];
	const velocities = Velocity.instances as Velocity[];

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];

		// Update position based on velocity and the global SPEED factor
		positions[eid].x += CONSTANTS.SPEED * velocities[eid].x * delta;
		positions[eid].y += CONSTANTS.SPEED * velocities[eid].y * delta;
	}
};
