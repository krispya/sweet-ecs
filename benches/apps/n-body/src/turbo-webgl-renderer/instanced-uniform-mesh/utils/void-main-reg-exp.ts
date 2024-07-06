// Derived from Troika: https://github.com/protectwise/troika/tree/main
// Source: https://github.com/protectwise/troika/blob/main/packages/troika-three-utils/src/voidMainRegExp.js

/**
 * Regular expression for matching the `void main() {` opener line in GLSL.
 * @type {RegExp}
 */

export const voidMainRegExp = /\bvoid\s+main\s*\(\s*\)\s*{/g;
