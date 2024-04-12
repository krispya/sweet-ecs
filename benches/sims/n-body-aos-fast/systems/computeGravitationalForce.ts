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

	const positions = Position.instances;
	const masses = Mass.instances;

	for (let i = 0; i < eids.length; i++) {
		const currentId = eids[i];
		if (meId === currentId) continue; // Skip self

		const dx = positions[currentId].x - positions[meId].x;
		const dy = positions[currentId].y - positions[meId].y;
		let distanceSquared = dx * dx + dy * dy;

		if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

		const distance = Math.sqrt(distanceSquared);
		const forceMagnitude = (masses[meId].value * masses[currentId].value) / distanceSquared;

		forceX += (dx / distance) * forceMagnitude;
		forceY += (dy / distance) * forceMagnitude;
	}

	return { forceX, forceY };
}
