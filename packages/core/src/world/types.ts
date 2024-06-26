import { Component, World } from '..';

export type ResizeCallback = (world: World, size: number) => void;

export type SweetWorkerScope = WorkerGlobalScope &
	typeof globalThis & {
		queryBuffers: Record<string, SharedArrayBuffer>;
		componentToKeyMap: Map<typeof Component, string>;
	};

export type HasBufferQueries<TWorld extends World> = TWorld extends World<infer TOptions>
	? TOptions extends { bufferedQueries: true }
		? true
		: false
	: never;
