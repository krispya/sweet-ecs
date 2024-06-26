import { CONSTANTS } from '../constants';
import { randInRange } from '../utils/randInRange';
import { Position, Mass, Velocity, Circle, IsCentralMass } from '../components';
import { World, defineEnterQueue } from '@sweet-ecs/core';

const body = [Position, Velocity, Mass, Circle];
const enterBody = defineEnterQueue(body);
const enterCentralMass = defineEnterQueue([...body, IsCentralMass]);

export const setInitial = ({ world }: { world: World }) => {
	const eids = world.query(enterBody);
	const centralMassIds = world.query(enterCentralMass);

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];

		// Random positions
		Position.store.x[eid] = randInRange(-4000, 4000);
		Position.store.y[eid] = randInRange(-100, 100);
		Mass.store.value[eid] = CONSTANTS.BASE_MASS + randInRange(0, CONSTANTS.VAR_MASS);

		// Calculate velocity for a stable orbit, assuming a circular orbit logic
		if (Position.store.x[eid] !== 0 || Position.store.y[eid] !== 0) {
			const radius = Math.sqrt(Position.store.x[eid] ** 2 + Position.store.y[eid] ** 2);
			const normX = Position.store.x[eid] / radius;
			const normY = Position.store.y[eid] / radius;

			// Perpendicular vector for circular orbit
			const vecRotX = -normY;
			const vecRotY = normX;

			const v = Math.sqrt(
				CONSTANTS.INITIAL_C / radius / Mass.store.value[eid] / CONSTANTS.SPEED
			);
			Velocity.store.x[eid] = vecRotX * v;
			Velocity.store.y[eid] = vecRotY * v;
		}

		// Set circle radius based on mass
		Circle.store.radius[eid] =
			CONSTANTS.MAX_RADIUS *
				(Mass.store.value[eid] / (CONSTANTS.BASE_MASS + CONSTANTS.VAR_MASS)) +
			1;
	}

	// Set the central mass properties.
	for (let i = 0; i < centralMassIds.length; i++) {
		const eid = centralMassIds[i];

		Position.store.x[eid] = 0;
		Position.store.y[eid] = 0;

		Velocity.store.x[eid] = 0;
		Velocity.store.y[eid] = 0;

		Mass.store.value[eid] = CONSTANTS.CENTRAL_MASS;

		Circle.store.radius[eid] = CONSTANTS.MAX_RADIUS / 1.5;
	}
};
