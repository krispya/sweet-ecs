import { SYMBOLS, worlds } from 'bitecs';

export function getTotalWorldSize() {
	let totalSize = 0;
	for (const world of worlds) {
		totalSize += world[SYMBOLS.$size];
	}
	return totalSize;
}
