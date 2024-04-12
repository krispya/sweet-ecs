import { defineSystem } from '@bitecs/classic';
import { bodyQuery } from '../queries/queries';
import { CONSTANTS } from '../constants';
import { Velocity } from '../components/Velocity';
import { Position } from '../components/Position';

export const moveBodies = defineSystem((world) => {
	const eids = bodyQuery(world);

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		const position = Position.get(eid);
		const velocity = Velocity.get(eid);

		// Update position based on velocity and the global SPEED factor
		position.x += CONSTANTS.SPEED * velocity.x;
		position.y += CONSTANTS.SPEED * velocity.y;
	}

	return world;
});
