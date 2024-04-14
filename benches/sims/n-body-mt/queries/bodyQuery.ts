import { defineQuery, defineEnterQueue } from '@sweet-ecs/core';
import { Position, Velocity, Mass } from '../components';

export const bodyQuery = defineQuery([Position, Velocity, Mass]);
export const enterBodyQuery = defineEnterQueue(bodyQuery);
