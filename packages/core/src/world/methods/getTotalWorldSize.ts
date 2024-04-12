import { SYMBOLS, worlds } from '@bitecs/classic';

export function getTotalWorldSize() {
	let totalSize = 0;
	for (const world of worlds) {
		totalSize += world[SYMBOLS.$size];
	}
	return totalSize;
}
