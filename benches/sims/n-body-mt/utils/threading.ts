import { Store } from '@sweet-ecs/core';

export type ThreadedComponents = {
	read: {
		[key: string]: Store;
	};
	write: {
		[key: string]: Store;
	};
};

export type InitData = {
	stores: {
		read: Record<string, Store>;
		write: Record<string, Store>;
	};
	queryBuffers: Record<string, SharedArrayBuffer>;
	worldId: number;
};
