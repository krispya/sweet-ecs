import { CONSTANTS } from '../constants';
import { Entity, World } from '@sweet-ecs/core';
import { Acceleration, Circle, Color, IsCentralMass, Mass, Position, Velocity } from '..';

let inited = false;

export const init = ({ world }: { world: World }) => {
	if (inited) return;

	for (let i = 0; i < CONSTANTS.NBODIES; i++) {
		const eid = Entity.in(world);

		Entity.add(Position, eid);
		Entity.add(Velocity, eid);
		Entity.add(Mass, eid);
		Entity.add(Circle, eid);
		Entity.add(Color, eid);
		Entity.add(Acceleration, eid);

		if (i === 0) {
			// Make the first entity the central mass.
			Entity.add(IsCentralMass, eid);
		}
	}

	inited = true;
};
