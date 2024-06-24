import { BufferGeometry } from 'three';

// prettier-ignore
const excludedMethods = ['dispose', 'constructor', 'clone', 'computeBoundingBox', 'computeBoundingSphere', 'computeTangents', 'computeVertexNormals', 'copy', 'getAttribute', 'getIndex', 'hasAttribute', 'toJSON', 'toNonIndexed']

export function wrapBufferGeometryMethods(geometry: BufferGeometry, callback: () => void) {
	const methodNames = Object.getOwnPropertyNames(BufferGeometry.prototype).filter((prop) => {
		return (
			typeof geometry[prop as keyof BufferGeometry] === 'function' &&
			!excludedMethods.includes(prop)
		);
	});

	methodNames.forEach((methodName) => {
		const originalMethod = (geometry as any)[methodName];
		(geometry as any)[methodName] = function (...args: any[]) {
			callback();
			return originalMethod.apply(geometry, args);
		};
	});

	return geometry;
}

export function resetBufferGeometryMethods(geometry: BufferGeometry) {
	const methodNames = Object.getOwnPropertyNames(BufferGeometry.prototype).filter((prop) => {
		return (
			typeof geometry[prop as keyof BufferGeometry] === 'function' &&
			!excludedMethods.includes(prop)
		);
	});

	methodNames.forEach((methodName) => {
		delete (geometry as any)[methodName];
	});

	return geometry;
}
