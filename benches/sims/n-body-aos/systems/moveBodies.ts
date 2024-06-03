import { CONSTANTS } from '../constants';
import { Velocity } from '../components/Velocity';
import { Position } from '../components/Position';
import { World } from '@sweet-ecs/core';
import { Time } from '../components/Time';

export const moveBodies = ({ world }: { world: World }) => {
	const eids = world.query([Position, Velocity]);
	const { delta } = world.get(Time)!;

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		const position = Position.get(eid);
		const velocity = Velocity.get(eid);

		// Update position based on velocity and the global SPEED factor
		position.x += CONSTANTS.SPEED * velocity.x * delta;
		position.y += CONSTANTS.SPEED * velocity.y * delta;
	}

	return world;
};
