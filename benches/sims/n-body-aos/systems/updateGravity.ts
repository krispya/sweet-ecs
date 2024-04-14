import { bodyQuery } from '../queries/queries';
import { Velocity } from '../components/Velocity';
import { Mass } from '../components/Mass';
import { World } from '../world';
import { Acceleration } from '../components/Acceleration';
import { Position } from '../components/Position';
import { CONSTANTS } from '../constants';

export const updateGravity = (world: World) => {
	const eids = bodyQuery(world);
	const { delta } = world.time;

	for (let j = 0; j < eids.length; j++) {
		const meId = eids[j];
		const acceleration = Acceleration.get(meId);
		const velocity = Velocity.get(meId);
		const mass = Mass.get(meId);
		const position = Position.get(meId);

		acceleration.x = 0;
		acceleration.y = 0;

		for (let i = 0; i < eids.length; i++) {
			const currentId = eids[i];
			if (meId === currentId) continue; // Skip self

			const otherPosition = Position.get(currentId);
			const otherMass = Mass.get(currentId);

			const dx = +otherPosition.x - +position.x;
			const dy = +otherPosition.y - +position.y;
			let distanceSquared = dx * dx + dy * dy;

			if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

			const distance = Math.sqrt(distanceSquared);
			const forceMagnitude = (+mass.value * +otherMass.value) / distanceSquared;

			acceleration.x += (dx / distance) * forceMagnitude;
			acceleration.y += (dy / distance) * forceMagnitude;
		}

		// Apply computed force to entity's velocity, adjusting for its mass
		velocity.x += (acceleration.x * delta) / mass.value;
		velocity.y += (acceleration.y * delta) / mass.value;
	}
};
