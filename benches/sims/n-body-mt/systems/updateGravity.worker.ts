import { Store } from '@sweet-ecs/core';
// import { CONSTANTS } from '../constants'; // Node can't handle type module right now.
const CONSTANTS = {
	STICKY: 10000,
};

type GravityComponents = {
	read: { Position: Store; Mass: Store };
	write: { Velocity: Store; Acceleration: Store };
};

type Props = {
	delta: number;
	workerEntities: Uint32Array;
	bodyEntities: Uint32Array;
} & GravityComponents;

function updateGravityWorker({
	delta,
	workerEntities,
	bodyEntities,
	read: { Position, Mass },
	write: { Velocity, Acceleration },
}: Props) {
	for (let j = 0; j < workerEntities.length; j++) {
		const meId = workerEntities[j];
		Acceleration.x[meId] = 0;
		Acceleration.y[meId] = 0;

		for (let i = 0; i < bodyEntities.length; i++) {
			const currentId = bodyEntities[i];
			if (meId === currentId) continue; // Skip self

			const dx = +Position.x[currentId] - +Position.x[meId];
			const dy = +Position.y[currentId] - +Position.y[meId];
			let distanceSquared = dx * dx + dy * dy;

			if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

			const distance = Math.sqrt(distanceSquared);
			const forceMagnitude = (+Mass.value[meId] * +Mass.value[currentId]) / distanceSquared;

			Acceleration.x[meId] += (dx / distance) * forceMagnitude;
			Acceleration.y[meId] += (dy / distance) * forceMagnitude;
		}

		Velocity.x[meId] += (Acceleration.x[meId] * delta) / +Mass.value[meId];
		Velocity.y[meId] += (Acceleration.y[meId] * delta) / +Mass.value[meId];
	}
}

let components: GravityComponents;

onmessage = (event: MessageEvent<any>) => {
	if ('read' in event.data && 'write' in event.data) {
		components = event.data;
		postMessage('init-done');
	} else {
		const data = event.data;
		updateGravityWorker({ ...data, ...components });
		postMessage('system-done');
	}
};
