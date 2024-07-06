import { BufferGeometry } from 'three';

export function copyGeometryWithoutAttributes(target: BufferGeometry, source: BufferGeometry) {
	target.index = null;
	target.morphAttributes = {};
	target.groups = [];
	target.boundingBox = null;
	target.boundingSphere = null;

	const data = {};
	target.name = source.name;
	const index = source.index;

	if (index !== null) {
		target.setIndex(index.clone());
	}

	// morph attributes

	const morphAttributes = source.morphAttributes;

	for (const name in morphAttributes) {
		const array = [];
		const morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

		for (let i = 0, l = morphAttribute.length; i < l; i++) {
			array.push(morphAttribute[i].clone(data));
		}

		target.morphAttributes[name] = array;
	}

	target.morphTargetsRelative = source.morphTargetsRelative;

	// groups

	const groups = source.groups;

	for (let i = 0, l = groups.length; i < l; i++) {
		const group = groups[i];
		target.addGroup(group.start, group.count, group.materialIndex);
	}

	// bounding box

	const boundingBox = source.boundingBox;

	if (boundingBox !== null) {
		target.boundingBox = boundingBox.clone();
	}

	// bounding sphere

	const boundingSphere = source.boundingSphere;

	if (boundingSphere !== null) {
		target.boundingSphere = boundingSphere.clone();
	}

	// draw range

	target.drawRange.start = source.drawRange.start;
	target.drawRange.count = source.drawRange.count;

	// user data

	target.userData = source.userData;

	return target;
}
