import { getThreadCount, Worker } from '@sim/bench-tools';
import { Component, Store, World } from '@sweet-ecs/core';
import { Time } from '../components/Time.js';
import { Workers } from '../components/Workers.js';
import { Acceleration, Mass, Position, Velocity } from '../index.js';

export const createUpdateGravity = ({
	entityQuery,
	partitionQuery,
	components,
	url,
}: {
	entityQuery: (typeof Component)[];
	partitionQuery: (typeof Component)[];
	components: {
		read: Record<string, Store>;
		write: Record<string, Store>;
	};
	url: URL;
}) => {
	return async ({ world }: { world: World<{ bufferedQueries: true }> }) => {
		const { workers } = world.get(Workers)!;
		const { delta } = world.get(Time)!;

		// Initialize workers with components.
		if (!workers[url.href]) {
			// Note: Using type module breaks the Node implementation, which is using web-worker.
			workers[url.href] = Array.from({ length: getThreadCount() }, () => new Worker(url));

			// Initialize the worker process.
			const initWorker = (worker: Worker) =>
				new Promise<void>((resolve) => {
					worker.onmessage = () => resolve();
					worker.postMessage(components);
				});

			const initPromises = workers[url.href].map(initWorker);
			await Promise.all(initPromises);
		}

		// Run workers.
		// Get all of the queries. Since they are SABs, sending them to a worker is very fast.
		const bodyEntities = world.query(entityQuery);
		const partitionEntities = world.query(partitionQuery);

		// Partition the entities per worker.
		const numberOfPartitions = workers[url.href].length;
		const entitiesPerPartition = Math.ceil(bodyEntities.length / numberOfPartitions);

		// Send all the data to the workers and wait for them to finish.
		await Promise.all(
			workers[url.href].map(
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

export const updateGravity = createUpdateGravity({
	entityQuery: [Position, Mass, Velocity, Acceleration],
	partitionQuery: [Position, Mass, Velocity, Acceleration],
	components: {
		read: { Position: Position.store, Mass: Mass.store },
		write: { Velocity: Velocity.store, Acceleration: Acceleration.store },
	},
	url: new URL('updateGravity.worker.ts', import.meta.url),
});
