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
import { InstancedUniformsMesh } from './instanced-uniform-mesh/instanced-uniform-mesh';
import { MeshRegistry } from './types';
import { bindMatrix4 } from './utils/bind-matrix4';
import { createInstancedMeshFromRegistry } from './utils/create-instanced-mesh-from-registry';
import { createMeshRegistry } from './utils/create-mesh-registry';
import { createTwin } from './utils/create-twin';
import { detachMeshInstance } from './utils/detach-mesh-instance';
import { wrapBufferAttribute } from './utils/wrap-buffer-attribute';
import { wrapBufferGeometryMethods } from './utils/wrap-buffer-geometry-methods';
import { UniformValue } from './instanced-uniform-mesh/types';
import { bindMaterial } from './utils/bind-material';

export type AutoInstanceWebGLRendererParaemters = WebGLRendererParameters & {
	threshold?: number;
};

export class AutoInstanceWebGLRenderer extends WebGLRenderer {
	registry = new Map<string, MeshRegistry>();
	twins = new Map<Object3D, Object3D>();
	renderScene = new Scene();
	threshold = 2;

	constructor(parameters?: AutoInstanceWebGLRendererParaemters) {
		super(parameters);
		if (parameters?.threshold) this.threshold = parameters.threshold;

		const superRender = this.render.bind(this);
		this.render = function render(scene: Scene, camera: Camera): void {
			// Process the scene the first time we see it.
			if (!scene.userData?.isInstanced) this.initScene(scene);

			// Update matrices of scene.
			scene.updateMatrixWorld();

			// scene.traverse((object) => {
			// 	if (!(object instanceof Mesh)) return;

			// 	const instanceId = object.userData.instanceId;
			// 	const instancedMesh = object.userData.boundMesh as InstancedUniformsMesh;
			// 	instancedMesh.setUniformAt('diffuse', instanceId, object.material.color);
			// });

			// Preprocess main scene.
			scene.traverse((object) => {
				if (object instanceof Mesh) processMaterial(object);
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
		this.renderScene.matrixWorldAutoUpdate = false;
		this.renderScene.matrixAutoUpdate = false;

		// Create a registry of meshes that can be instanced.
		createMeshRegistry(scene, this.registry);

		// Create instanced scene from the registry of meshes.
		for (const [, meshRegistry] of this.registry.entries()) {
			// If there aren't enough meshes to instance, create twins instead.
			const isMaterialArrayWithoutSahred = meshRegistry.isMaterialArray && !meshRegistry.isShared.material; //prettier-ignore
			if (meshRegistry.array.length < this.threshold || isMaterialArrayWithoutSahred) {
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
				}

				if (!meshRegistry.isShared.material) {
					bindMaterial(mesh.material as Material);
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

			this.renderScene.add(instancedMesh);
		}

		console.log('scene', scene);
		console.log('instancedScene', this.renderScene);

		scene.userData.isInstanced = true;
	}
}

const allow = ['color', 'opacity', 'alphaTest', 'emissive'];
const uniformMap = {
	color: 'diffuse',
	opacity: 'opacity',
	emissive: 'emissive',
	alphaTest: 'alphaTest',
};
const exclude = ['uuid', 'id', 'userData', 'version'];

function processMaterial(mesh: Mesh) {
	// Skip twins as they pass through.
	if (mesh.userData.twin) return;

	const instanceId = mesh.userData.instanceId;
	const instancedMesh = mesh.userData.boundMesh;

	// Skip instances that share a material since they don't have per-uniform attributes.
	if (!(instancedMesh instanceof InstancedUniformsMesh)) return;

	const material = mesh.material as Material;
	const instancedMaterial = instancedMesh.material as Material;

	for (let i = 0; i < allow.length; i++) {
		const prop = allow[i];
		const materialValue = material[prop as keyof Material];
		const instancedMaterialValue = instancedMaterial[prop as keyof Material];

		if (materialValue !== instancedMaterialValue) {
			instancedMesh.setUniformAt(
				uniformMap[prop as keyof typeof uniformMap],
				instanceId,
				materialValue as UniformValue
			);
		}
	}

	// Loop over properties of the material and compare to the instanced material.
	// If the prop is different, log it.
	// for (const prop in material) {
	// 	if (exclude.includes(prop)) continue;

	// 	const materialValue = material[prop as keyof Material];
	// 	const instancedMaterialValue = instancedMaterial[prop as keyof Material];

	// 	if (materialValue !== instancedMaterialValue) {
	// 		if (
	// 			materialValue instanceof Color &&
	// 			materialValue.equals(instancedMaterialValue as Color)
	// 		) {
	// 			continue;
	// 		}

	// 		if (
	// 			materialValue instanceof Euler &&
	// 			materialValue.equals(instancedMaterialValue as Euler)
	// 		) {
	// 			continue;
	// 		}

	// 		if (allow.includes(prop)) {
	// 			instancedMesh.setUniformAt(
	// 				uniformMap[prop as keyof typeof uniformMap],
	// 				instanceId,
	// 				materialValue as Color
	// 			);
	// 		} else {
	// 			console.error('material breaking instancing', prop);
	// 		}
	// 	}
	// }
}
