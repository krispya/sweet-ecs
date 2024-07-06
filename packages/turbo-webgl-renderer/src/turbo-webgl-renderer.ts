import {
	BufferAttribute,
	Camera,
	Color,
	Euler,
	Material,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	Scene,
	WebGLRenderer,
	WebGLRendererParameters,
} from 'three';
import { EXCLUDED_MAT_PROPS } from './constants';
import { InstancedUniformsMesh } from './instanced-uniform-mesh/instanced-uniform-mesh';
import { MeshRegistry } from './types';
import { bindMatrix4 } from './utils/bind-matrix4';
import { createInstancedMeshFromRegistry } from './utils/create-instanced-mesh-from-registry';
import { createMeshRegistry } from './utils/create-mesh-registry';
import { createTwin } from './utils/create-twin';
import { detachMeshInstance } from './utils/detach-mesh-instance';
import { wrapBufferAttribute } from './utils/wrap-buffer-attribute';
import { wrapBufferGeometryMethods } from './utils/wrap-buffer-geometry-methods';

export type TurboWebGLRendererParaemters = WebGLRendererParameters & {
	threshold?: number;
};

export class TurboWebGLRenderer extends WebGLRenderer {
	registry = new Map<string, MeshRegistry>();
	twins = new Map<Object3D, Object3D>();
	renderScene = new Scene();
	threshold = 2;

