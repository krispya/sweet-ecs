import { Component, World } from '..';

export type ResizeCallback = (world: World, size: number) => void;

export type SweetWorkerScope = WorkerGlobalScope &
	typeof globalThis & {
		queryBuffers: Record<string, SharedArrayBuffer>;
		componentToKeyMap: Map<typeof Component, string>;
	};
