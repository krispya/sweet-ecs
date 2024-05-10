import { Entity as EntityCore } from '@sweet-ecs/core';
import { createContext } from 'react';

export const EntityContext = createContext<EntityCore>(null!);
