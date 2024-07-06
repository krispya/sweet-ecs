import { WebGLProgramParametersWithUniforms } from 'three';
import { DerivedMaterial, DerivedMaterialOptions } from '../derived-objects/types';
import { expandShaderIncludes } from './expand-shader-includes';
import { voidMainRegExp } from './void-main-reg-exp';

export function upgradeShaders<T extends DerivedMaterial<any>>(
	material: T & { map?: any },
	{ vertexShader, fragmentShader }: WebGLProgramParametersWithUniforms,
	options: DerivedMaterialOptions,
	key: string
) {
	let {
		vertexDefs,
		vertexMainIntro,
		vertexMainOutro,
		vertexTransform,
		fragmentDefs,
		fragmentMainIntro,
		fragmentMainOutro,
		fragmentColorTransform,
		customRewriter,
	} = options;

	vertexDefs = vertexDefs || '';
	vertexMainIntro = vertexMainIntro || '';
	vertexMainOutro = vertexMainOutro || '';
	fragmentDefs = fragmentDefs || '';
	fragmentMainIntro = fragmentMainIntro || '';
	fragmentMainOutro = fragmentMainOutro || '';

	// Expand includes if needed
	if (vertexTransform || customRewriter) {
		vertexShader = expandShaderIncludes(vertexShader);
	}
	if (fragmentColorTransform || customRewriter) {
		// We need to be able to find postprocessing chunks after include expansion in order to
		// put them after the fragmentColorTransform, so mark them with comments first. Even if
		// this particular derivation doesn't have a fragmentColorTransform, other derivations may,
		// so we still mark them.
		fragmentShader = fragmentShader.replace(
			/^[ \t]*#include <((?:tonemapping|encodings|fog|premultiplied_alpha|dithering)_fragment)>/gm,
			'\n//!BEGIN_POST_CHUNK $1\n$&\n//!END_POST_CHUNK\n'
		);
		fragmentShader = expandShaderIncludes(fragmentShader);
	}

	// Apply custom rewriter function
	if (customRewriter) {
		let res = customRewriter({ vertexShader, fragmentShader });
		vertexShader = res.vertexShader;
		fragmentShader = res.fragmentShader;
	}

	// The fragmentColorTransform needs to go before any postprocessing chunks, so extract
	// those and re-insert them into the outro in the correct place:
	if (fragmentColorTransform) {
		let postChunks: string[] = [];
		fragmentShader = fragmentShader.replace(
			/^\/\/!BEGIN_POST_CHUNK[^]+?^\/\/!END_POST_CHUNK/gm, // [^]+? = non-greedy match of any chars including newlines
			(match) => {
				postChunks.push(match);
				return '';
			}
		);
		fragmentMainOutro = `${fragmentColorTransform}\n${postChunks.join(
			'\n'
		)}\n${fragmentMainOutro}`;
	}

	// Inject a function for the vertexTransform and rename all usages of position/normal/uv
	if (vertexTransform) {
		// Hoist these defs to the very top so they work in other function defs
		vertexShader = `vec3 pmndrs_position_${key};
vec3 pmndrs_normal_${key};
vec2 pmndrs_uv_${key};
${vertexShader}
`;
		vertexDefs = `${vertexDefs}
void pmndrsVertexTransform${key}(inout vec3 position, inout vec3 normal, inout vec2 uv) {
  ${vertexTransform}
}
`;
		vertexMainIntro = `
pmndrs_position_${key} = vec3(position);
pmndrs_normal_${key} = vec3(normal);
pmndrs_uv_${key} = vec2(uv);
pmndrsVertexTransform${key}(pmndrs_position_${key}, pmndrs_normal_${key}, pmndrs_uv_${key});
${vertexMainIntro}
`;
		vertexShader = vertexShader.replace(
			/\b(position|normal|uv)\b/g,
			(_match, match1, index, fullStr) => {
				return /\battribute\s+vec[23]\s+$/.test(fullStr.substr(0, index))
					? match1
					: `pmndrs_${match1}_${key}`;
			}
		);

		// Three r152 introduced the MAP_UV token, replace it too if it's pointing to the main 'uv'
		// Perhaps the other textures too going forward?
		if (!(material.map && material.map.channel > 0)) {
			vertexShader = vertexShader.replace(/\bMAP_UV\b/g, `pmndrs_uv_${key}`);
		}
	}

	// Inject defs and intro/outro snippets
	vertexShader = injectIntoShaderCode(
		vertexShader,
		key,
		vertexDefs,
		vertexMainIntro,
		vertexMainOutro
	);

	fragmentShader = injectIntoShaderCode(
		fragmentShader,
		key,
		fragmentDefs,
		fragmentMainIntro,
		fragmentMainOutro
	);

	return {
		vertexShader,
		fragmentShader,
	};
}

function injectIntoShaderCode(
	shaderCode: string,
	id: string,
	defs: string,
	intro: string,
	outro: string
) {
	if (intro || outro || defs) {
		shaderCode = shaderCode.replace(
			voidMainRegExp,
			`
${defs}
void pmndrsOrigMain${id}() {`
		);
		shaderCode += `
void main() {
  ${intro}
  pmndrsOrigMain${id}();
  ${outro}
}`;
	}
	return shaderCode;
}
