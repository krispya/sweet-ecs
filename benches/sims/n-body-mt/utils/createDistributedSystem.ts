import { getThreadCount, Worker } from '@sim/bench-tools';
import { Component, hashComponentsByKey, Store, WorkerWorld, World } from '@sweet-ecs/core';
import { Workers } from '../components/Workers.js';
import { Time } from '../components/Time.js';
import { InitData } from './threading.js';

type DistributedSystemProps<
	TEnt extends Record<string, (typeof Component)[]>,
	TRead extends Record<string, typeof Component>,
	TWrite extends Record<string, typeof Component>
> = {
	entities: TEnt;
	read: TRead;
	write: TWrite;
	url: URL;
	init?: {
		queries?: (typeof Component)[][];
	};
};

type Stores = {
	read: Record<string, Store>;
	write: Record<string, Store>;
};

const componentMap = new Map<string, typeof Component>();
const componentToKeyMap = new Map<typeof Component, string>();

export function createDistributedSystem<
	TEnt extends Record<string, (typeof Component)[]>,
	TRead extends Record<string, typeof Component>,
	TWrite extends Record<string, typeof Component>
>(props: DistributedSystemProps<TEnt, TRead, TWrite>) {
	const { read, write } = props;

	// Map each component to a key.
	Object.entries(read).forEach(([key, value]) => componentMap.set(key, value));
	Object.entries(write).forEach(([key, value]) => componentMap.set(key, value));
	// Invert
	componentMap.forEach((value, key) => componentToKeyMap.set(value, key));

	const main = createMainSubsystem(props);
	const worker = createWorkerSubsystem(props);

	return { main, worker };
}
function createMainSubsystem<
	TEnt extends Record<string, (typeof Component)[]>,
	TRead extends Record<string, typeof Component>,
	TWrite extends Record<string, typeof Component>
>({ entities, read, write, url, init }: DistributedSystemProps<TEnt, TRead, TWrite>) {
	return async (world: World) => {
		const { registry } = world.get(Workers)!;
		const { delta } = world.get(Time)!;

		// Initialize workers using the URL as a key.
		if (!registry[url.href]) {
			const workers = Array(getThreadCount())
				.fill(null)
				.map(() => new Worker(url, { type: 'module' })) as Worker[];

			// Register workers.
			registry[url.href] = workers;

			// Extract stores out of the components.
			const stores = {
				read: extractStores(read),
				write: extractStores(write),
			} as Stores;

			const queryBuffers: Record<string, SharedArrayBuffer> = {};
			if (init?.queries) {
				for (const query of init.queries) {
					const hash = hashComponentsByKey(query, componentToKeyMap);
					const buffer = world.query(query).buffer as SharedArrayBuffer;
					queryBuffers[hash] = buffer;
				}
			}

			await Promise.all(
				workers.map(
					(worker) =>
						new Promise<void>((resolve) => {
							worker.onmessage = () => resolve();
							worker.postMessage({
								type: 'init',
								stores,
								queryBuffers,
								worldId: world.id,
							});
						})
				)
			);
		}

		// run worker
		const _workers = registry[url.href];
		const numberOfPartitions = _workers.length;

		const partitionedEntities: Record<string, [Uint32Array, number]> = {};
		for (const key in entities) {
			partitionedEntities[key] = [] as any;
			partitionedEntities[key][0] = world.query(entities[key]);
			partitionedEntities[key][1] = Math.ceil(
				partitionedEntities[key][0].length / numberOfPartitions
			);
		}

		// TODO: atomic wait/notify
		await Promise.all(
			_workers.map(
				(worker, i) =>
					new Promise<void>((resolve) => {
						worker.onmessage = (event) => {
							if (event.data.type === 'query') {
								// Reconstruct an array from the hash and get the buffer.
								const keys = (event.data.hash as string).split('-');
								const components = keys.map((key) => componentMap.get(key)!);
								const buffer = world.query(components).buffer;

								worker.postMessage({ type: 'query', buffer, hash: event.data.hash });
							}

							if (event.data.type === 'done') resolve();
						};

						const workerEntities: Record<string, Uint32Array> = {};
						for (const key in partitionedEntities) {
							const start = i * partitionedEntities[key][1];
							const end = start + partitionedEntities[key][1];
							workerEntities[key] = partitionedEntities[key][0].subarray(start, end);
						}

						worker.postMessage({ type: 'run', entities: workerEntities, delta });
					})
			)
		);

		return world;
	};
}

const _self = self as unknown as WorkerGlobalScope & typeof globalThis;

type WorkerUpdateProps<
	TEnt extends Record<string, (typeof Component)[]>,
	TRead extends Record<string, typeof Component>,
	TWrite extends Record<string, typeof Component>
> = {
	entities: {
		[K in keyof TEnt]: Uint32Array;
	};
	read: TRead;
	write: TWrite;
	delta: number;
	world: WorkerWorld;
};

function createWorkerSubsystem<
	TEnt extends Record<string, (typeof Component)[]>,
	TRead extends Record<string, typeof Component>,
	TWrite extends Record<string, typeof Component>
>(
	props: DistributedSystemProps<TEnt, TRead, TWrite>
): (
	update: (props: WorkerUpdateProps<TEnt, TRead, TWrite>) => void
) => (event: MessageEvent) => void {
	return (update: (props: WorkerUpdateProps<TEnt, TRead, TWrite>) => void) => {
		const { read, write } = props;
		let world: WorkerWorld = null!;

		// Make sure the worker has access to the componentToKeyMap and queryBuffers.
		_self.componentToKeyMap = new Map<typeof Component, string>();
		_self.queryBuffers = {} as Record<string, SharedArrayBuffer>;

		return (event: MessageEvent) => {
			if (event.data.type === 'run') {
				const data = event.data;

				update({ ...data, read, write, world });
				postMessage({ type: 'done' });
				return;
			}

			if (event.data.type === 'query') {
				_self.queryBuffers[event.data.hash] = event.data.buffer;
				return;
			}

			if (event.data.type === 'init') {
				const init = event.data as InitData;

				// Hydrate components.
				for (const key in init.stores.read) {
					read[key].store = init.stores.read[key];
				}
				for (const key in init.stores.write) {
					write[key].store = init.stores.write[key];
				}

				_self.componentToKeyMap = componentToKeyMap;

				// Hydrate queries.
				Object.entries(init.queryBuffers).forEach(([hash, buffer]) => {
					_self.queryBuffers[hash] = buffer;
				});

				// Create worker world.
				world = new WorkerWorld(init.worldId);

				postMessage({ type: 'init-done' });
			}
		};
	};
}

declare global {
	interface WorkerGlobalScope {
		componentToKeyMap: Map<typeof Component, string>;
		queryBuffers: Record<string, SharedArrayBuffer>;
	}
}

const extractStores = (components: Record<string, typeof Component>) =>
	Object.fromEntries(Object.entries(components).map(([key, value]) => [key, value.store]));
