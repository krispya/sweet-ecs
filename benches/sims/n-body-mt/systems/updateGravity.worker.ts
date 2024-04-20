import { InitData, ThreadedComponents } from '../utils/threading.js';
import { CONSTANTS } from '../constants';
import { Component } from '@sweet-ecs/core';
import { updateGravity } from './updateGravity.common.js';
import { hashComponents } from './updateGravity.main.js';

const _self = self as unknown as WorkerGlobalScope & typeof globalThis;

type Props = {
	delta: number;
	entities: Record<string, Uint32Array>;
	components: {
		read: {
			Position: { x: Readonly<Float64Array>; y: Readonly<Float64Array> };
			Mass: { value: Readonly<Float64Array> };
		};
		write: {
			Acceleration: { x: Float64Array; y: Float64Array };
			Velocity: { x: Float64Array; y: Float64Array };
		};
	};
};

// async function updateGravityWorker({ delta, entities }) {
// 	const otherIds = query([Position, Mass, Velocity, Acceleration]);

// 	const velocities = Velocity.store;
// 	const masses = Mass.store;
// 	const accelerations = Acceleration.store;
// 	const positions = Position.store;

// 	for (let j = 0; j < entities.body.length; j++) {
// 		const meId = entities.body[j];
// 		accelerations.x[meId] = 0;
// 		accelerations.y[meId] = 0;

// 		for (let i = 0; i < otherIds.length; i++) {
// 			const currentId = otherIds[i];
// 			if (meId === currentId) continue; // Skip self

// 			const dx = +positions.x[currentId] - +positions.x[meId];
// 			const dy = +positions.y[currentId] - +positions.y[meId];
// 			let distanceSquared = dx * dx + dy * dy;

// 			if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

// 			const distance = Math.sqrt(distanceSquared);
// 			const forceMagnitude = (+masses.value[meId] * +masses.value[currentId]) / distanceSquared;

// 			accelerations.x[meId] += (dx / distance) * forceMagnitude;
// 			accelerations.y[meId] += (dy / distance) * forceMagnitude;
// 		}

// 		velocities.x[meId] += (accelerations.x[meId] * delta) / +masses.value[meId];
// 		velocities.y[meId] += (accelerations.y[meId] * delta) / +masses.value[meId];
// 	}
// }

// onmessage = createOnMessage(updateGravityWorker);
onmessage = updateGravity.worker(
	async ({ entities, read: { Position, Mass }, write: { Velocity, Acceleration }, delta }) => {
		const otherIds = query([Position, Mass, Velocity, Acceleration]);

		const velocities = Velocity.store;
		const masses = Mass.store;
		const accelerations = Acceleration.store;
		const positions = Position.store;

		for (let j = 0; j < entities.body.length; j++) {
			const meId = entities.body[j];
			accelerations.x[meId] = 0;
			accelerations.y[meId] = 0;

			for (let i = 0; i < otherIds.length; i++) {
				const currentId = otherIds[i];
				if (meId === currentId) continue; // Skip self

				const dx = +positions.x[currentId] - +positions.x[meId];
				const dy = +positions.y[currentId] - +positions.y[meId];
				let distanceSquared = dx * dx + dy * dy;

				if (distanceSquared < CONSTANTS.STICKY) distanceSquared = CONSTANTS.STICKY; // Apply stickiness

				const distance = Math.sqrt(distanceSquared);
				const forceMagnitude =
					(+masses.value[meId] * +masses.value[currentId]) / distanceSquared;

				accelerations.x[meId] += (dx / distance) * forceMagnitude;
				accelerations.y[meId] += (dy / distance) * forceMagnitude;
			}

			velocities.x[meId] += (accelerations.x[meId] * delta) / +masses.value[meId];
			velocities.y[meId] += (accelerations.y[meId] * delta) / +masses.value[meId];
		}
	}
);

_self.componentToKeyMap = new Map<typeof Component, string>();
_self.queryBuffers = {} as Record<string, SharedArrayBuffer>;

// function createOnMessage(update: (...args: any[]) => void) {
// 	let components: ThreadedComponents;

// 	return (event: MessageEvent) => {
// 		if (event.data.type === 'run') {
// 			const data = event.data;

// 			update({ ...data, components });
// 			postMessage({ type: 'done' });
// 			return;
// 		}

// 		if (event.data.type === 'query') {
// 			_self.queryBuffers[event.data.hash] = event.data.buffer;
// 			return;
// 		}

// 		if (event.data.type === 'init') {
// 			const init = event.data as InitData;
// 			components = init.stores as ThreadedComponents;

// 			// Hydrate components.
// 			if (init.stores.read.Position) {
// 				Position.store = init.stores.read.Position;
// 				_self.componentToKeyMap.set(Position, 'Position');
// 			}
// 			if (init.stores.read.Mass) {
// 				Mass.store = init.stores.read.Mass;
// 				_self.componentToKeyMap.set(Mass, 'Mass');
// 			}
// 			if (init.stores.write.Acceleration) {
// 				Acceleration.store = init.stores.write.Acceleration;
// 				_self.componentToKeyMap.set(Acceleration, 'Acceleration');
// 			}
// 			if (init.stores.write.Velocity) {
// 				Velocity.store = init.stores.write.Velocity;
// 				_self.componentToKeyMap.set(Velocity, 'Velocity');
// 			}

// 			// Hydrate queries.
// 			Object.entries(init.queryBuffers).forEach(([hash, buffer]) => {
// 				_self.queryBuffers[hash] = buffer;
// 			});

// 			postMessage({ type: 'init-done' });
// 		}
// 	};
// }

function getEntitiesFromBuffers(buffer: SharedArrayBuffer) {
	const view = new Uint32Array(buffer);
	const length = view[0];
	const entities = new Uint32Array(buffer, 4, length);
	return entities;
}

declare global {
	interface WorkerGlobalScope {
		componentToKeyMap: Map<typeof Component, string>;
		queryBuffers: Record<string, SharedArrayBuffer>;
	}
}

function query(components: (typeof Component)[]): Uint32Array {
	const hash = hashComponents(components);

	if (_self.queryBuffers[hash]) {
		const buffer = _self.queryBuffers[hash];
		const entities = getEntitiesFromBuffers(buffer);
		return entities;
	} else {
		console.log('Querying main thread for', components);
		_self.postMessage({ type: 'query', hash });
		return new Uint32Array();
	}
}
