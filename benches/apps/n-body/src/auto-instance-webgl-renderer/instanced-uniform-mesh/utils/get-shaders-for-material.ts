// Derived from Troika: https://github.com/protectwise/troika/tree/main
// Source: https://github.com/protectwise/troika/blob/main/packages/troika-three-utils/src/getShadersForMaterial.js

import { Material, ShaderLib } from 'three';

// Copied from threejs WebGLPrograms.js so we can resolve builtin materials to their shaders
// TODO how can we keep this from getting stale?
const MATERIAL_TYPES_TO_SHADERS = {
	MeshDepthMaterial: 'depth',
	MeshDistanceMaterial: 'distanceRGBA',
	MeshNormalMaterial: 'normal',
	MeshBasicMaterial: 'basic',
	MeshLambertMaterial: 'lambert',
	MeshPhongMaterial: 'phong',
	MeshToonMaterial: 'toon',
	MeshStandardMaterial: 'physical',
	MeshPhysicalMaterial: 'physical',
	MeshMatcapMaterial: 'matcap',
	LineBasicMaterial: 'basic',
	LineDashedMaterial: 'dashed',
	PointsMaterial: 'points',
	ShadowMaterial: 'shadow',
	SpriteMaterial: 'sprite',
} as const;

type MaterialType = keyof typeof MATERIAL_TYPES_TO_SHADERS;

/**
 * Given a Three.js `Material` instance, find the shaders/uniforms that will be
 * used to render that material.
 *
 * @param material - the Material instance
 * @return {object} - the material's shader info: `{uniforms:{}, fragmentShader:'', vertexShader:''}`
 */

export function getShadersForMaterial<T extends Material>(material: T) {
	let builtinType = MATERIAL_TYPES_TO_SHADERS[material.type as MaterialType];
	return builtinType ? ShaderLib[builtinType] : material; //TODO fallback for unknown type?
}
