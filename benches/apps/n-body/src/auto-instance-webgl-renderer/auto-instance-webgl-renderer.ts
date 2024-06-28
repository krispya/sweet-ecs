import {
	BufferAttribute,
	Camera,
	InstancedMesh,
	Mesh,
	Object3D,
	Scene,
	WebGLRenderer,
	WebGLRendererParameters,
} from 'three';
import { MeshRegistry } from './types';
import { bindMatrix4 } from './utils/bind-matrix4';
import { createTwin } from './utils/create-twin';
import { detachMeshInstance } from './utils/detach-mesh-instance';
import { hashMesh } from './utils/hash-mesh';
import { nearestPowerOfTwo } from './utils/nearest-power-of-two';
import { wrapBufferAttribute } from './utils/wrap-buffer-attribute';
import { wrapBufferGeometryMethods } from './utils/wrap-buffer-geometry-methods';

export type AutoInstanceWebGLRendererParaemters = WebGLRendererParameters & {
	threshold?: number;
};

export class AutoInstanceWebGLRenderer extends WebGLRenderer {
	registry = new Map<string, MeshRegistry>();
	twins = new Map<Object3D, Object3D>();
	transformedScene = new Scene();
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

			// Render the instanced scene.
			superRender(this.transformedScene, camera);
		};
	}

	init(scene: Scene, camera: Camera) {
		this.initScene(scene);
		this.compile(scene, camera);
	}

	initScene(scene: Scene) {
		this.transformedScene.matrixWorldAutoUpdate = false;
		this.transformedScene.matrixAutoUpdate = false;

		// Create a registry of meshes that can be instanced.
		createMeshRegistry(scene, this.registry);

		// Create instanced scene from the registry of meshes.
		for (const [, meshRegistry] of this.registry.entries()) {
			// If there aren't enough meshes to instance, create twins instead.
			if (meshRegistry.array.length < this.threshold) {
				for (const mesh of meshRegistry.array) createTwin(mesh, this);
				continue;
			}

			const instancedMesh = createInstancedMeshFromRegistry(meshRegistry);

			// Bind each mesh to the instanced mesh.
			for (let i = 0; i < meshRegistry.array.length; i++) {
				const mesh = meshRegistry.array[i];

				// Save the instance ID.
				mesh.userData.instanceId = i;

				// Set the matrix of the instanced mesh to the matrix of the mesh.
				instancedMesh.setMatrixAt(i, mesh.matrixWorld);
				bindMatrix4(instancedMesh, i, mesh.matrixWorld);

				// If mesh resources are shared, don't touch them.
				if (!meshRegistry.isShared) {
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
					wrapBufferGeometryMethods(mesh.geometry, () => detachMeshInstance(this, mesh, instancedMesh)); //prettier-ignore

					// Wrap all buffer attributes.
					for (const name in mesh.geometry.attributes) {
						const attribute = mesh.geometry.attributes[name] as BufferAttribute;
						wrapBufferAttribute(attribute, () => detachMeshInstance(this, mesh, instancedMesh)); //prettier-ignore
					}
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

			this.transformedScene.add(instancedMesh);
		}

		console.log('scene', scene);
		console.log('instancedScene', this.transformedScene);
		console.log('init: geometries', this.info.memory.geometries);

		scene.userData.isInstanced = true;
	}
}

function createInstancedMeshFromRegistry(meshRegistry: MeshRegistry) {
	// Use the first mesh to create the instanced mesh.
	const mesh = meshRegistry.array[0];

	let geometry = mesh.geometry;
	let material = mesh.material;

	if (!meshRegistry.isShared) {
		geometry = mesh.geometry.clone();
		material = Array.isArray(mesh.material)
			? mesh.material.map((m) => m.clone())
			: mesh.material.clone();
	}

	const instancedMesh = new InstancedMesh(
		geometry,
		material,
		nearestPowerOfTwo(meshRegistry.array.length)
	);

	instancedMesh.count = meshRegistry.array.length;
	instancedMesh.name = meshRegistry.hash;

	return instancedMesh;
}

function createMeshRegistry(scene: Scene, registry: Map<string, MeshRegistry>) {
	scene.traverse((child) => {
		if (!(child instanceof Mesh) || child instanceof InstancedMesh) return;

		const hash = hashMesh(child);

		if (!registry.has(hash)) {
			registry.set(hash, { set: new Set(), array: [], isShared: true, hash });
		}

		const meshRegistry = registry.get(hash)!;

		let isShared = false;
		if (meshRegistry.set.size > 0) {
			const first = meshRegistry.array[0];
			isShared = first.geometry === child.geometry && first.material === child.material;
		}

		meshRegistry.set.add(child);
		meshRegistry.array.push(child);
		meshRegistry.isShared = isShared;

		child.userData.hash = hash;
	});
}