	constructor(parameters?: TurboWebGLRendererParaemters) {
		super(parameters);
		if (parameters?.threshold) this.threshold = parameters.threshold;

		const superRender = this.render.bind(this);
		this.render = function render(scene: Scene, camera: Camera): void {
			// Process the scene the first time we see it.
			if (!scene.userData?.isInstanced) this.initScene(scene);

			// Update matrices of scene.
			scene.updateMatrixWorld();

			// Preprocess the main scene for material changes.
			// Inlined for brrr.
			scene.traverse((object) => {
				if (!(object instanceof Mesh)) return;
				const mesh = object as Mesh;
				// Skip twins as they pass through.
				if (mesh.userData.twin) return;

				const instanceId = mesh.userData.instanceId;
				const instancedMesh = mesh.userData.boundMesh;

				// Skip instances that share a material since they don't have per-uniform attributes.
				if (!(instancedMesh instanceof InstancedUniformsMesh)) return;

				const material = mesh.material as Material;
				const instancedMaterial = instancedMesh.material as Material;

				if (
					material instanceof MeshBasicMaterial &&
					instancedMaterial instanceof MeshBasicMaterial
				) {
					const color = material.color;
					if (!color.equals(instancedMaterial.color)) {
						instancedMesh.setUniformAt('diffuse', instanceId, color);
					}

					const opacity = material.opacity;
					if (opacity !== instancedMaterial.opacity) {
						instancedMesh.setUniformAt('opacity', instanceId, opacity);
					}

					const alphaTest = material.alphaTest;
					if (alphaTest !== instancedMaterial.alphaTest) {
						instancedMesh.setUniformAt('alphaTest', instanceId, alphaTest);
					}

					// Test non-uniform properties.
					if (
						material.alphaHash !== instancedMaterial.alphaHash ||
						material.alphaMap !== instancedMaterial.alphaMap ||
						material.alphaToCoverage !== instancedMaterial.alphaToCoverage ||
						material.aoMap !== instancedMaterial.aoMap ||
						material.aoMapIntensity !== instancedMaterial.aoMapIntensity ||
						material.blendAlpha !== instancedMaterial.blendAlpha ||
						material.blendDst !== instancedMaterial.blendDst ||
						material.blendDstAlpha !== instancedMaterial.blendDstAlpha ||
						material.blendEquation !== instancedMaterial.blendEquation ||
						material.blendEquationAlpha !== instancedMaterial.blendEquationAlpha ||
						material.blendSrc !== instancedMaterial.blendSrc ||
						material.blendSrcAlpha !== instancedMaterial.blendSrcAlpha ||
						material.blending !== instancedMaterial.blending ||
						material.clipIntersection !== instancedMaterial.clipIntersection ||
						material.clipShadows !== instancedMaterial.clipShadows ||
						material.clippingPlanes !== instancedMaterial.clippingPlanes ||
						material.colorWrite !== instancedMaterial.colorWrite ||
						material.combine !== instancedMaterial.combine ||
						material.depthFunc !== instancedMaterial.depthFunc ||
						material.depthTest !== instancedMaterial.depthTest ||
						material.depthWrite !== instancedMaterial.depthWrite ||
						material.dithering !== instancedMaterial.dithering ||
						material.envMap !== instancedMaterial.envMap ||
						!material.envMapRotation.equals(instancedMaterial.envMapRotation) ||
						material.fog !== instancedMaterial.fog ||
						material.forceSinglePass !== instancedMaterial.forceSinglePass ||
						material.lightMap !== instancedMaterial.lightMap ||
						material.lightMapIntensity !== instancedMaterial.lightMapIntensity ||
						material.map !== instancedMaterial.map ||
						material.polygonOffset !== instancedMaterial.polygonOffset ||
						material.polygonOffsetFactor !== instancedMaterial.polygonOffsetFactor ||
						material.polygonOffsetUnits !== instancedMaterial.polygonOffsetUnits ||
						material.precision !== instancedMaterial.precision ||
						material.premultipliedAlpha !== instancedMaterial.premultipliedAlpha ||
						material.reflectivity !== instancedMaterial.reflectivity ||
						material.refractionRatio !== instancedMaterial.refractionRatio ||
						material.shadowSide !== instancedMaterial.shadowSide ||
						material.side !== instancedMaterial.side ||
						material.specularMap !== instancedMaterial.specularMap ||
						material.stencilFail !== instancedMaterial.stencilFail ||
						material.stencilFunc !== instancedMaterial.stencilFunc ||
						material.stencilFuncMask !== instancedMaterial.stencilFuncMask ||
						material.stencilRef !== instancedMaterial.stencilRef ||
						material.stencilWrite !== instancedMaterial.stencilWrite ||
						material.stencilZFail !== instancedMaterial.stencilZFail ||
						material.stencilZPass !== instancedMaterial.stencilZPass ||
						material.toneMapped !== instancedMaterial.toneMapped ||
						material.transparent !== instancedMaterial.transparent ||
						material.vertexColors !== instancedMaterial.vertexColors ||
						material.visible !== instancedMaterial.visible ||
						material.wireframe !== instancedMaterial.wireframe ||
						material.wireframeLinecap !== instancedMaterial.wireframeLinecap ||
						material.wireframeLinejoin !== instancedMaterial.wireframeLinejoin ||
						material.wireframeLinewidth !== instancedMaterial.wireframeLinewidth
					) {
						detachMeshInstance(this, mesh, instancedMesh);
						return;
					}
				} else {
					// For generic materials we detach if any property changes.
					// TODO: Support all uniforms regardless.
					const keys = Object.keys(material) as (keyof Material)[];
					for (let i = 0; i < keys.length; i++) {
						const key = keys[i];
						if (EXCLUDED_MAT_PROPS.includes(key)) continue;

						const materialValue = material[key];
						const instancedMaterialValue = instancedMaterial[key];

						if (
							materialValue instanceof Color &&
							instancedMaterialValue instanceof Color
						) {
							if (!materialValue.equals(instancedMaterialValue)) {
								detachMeshInstance(this, mesh, instancedMesh);
								return;
							}
						} else if (
							materialValue instanceof Euler &&
							instancedMaterialValue instanceof Euler
						) {
							if (!materialValue.equals(instancedMaterialValue)) {
								detachMeshInstance(this, mesh, instancedMesh);
								return;
							}
						} else if (materialValue !== instancedMaterialValue) {
							detachMeshInstance(this, mesh, instancedMesh);
							return;
						}
					}
				}
			});

			// Render the instanced scene.
			superRender(this.renderScene, camera);
		};
	}

