import { SYMBOLS } from '@bitecs/classic';
import { universe } from '../../universe/universe';

export function getTotalWorldSize() {
	let totalSize = 0;
	for (const world of universe.worlds) {
		totalSize += world[SYMBOLS.$size];
	}
	return totalSize;
}
