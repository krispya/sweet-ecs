import {
	BufferAttribute,
	Camera,
	InstancedBufferAttribute,
	InstancedMesh,
	Material,
	Mesh,
	Object3D,
	Scene,
	WebGLRenderer,
	WebGLRendererParameters,
} from 'three';
import { bindMatrix4 } from './utils/bind-matrix4';
import { createTwin } from './utils/create-twin';
import { detachMeshInstance } from './utils/detach-mesh-instance';
import { hashMesh } from './utils/hash-mesh';
import { nearestPowerOfTwo } from './utils/nearest-power-of-two';
import { wrapBufferGeometryMethods } from './utils/wrap-buffer-geometry-methods';
import { bindBufferAttribute } from './utils/bind-buffer-attribute';

export type AutoInstanceWebGLRendererParaemters = WebGLRendererParameters & {
	threshold?: number;
};

export class AutoInstanceWebGLRenderer extends WebGLRenderer {
	registry = new Map<string, { set: Set<Mesh>; array: Mesh[] }>();
	twins = new Map<Object3D, Object3D>();
	transformedScene = new Scene();
	threshold = 2;

	constructor(parameters?: AutoInstanceWebGLRendererParaemters) {
		super(parameters);

		const superRender = this.render.bind(this);

		if (parameters?.threshold) this.threshold = parameters.threshold;

		this.render = function render(scene: Object3D, camera: Camera): void {
			// Process the scene the first time we see it.
			if (!scene.userData?.isInstanced) {
				// Create a registry of meshes that can be instanced.
				scene.traverse((child) => {
					if (!(child instanceof Mesh) || child instanceof InstancedMesh) return;

					const hash = hashMesh(child);

					if (!this.registry.has(hash)) {
						this.registry.set(hash, { set: new Set(), array: [] });
					}

					this.registry.get(hash)!.set.add(child);
					this.registry.get(hash)!.array.push(child);
					child.userData.hash = hash;
				});

				// Create instanced scene from the registry of meshes.
				for (const [key, meshes] of this.registry.entries()) {
					// If there aren't enough meshes to instance, create twins instead.
					if (meshes.array.length < this.threshold) {
						for (const mesh of meshes.array) createTwin(mesh, this);
						continue;
					}

					// Use the first mesh to create the instanced mesh.
					const mesh = meshes.array[0];
					const instancedMesh = new InstancedMesh(
						mesh.geometry.clone(),
						(mesh.material as Material).clone(),
						nearestPowerOfTwo(meshes.array.length)
					);
					instancedMesh.count = meshes.array.length;
					instancedMesh.name = key;

					// For each attribute in the geometry, create a new buffer attribute for the instanced mesh.
					const attributes = Object.keys(mesh.geometry.attributes);
					for (const attribute of attributes) {
						if (attribute === 'position' || attribute === 'uv' || attribute === 'normal') continue; //prettier-ignore

						const buffer = mesh.geometry.getAttribute(attribute);
						const instanceBuffer = new InstancedBufferAttribute(
							new Float32Array(buffer.array.length * instancedMesh.count),
							buffer.itemSize
						);
						instancedMesh.geometry.setAttribute(attribute, instanceBuffer);
					}

					for (let i = 0; i < meshes.array.length; i++) {
						const mesh = meshes.array[i];

						// Save the instance ID.
						mesh.userData.instanceId = i;

						// Set the matrix of the instanced mesh to the matrix of the mesh.
						instancedMesh.setMatrixAt(i, mesh.matrix);
						bindMatrix4(instancedMesh, i, mesh.matrix);

						// Copy the attributes from the mesh to the instanced mesh.
						const attributes = Object.keys(mesh.geometry.attributes);
						for (const attribute of attributes) {
							if (attribute === 'position' || attribute === 'uv' || attribute === 'normal') continue; //prettier-ignore

							const buffer = mesh.geometry.getAttribute(attribute) as BufferAttribute;
							const instanceBuffer = instancedMesh.geometry.getAttribute(
								attribute
							) as InstancedBufferAttribute;
							bindBufferAttribute(instanceBuffer, i, buffer);
						}

						// Copy the geoemetry resources from the instanced mesh so CPU memory gets GCed.
						const stableGeoProps = { name: mesh.geometry.name, uuid: mesh.geometry.uuid };
						Object.assign(mesh.geometry, instancedMesh.geometry);
						Object.assign(mesh.geometry, stableGeoProps);

						// Wrap all methods that mutate the geometry so they break instancing when invoked.
						wrapBufferGeometryMethods(mesh.geometry, () => detachMeshInstance(this, mesh, instancedMesh)); //prettier-ignore

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

			// Update matrices of scene.
			scene.updateMatrixWorld();

			// Render the instanced scene.
			superRender(this.transformedScene, camera);
		};
	}
}
