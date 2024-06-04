import { UpdateGravityComponents } from './updateGravity.common.js';
import { getThreadCount, Worker } from '@sim/bench-tools';
import { Component, World } from '@sweet-ecs/core';
import { Workers } from '../components/Workers.js';
import { Time } from '../components/Time.js';
import { Acceleration, Mass, Position, Velocity } from '../index.js';

export const updateGravityMain = ({
	entityQuery,
	partitionQuery,
	components,
}: {
	entityQuery: (typeof Component)[];
	partitionQuery: (typeof Component)[];
	components: UpdateGravityComponents;
}) => {
	const workerFile = 'updateGravity.worker.ts';

	return async ({ world }: { world: World }) => {
		const { workers } = world.get(Workers)!;
		const { delta } = world.get(Time)!;

		// initialize workers with components
		// TODO: initialize max workers once and select system in worker?
		if (!workers[workerFile]) {
			const _workers = (workers[workerFile] = Array(getThreadCount())
				.fill(null)
				.map(() => new Worker(new URL(workerFile, import.meta.url))) as Worker[]);

			await Promise.all(
				_workers.map(
					(worker) =>
						new Promise<void>((resolve) => {
							worker.onmessage = () => resolve();
							// TODO: somehow pass queries here too
							worker.postMessage(components);
						})
				)
			);
		}

		// run worker
		const _workers = workers[workerFile];
		const bodyEntities = world.query(entityQuery);
		const partitionEntities = world.query(partitionQuery);
		const numberOfPartitions = _workers.length;
		const entitiesPerPartition = Math.ceil(bodyEntities.length / numberOfPartitions);

		// TODO: atomic wait/notify
		await Promise.all(
			_workers.map(
				(worker, i) =>
					new Promise<void>((resolve) => {
						worker.onmessage = () => resolve();
						const start = i * entitiesPerPartition;
						const end = start + entitiesPerPartition;
						const workerEntities = partitionEntities.subarray(start, end);
						worker.postMessage({ bodyEntities, workerEntities, delta });
					})
			)
		);
	};
};

export const updateGravity = updateGravityMain({
	entityQuery: [Position, Mass, Velocity, Acceleration],
	partitionQuery: [Position, Mass, Velocity, Acceleration],
	components: {
		read: { Position: Position.store, Mass: Mass.store },
		write: { Velocity: Velocity.store, Acceleration: Acceleration.store },
	},
});
