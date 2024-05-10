import { use } from 'react';
import { EntityContext } from './entity-context';

export function useEntity() {
	return use(EntityContext);
}
