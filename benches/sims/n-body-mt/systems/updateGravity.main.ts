import { UpdateGravityComponents } from './updateGravity.common.js';
import { getThreadCount, Worker } from '@sim/bench-tools';
import { World } from '../world.js';
import { Component } from '@sweet-ecs/core';

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
	return async (world: World) => {
		// initialize workers with components
		// TODO: initialize max workers once and select system in worker?
		if (!world.workers[workerFile]) {
			const workers = (world.workers[workerFile] = Array(getThreadCount())
				.fill(null)
				.map(() => new Worker(new URL(workerFile, import.meta.url))) as Worker[]);

			await Promise.all(
				workers.map(
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
		const workers = world.workers[workerFile];
		const bodyEntities = world.query(entityQuery);
		const partitionEntities = world.query(partitionQuery);
		const numberOfPartitions = workers.length;
		const entitiesPerPartition = Math.ceil(bodyEntities.length / numberOfPartitions);

		// TODO: atomic wait/notify
		await Promise.all(
			workers.map(
				(worker, i) =>
					new Promise<void>((resolve) => {
						worker.onmessage = () => resolve();
						const start = i * entitiesPerPartition;
						const end = start + entitiesPerPartition;
						const workerEntities = partitionEntities.subarray(start, end);
						worker.postMessage({ bodyEntities, workerEntities, delta: world.time.delta });
					})
			)
		);

		return world;
	};
};
