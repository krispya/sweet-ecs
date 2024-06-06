import { CONSTANTS } from '../constants';
import { Position } from '../components/Position';
import { Velocity } from '../components/Velocity';
import { Mass } from '../components/Mass';
import { Circle } from '../components/Circle';
import { randInRange } from '../utils/randInRange';
import { World, defineEnterQueue } from '@sweet-ecs/core';
import { IsCentralMass } from '../components/IsCentralMass';

const body = [Position, Velocity, Mass, Circle];
const enterBody = defineEnterQueue(body);
const enterCentralMass = defineEnterQueue([...body, IsCentralMass]);

export const setInitial = ({ world }: { world: World }) => {
	const eids = world.query(enterBody);
	const centralMassIds = world.query(enterCentralMass);

	for (let i = 0; i < eids.length; i++) {
		const eid = eids[i];
		const position = Position.get(eid);
		const velocity = Velocity.get(eid);
		const mass = Mass.get(eid);
		const circle = Circle.get(eid);

		// Random positions
		position.x = randInRange(-4000, 4000);
		position.y = randInRange(-100, 100);
		mass.value = CONSTANTS.BASE_MASS + randInRange(0, CONSTANTS.VAR_MASS);

		// Calculate velocity for a stable orbit, assuming a circular orbit logic
		if (position.x !== 0 || position.y !== 0) {
			const radius = Math.sqrt(position.x ** 2 + position.y ** 2);
			const normX = position.x / radius;
			const normY = position.y / radius;

			// Perpendicular vector for circular orbit
			const vecRotX = -normY;
			const vecRotY = normX;

			const v = Math.sqrt(CONSTANTS.INITIAL_C / radius / mass.value / CONSTANTS.SPEED);
			velocity.x = vecRotX * v;
			velocity.y = vecRotY * v;
		}

		// Set circle radius based on mass
		circle.radius =
			CONSTANTS.MAX_RADIUS * (mass.value / (CONSTANTS.BASE_MASS + CONSTANTS.VAR_MASS)) + 1;
	}

	// Set the central mass properties.
	for (let i = 0; i < centralMassIds.length; i++) {
		const eid = centralMassIds[i];
		const position = Position.get(eid);
		const velocity = Velocity.get(eid);
		const mass = Mass.get(eid);
		const circle = Circle.get(eid);

		position.x = 0;
		position.y = 0;

		velocity.x = 0;
		velocity.y = 0;

		mass.value = CONSTANTS.CENTRAL_MASS;

		circle.radius = CONSTANTS.MAX_RADIUS / 1.5;
	}
};
