import { SYMBOLS, worlds } from 'bitecs';

export function getTotalWorldSize() {
	let totalSize = 0;
	for (const world of worlds) {
		// TODO: A workaround for not having world resize events in bitECS.
		// We will refactor this away eventually.
		const size = world[SYMBOLS.$size] === -1 ? 100_000 : world[SYMBOLS.$size];
		totalSize += size;
	}
	return totalSize;
}
