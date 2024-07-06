import { Color, InstancedMesh } from 'three';

export function bindInstancedMesh(source: InstancedMesh, target: InstancedMesh) {
	target.instanceMatrix = source.instanceMatrix;
	target.instanceColor = source.instanceColor;
	target.count = source.count;
	target.boundingSphere = source.boundingSphere;
	target.boundingBox = source.boundingBox;

	const sourceSetColorAt = source.setColorAt.bind(source);
	source.setColorAt = function setColorAt(index: number, color: Color) {
		sourceSetColorAt(index, color);
		target.instanceColor = source.instanceColor;
	};

	const sourceComputeBoundingSphere = source.computeBoundingSphere.bind(source);
	source.computeBoundingSphere = function computeBoundingSphere() {
		sourceComputeBoundingSphere();
		target.boundingSphere = source.boundingSphere;
	};

	const sourceComputeBoundingBox = source.computeBoundingBox.bind(source);
	source.computeBoundingBox = function computeBoundingBox() {
		sourceComputeBoundingBox();
		target.boundingBox = source.boundingBox;
	};
}
