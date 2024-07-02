import { DerivedMaterialOptions } from '../derived-objects/types';

let _idCtr = 0;
const optionsHashesToIds = new Map();

export function getKeyForOptions(options: DerivedMaterialOptions) {
	const optionsHash = JSON.stringify(options, optionsJsonReplacer);
	let id = optionsHashesToIds.get(optionsHash);
	if (id == null) {
		optionsHashesToIds.set(optionsHash, (id = ++_idCtr));
	}

	return id;
}

function optionsJsonReplacer(key: string, value: any) {
	return key === 'uniforms' ? undefined : typeof value === 'function' ? value.toString() : value;
}
