import { Store } from '@sweet-ecs/core';

export type ThreadedComponents = {
	read: {
		[key: string]: Store;
	};
	write: {
		[key: string]: Store;
	};
};
