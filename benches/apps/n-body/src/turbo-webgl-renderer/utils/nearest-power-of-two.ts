export function nearestPowerOfTwo(size: number): number {
	if (size <= 0) throw new Error('Size must be a positive number.');
	if (size && (size & (size - 1)) === 0) return size;

	let power = 1;
	while (power < size) {
		power <<= 1;
	}

	return power;
}
