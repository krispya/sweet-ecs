import { worlds } from '@bitecs/classic';
import { getTotalWorldSize } from '../world/methods/getTotalWorldSize';
import { ResizeCallback } from '../world/types';

export const universeResizeCallbacks: ResizeCallback[] = [];

export const universe = {
	worlds,
	getSize: getTotalWorldSize,
	onResize,
};

function onResize(callback: ResizeCallback) {
	universeResizeCallbacks.push(callback);

	return () => {
		universeResizeCallbacks.splice(universeResizeCallbacks.indexOf(callback), 1);
	};
}
