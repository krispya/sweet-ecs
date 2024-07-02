// Derived from Troika: https://github.com/protectwise/troika/tree/main
// Source: https://github.com/protectwise/troika/blob/main/packages/troika-three-utils/src/DerivedMaterial.js

import {
	Material,
	MathUtils,
	MeshDepthMaterial,
	MeshDistanceMaterial,
	RGBADepthPacking,
	ShaderMaterial,
	UniformsUtils,
} from 'three';
import { getKeyForOptions } from '../utils/get-key-from-options.js';
import { upgradeShaders } from '../utils/upgrade-shaders.js';
import { DerivedMaterialOptions, DerivedMaterial, DerivedMaterialConstructor } from './types.js';

const constructorCache = new WeakMap<Material, Record<string, DerivedMaterialConstructor<any>>>();
const upgradedShaderCache = new Map<
	string,
	{
		vertexShader: string;
		fragmentShader: string;
	}
>();

// Material ids must be integers, but we can't access the increment from Three's `Material` module,
// so let's choose a sufficiently large starting value that should theoretically never collide.
let materialInstanceId = 1e10;

/**
 * A utility for creating a custom shader material derived from another material's
 * shaders. This allows you to inject custom shader logic and transforms into the
 * builtin ThreeJS materials without having to recreate them from scratch.
 *
 * @param {THREE.Material} baseMaterial - the original material to derive from
 *
 * @param {Object} options - How the base material should be modified.
 * @param {Object} options.defines - Custom `defines` for the material
 * @param {Object} options.extensions - Custom `extensions` for the material, e.g. `{derivatives: true}`
 * @param {Object} options.uniforms - Custom `uniforms` for use in the modified shader. These can
 *        be accessed and manipulated via the resulting material's `uniforms` property, just like
 *        in a ShaderMaterial. You do not need to repeat the base material's own uniforms here.
 * @param {String} options.vertexDefs - Custom GLSL code to inject into the vertex shader's top-level
 *        definitions, above the `void main()` function.
 * @param {String} options.vertexMainIntro - Custom GLSL code to inject at the top of the vertex
 *        shader's `void main` function.
 * @param {String} options.vertexMainOutro - Custom GLSL code to inject at the end of the vertex
 *        shader's `void main` function.
 * @param {String} options.vertexTransform - Custom GLSL code to manipulate the `position`, `normal`,
 *        and/or `uv` vertex attributes. This code will be wrapped within a standalone function with
 *        those attributes exposed by their normal names as read/write values.
 * @param {String} options.fragmentDefs - Custom GLSL code to inject into the fragment shader's top-level
 *        definitions, above the `void main()` function.
 * @param {String} options.fragmentMainIntro - Custom GLSL code to inject at the top of the fragment
 *        shader's `void main` function.
 * @param {String} options.fragmentMainOutro - Custom GLSL code to inject at the end of the fragment
 *        shader's `void main` function. You can manipulate `gl_FragColor` here but keep in mind it goes
 *        after any of ThreeJS's color postprocessing shader chunks (tonemapping, fog, etc.), so if you
 *        want those to apply to your changes use `fragmentColorTransform` instead.
 * @param {String} options.fragmentColorTransform - Custom GLSL code to manipulate the `gl_FragColor`
 *        output value. Will be injected near the end of the `void main` function, but before any
 *        of ThreeJS's color postprocessing shader chunks (tonemapping, fog, etc.), and before the
 *        `fragmentMainOutro`.
 * @param {function<{vertexShader,fragmentShader}>:{vertexShader,fragmentShader}} options.customRewriter - A function
 *        for performing custom rewrites of the full shader code. Useful if you need to do something
 *        special that's not covered by the other builtin options. This function will be executed before
 *        any other transforms are applied.
 * @param {boolean} options.chained - Set to `true` to prototype-chain the derived material to the base
 *        material, rather than the default behavior of copying it. This allows the derived material to
 *        automatically pick up changes made to the base material and its properties. This can be useful
 *        where the derived material is hidden from the user as an implementation detail, allowing them
 *        to work with the original material like normal. But it can result in unexpected behavior if not
 *        handled carefully.
 *
 * @return {THREE.Material}
 *
 * The returned material will also have two new methods, `getDepthMaterial()` and `getDistanceMaterial()`,
 * which can be called to get a variant of the derived material for use in shadow casting. If the
 * target mesh is expected to cast shadows, then you can assign these to the mesh's `customDepthMaterial`
 * (for directional and spot lights) and/or `customDistanceMaterial` (for point lights) properties to
 * allow the cast shadow to honor your derived shader's vertex transforms and discarded fragments. These
 * will also set a custom `#define IS_DEPTH_MATERIAL` or `#define IS_DISTANCE_MATERIAL` that you can look
 * for in your derived shaders with `#ifdef` to customize their behavior for the depth or distance
 * scenarios, e.g. skipping antialiasing or expensive shader logic.
 */

