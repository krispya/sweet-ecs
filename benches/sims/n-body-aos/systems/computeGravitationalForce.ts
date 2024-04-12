import { Position } from '../components/Position';
import { Mass } from '../components/Mass';
import { CONSTANTS } from '../constants';
import { bodyQuery } from '../queries/queries';
import { World } from '@sweet-ecs/core';

export function computeGravitationalForce(
	world: World,
	meId: number
): { forceX: number; forceY: number } {
	const eids = bodyQuery(world);
	let forceX = 0;
	let forceY = 0;

	for (let i = 0; i < eids.length; i++) {
		const currentId = eids[i];
		if (meId === currentId) continue; // Skip self

		const currentPosition = Position.get(currentId);
		const mePosition = Position.get(meId);
		const currentMass = Mass.get(currentId);
		const meMass = Mass.get(meId);

		const dx = currentPosition.x - mePosition.x;
		const dy = currentPosition.y - mePosition.y;
		let distanceSquared = dx * dx + dy * dy;

		if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

		const distance = Math.sqrt(distanceSquared);
		const forceMagnitude = (meMass.value * currentMass.value) / distanceSquared;

		forceX += (dx / distance) * forceMagnitude;
		forceY += (dy / distance) * forceMagnitude;
	}

	return { forceX, forceY };
}