	init(scene: Scene, camera: Camera) {
		this.initScene(scene);
		this.compile(this.renderScene, camera);
	}

	initScene(scene: Scene) {
		// Bind common properties.
		this.renderScene.fog = scene.fog;
		this.renderScene.background = scene.background;
		this.renderScene.environment = scene.environment;
		this.renderScene.overrideMaterial = scene.overrideMaterial;

		this.renderScene.matrixWorldAutoUpdate = false;
		this.renderScene.matrixAutoUpdate = false;

		// Create a registry of meshes that can be instanced.
		createMeshRegistry(scene, this.registry, this);

		// Create instanced scene from the registry of meshes.
		for (const [, meshRegistry] of this.registry.entries()) {
			// If there aren't enough meshes to instance, the material is an array that can't be shared
			// in a single IstancedMesh, or the mesh is flagged as ignored, create twins instead.
			const isMaterialArrayWithoutSahred = meshRegistry.isMaterialArray && !meshRegistry.isShared.material; //prettier-ignore
			if (
				meshRegistry.array.length < this.threshold ||
				isMaterialArrayWithoutSahred ||
				meshRegistry.isIgnored
			) {
				for (const mesh of meshRegistry.array) createTwin(mesh, this);
				continue;
			}

			const instancedMesh = createInstancedMeshFromRegistry(meshRegistry);

			// Bind each mesh to the instanced mesh.
			for (let i = 0; i < meshRegistry.array.length; i++) {
				const mesh = meshRegistry.array[i];

				// Save the instance ID.
				mesh.userData.instanceId = i;
				mesh.userData.boundMesh = instancedMesh;

				// Set the matrix of the instanced mesh to the matrix of the mesh.
				instancedMesh.setMatrixAt(i, mesh.matrixWorld);
				bindMatrix4(instancedMesh, i, mesh.matrixWorld);

				// If mesh resources are shared, don't touch them.
				if (!meshRegistry.isShared.geometry) {
					// Copy the geoemetry resources from the instanced mesh so CPU memory gets GCed.
					const persistentGeoProps = {
						name: mesh.geometry.name,
						uuid: mesh.geometry.uuid,
						attributes: mesh.geometry.attributes,
						userData: mesh.geometry.userData,
					};
					Object.assign(mesh.geometry, instancedMesh.geometry);
					Object.assign(mesh.geometry, persistentGeoProps);

					// Wrap all methods that mutate the geometry so they break instancing when invoked.
					wrapBufferGeometryMethods(mesh.geometry, () => detachMeshInstance(this, mesh, instancedMesh, meshRegistry.isShared)); //prettier-ignore

					// Wrap all buffer attributes.
					for (const name in mesh.geometry.attributes) {
						const attribute = mesh.geometry.attributes[name] as BufferAttribute;
						wrapBufferAttribute(attribute, () => detachMeshInstance(this, mesh, instancedMesh, meshRegistry.isShared)); //prettier-ignore
					}

					// Dispose gets replaced so that it no longer disposes of resources.
					// A dispose callback never gets attached since we never render the virtual object 3D.
					// Still, we want to simulate it so we clean up all the same properties.
					const superDispose = mesh.geometry.dispose;
					mesh.geometry.dispose = function dispose() {
						const geometry = mesh.geometry;
						if (geometry.index) geometry.index = null;
						if (geometry.attributes) geometry.attributes = {};
						if (geometry.morphAttributes) geometry.morphAttributes = {};
						superDispose();
					};
				}
			}

			this.renderScene.add(instancedMesh);
		}

		console.log('scene', scene);
		console.log('instancedScene', this.renderScene);

		scene.userData.isInstanced = true;
	}
}
