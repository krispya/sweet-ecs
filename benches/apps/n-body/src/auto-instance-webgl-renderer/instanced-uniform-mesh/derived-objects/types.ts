import { Material, MeshDepthMaterial, MeshDistanceMaterial } from 'three';

export type DerivedMaterialOptions = {
	defines?: Record<string, string>;
	extensions?: Record<string, boolean>;
	uniforms?: Record<string, any>;
	vertexDefs?: string;
	vertexMainIntro?: string;
	vertexMainOutro?: string;
	vertexTransform?: string;
	fragmentDefs?: string;
	fragmentMainIntro?: string;
	fragmentMainOutro?: string;
	fragmentColorTransform?: string;
	customRewriter?: (shaderInfo: { vertexShader: string; fragmentShader: string }) => {
		vertexShader: string;
		fragmentShader: string;
	};
	chained?: boolean;
};

export type DerivedMaterial<T extends Material> = T & {
	baseMaterial: T;
	isDerivedMaterial: true;
	getDepthMaterial(): MeshDepthMaterial;
	getDistanceMaterial(): MeshDistanceMaterial;
	uniforms: Record<string, any>;
	defines: Record<string, any>;
	extensions: Record<string, any>;
	_depthMaterial?: MeshDepthMaterial;
	_distanceMaterial?: MeshDistanceMaterial;
};

export type DerivedMaterialConstructor<T extends Material> = new () => DerivedMaterial<T>;

export type InstancedUniformDerivedMaterial<T extends Material> = DerivedMaterial<T> & {
	isInstancedUniformsMaterial: true;
	setUniformNames(names: string[]): void;
};
