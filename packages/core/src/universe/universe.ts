import { getTotalWorldSize } from '../world/methods/getTotalWorldSize';
import { ResizeCallback } from '../world/types';
import { World } from '../world/world';

export const universeResizeCallbacks: ResizeCallback[] = [];

export const universe = {
	worlds: [] as World[],
	getSize: getTotalWorldSize,
	onResize,
};

function onResize(callback: ResizeCallback) {
	universeResizeCallbacks.push(callback);

	return () => {
		universeResizeCallbacks.splice(universeResizeCallbacks.indexOf(callback), 1);
	};
}
