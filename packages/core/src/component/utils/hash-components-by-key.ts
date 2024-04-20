import { Component } from '../component';
import { ComponentToKeyMap } from '../types';

export function hashComponentsByKey(
	components: (typeof Component)[],
	componentToKeyMap: ComponentToKeyMap
) {
	let hash = '';
	for (const component of components) {
		hash += componentToKeyMap.get(component) + '-';
	}
	hash = hash.slice(0, -1); // Remove the last dash
	return hash;
}