export function createDerivedMaterial<T extends Material>(
	baseMaterial: T,
	options: DerivedMaterialOptions
) {
	// Generate a key that is unique to the content of these `options`. We'll use this
	// throughout for caching and for generating the upgraded shader code. This increases
	// the likelihood that the resulting shaders will line up across multiple calls so
	// their GL programs can be shared and cached.
	const optionsKey = getKeyForOptions(options);

	// First check to see if we've already derived from this baseMaterial using this
	// unique set of options, and if so reuse the constructor to avoid some allocations.
	let constructors = constructorCache.get(baseMaterial);

	if (!constructors) {
		constructors = {};
		constructorCache.set(baseMaterial, constructors);
	}
	if (constructors[optionsKey]) {
		return new constructors[optionsKey]();
	}

	const privateBeforeCompileProp = `_onBeforeCompile${optionsKey}`;

	// Private onBeforeCompile handler that injects the modified shaders and uniforms when
	// the renderer switches to this material's program
	const onBeforeCompile: Material['onBeforeCompile'] = function (
		this: DerivedMaterial<T>,
		shaderInfo,
		renderer
	) {
		baseMaterial.onBeforeCompile.call(this, shaderInfo, renderer);

		// Upgrade the shaders, caching the result by incoming source code
		const cacheKey = this.customProgramCacheKey() +	'|' + shaderInfo.vertexShader +	'|' + shaderInfo.fragmentShader; //prettier-ignore
		let upgradedShaders = upgradedShaderCache.get(cacheKey);
		if (!upgradedShaders) {
			const upgraded = upgradeShaders(this, shaderInfo, options, optionsKey);
			upgradedShaders = upgraded;
			upgradedShaderCache.set(cacheKey, upgraded);
		}

		// Inject upgraded shaders and uniforms into the program
		shaderInfo.vertexShader = upgradedShaders.vertexShader;
		shaderInfo.fragmentShader = upgradedShaders.fragmentShader;
		Object.assign(shaderInfo.uniforms, this.uniforms);

		// Users can still add their own handlers on top of ours
		// @ts-expect-error
		if (this[privateBeforeCompileProp]) {
			// @ts-expect-error
			this[privateBeforeCompileProp](shaderInfo);
		}
	};

	const DerivedMaterial = function DerivedMaterial() {
		return derive(options.chained ? baseMaterial : baseMaterial.clone());
	} as unknown as DerivedMaterialConstructor<T>;

	const derive = function (base: T): DerivedMaterial<T> {
		// Prototype chain to the base material
		const derived = Object.create(base, descriptor);

		// Store the baseMaterial for reference; this is always the original even when cloning
		Object.defineProperty(derived, 'baseMaterial', { value: baseMaterial });

		// Needs its own ids
		Object.defineProperty(derived, 'id', { value: materialInstanceId++ });
		derived.uuid = MathUtils.generateUUID();

		// Merge uniforms, defines, and extensions
		derived.defines = Object.assign({}, base.defines, options.defines);
		derived.defines[`PMNDRS_DERIVED_MATERIAL_${optionsKey}`] = ''; //force a program change from the base material

		const baseUniforms = base instanceof ShaderMaterial ? base.uniforms : {};
		derived.uniforms = Object.assign({}, baseUniforms, options.uniforms);

		const baseExtensions = base instanceof ShaderMaterial ? base.extensions : {};
		derived.extensions = Object.assign({}, baseExtensions, options.extensions);

		// Don't inherit EventDispatcher listeners
		derived._listeners = undefined;

		return derived;
	};

	const descriptor = {
		constructor: { value: DerivedMaterial },
		isDerivedMaterial: { value: true },

		customProgramCacheKey: {
			writable: true,
			configurable: true,
			value: function () {
				return baseMaterial.customProgramCacheKey() + '|' + optionsKey;
			},
		},

		onBeforeCompile: {
			get() {
				return onBeforeCompile;
			},
			set(fn: Material['onBeforeCompile']) {
				// @ts-expect-error
				this[privateBeforeCompileProp] = fn;
			},
		},

		copy: {
			writable: true,
			configurable: true,
			value: function (this: DerivedMaterial<T>, source: DerivedMaterial<T>) {
				baseMaterial.copy.call(this, source);
				if (!isShaderMaterial(baseMaterial) && !isDerivedMaterial(baseMaterial)) {
					Object.assign(this.extensions, source.extensions);
					Object.assign(this.defines, source.defines);
					Object.assign(this.uniforms, UniformsUtils.clone(source.uniforms));
				}
				return this;
			},
		},

		clone: {
			writable: true,
			configurable: true,
			value: function (this: DerivedMaterial<T>) {
				const newBase = new (baseMaterial.constructor as new () => T)();
				return derive(newBase).copy(this);
			},
		},

		/**
		 * Utility to get a MeshDepthMaterial that will honor this derived material's vertex
		 * transformations and discarded fragments.
		 */
		getDepthMaterial: {
			writable: true,
			configurable: true,
			value: function (this: DerivedMaterial<T>) {
				let depthMaterial = this._depthMaterial;

				if (!depthMaterial) {
					depthMaterial = this._depthMaterial = createDerivedMaterial(
						isDerivedMaterial(baseMaterial)
							? (baseMaterial as DerivedMaterial<T>).getDepthMaterial()
							: new MeshDepthMaterial({ depthPacking: RGBADepthPacking }),
						options
					);

					depthMaterial!.defines!.IS_DEPTH_MATERIAL = '';
					// @ts-expect-error - Troika is adding their own uniforms
					depthMaterial!.uniforms = this.uniforms; //automatically recieve same uniform values
				}

				return depthMaterial;
			},
		},

		/**
		 * Utility to get a MeshDistanceMaterial that will honor this derived material's vertex
		 * transformations and discarded fragments.
		 */
		getDistanceMaterial: {
			writable: true,
			configurable: true,
			value: function (this: DerivedMaterial<T>) {
				let distanceMaterial = this._distanceMaterial;

				if (!distanceMaterial) {
					distanceMaterial = this._distanceMaterial = createDerivedMaterial(
						isDerivedMaterial(baseMaterial)
							? (baseMaterial as DerivedMaterial<T>).getDistanceMaterial()
							: new MeshDistanceMaterial(),
						options
					);

					distanceMaterial!.defines!.IS_DISTANCE_MATERIAL = '';
					// @ts-expect-error - Troika is adding their own uniforms
					distanceMaterial!.uniforms = this.uniforms; //automatically recieve same uniform values
				}

				return distanceMaterial;
			},
		},

		dispose: {
			writable: true,
			configurable: true,
			value(this: DerivedMaterial<T>) {
				const { _depthMaterial, _distanceMaterial } = this;
				if (_depthMaterial) _depthMaterial.dispose();
				if (_distanceMaterial) _distanceMaterial.dispose();
				baseMaterial.dispose.call(this);
			},
		},
	};

	constructors[optionsKey] = DerivedMaterial;

	return new DerivedMaterial();
}

function isShaderMaterial(material: Material): material is ShaderMaterial {
	return (material as ShaderMaterial).isShaderMaterial;
}

function isDerivedMaterial(material: Material): material is DerivedMaterial<any> {
	return (material as DerivedMaterial<any>).isDerivedMaterial;
}
