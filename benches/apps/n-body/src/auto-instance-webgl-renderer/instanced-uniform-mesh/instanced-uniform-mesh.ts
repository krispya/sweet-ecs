// Derived from Troika: https://github.com/protectwise/troika/tree/main
// Source: https://github.com/protectwise/troika/blob/main/packages/three-instanced-uniforms-mesh/src/InstancedUniformsMesh.js

import {
	BufferAttribute,
	Color,
	InstancedBufferAttribute,
	InstancedMesh,
	InterleavedBufferAttribute,
	Material,
	Matrix3,
	Matrix4,
	Quaternion,
	Vector2,
	Vector3,
	Vector4,
} from 'three';
import { DerivedBufferGeometry } from './derived-objects/derived-buffer-geometry';
import { InstancedUniformDerivedMaterial } from './derived-objects/types';
import { getShadersForMaterial } from './utils/get-shaders-for-material';

type UniformValue =
	| number
	| Vector2
	| Vector3
	| Vector4
	| Color
	| any[]
	| Matrix3
	| Matrix4
	| Quaternion;

export class InstancedUniformsMesh<T extends Material = Material> extends InstancedMesh {
	private _maxCount: number;
	private _instancedUniformNames: string[];
	private _baseMaterial: T;
	derivedMaterial: InstancedUniformDerivedMaterial<T>;

	constructor(
		geometry: DerivedBufferGeometry,
		material: InstancedUniformDerivedMaterial<T>,
		count: number
	) {
		super(geometry, material, count);
		this._maxCount = count;
		this._instancedUniformNames = []; //treated as immutable
		this._baseMaterial = material.baseMaterial;
		this.derivedMaterial = material;
	}

	// @ts-expect-error
	get customDepthMaterial() {
		return this.derivedMaterial.getDepthMaterial();
	}

	// @ts-expect-error
	get customDistanceMaterial() {
		return this.derivedMaterial.getDistanceMaterial();
	}

	/**
	 * Set the value of a shader uniform for a single instance.
	 * @param {string} name - the name of the shader uniform
	 * @param {number} index - the index of the instance to set the value for
	 * @param {number|Vector2|Vector3|Vector4|Color|Array|Matrix3|Matrix4|Quaternion} value - the uniform value for this instance
	 */

	setUniformAt(name: string, index: number, value: UniformValue) {
		const attrs = this.geometry.attributes;
		const attrName = `pmndrs_attr_${name}`;
		let attr = attrs[attrName];

		if (!attr) {
			const defaultValue = getDefaultUniformValue(this._baseMaterial, name);
			const itemSize = getItemSizeForValue(defaultValue);
			attr = attrs[attrName] = new InstancedBufferAttribute(
				new Float32Array(itemSize * this._maxCount),
				itemSize
			);

			// Fill with default value:
			if (defaultValue !== null) {
				for (let i = 0; i < this._maxCount; i++) {
					setAttributeValue(attr, i, defaultValue);
				}
			}

			this._instancedUniformNames = [...this._instancedUniformNames, name];
			this.updateUniformNames();
		}

		setAttributeValue(attr, index, value);
		attr.needsUpdate = true;
	}

	/**
	 * Unset all instance-specific values for a given uniform, reverting back to the original
	 * uniform value for all.
	 * @param {string} name
	 */

	unsetUniform(name: string) {
		this.geometry.deleteAttribute(`pmndrs_attr_${name}`);
		this._instancedUniformNames = this._instancedUniformNames.filter((n) => n !== name);
	}

	updateUniformNames() {
		this.derivedMaterial.setUniformNames(this._instancedUniformNames);
	}
}

function setAttributeValue(
	attr: BufferAttribute | InterleavedBufferAttribute,
	index: number,
	value: any
) {
	let size = attr.itemSize;
	if (size === 1) {
		attr.setX(index, value);
	} else if (size === 2) {
		attr.setXY(index, value.x, value.y);
	} else if (size === 3) {
		if (value.isColor) {
			attr.setXYZ(index, value.r, value.g, value.b);
		} else {
			attr.setXYZ(index, value.x, value.y, value.z);
		}
	} else if (size === 4) {
		attr.setXYZW(index, value.x, value.y, value.z, value.w);
	} else if (value.toArray) {
		value.toArray(attr.array, index * size);
	} else {
		(attr as BufferAttribute).set(value, index * size);
	}
}

function getDefaultUniformValue<T extends Material>(material: T, name: string) {
	// Try uniforms on the material itself, then try the builtin material shaders
	// @ts-expect-error - Assumes uniforms exist.
	let uniforms = material.uniforms;
	if (uniforms && uniforms[name]) {
		return uniforms[name].value;
	}

	// @ts-expect-error - Assumes uniforms exist.
	uniforms = getShadersForMaterial(material).uniforms;
	if (uniforms && uniforms[name]) {
		return uniforms[name].value;
	}

	return null;
}

function getItemSizeForValue(value: any) {
	return value == null
		? 0
		: typeof value === 'number'
		? 1
		: value.isVector2
		? 2
		: value.isVector3 || value.isColor
		? 3
		: value.isVector4 || value.isQuaternion
		? 4
		: value.elements
		? value.elements.length
		: Array.isArray(value)
		? value.length
		: 0;
}
