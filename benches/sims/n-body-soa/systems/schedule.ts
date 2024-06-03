import { Schedule } from 'directed';
import { setInitial } from './setInitial';
import { updateGravity } from './updateGravity';
import { moveBodies } from './moveBodies';
import { updateColor } from './updateColor';
import { updateTime } from './updateTime';
import { World } from '@sweet-ecs/core';

export const schedule = new Schedule<{ world: World }>();

schedule.createTag('update');

schedule.add(updateTime, { tag: 'update' });
schedule.add(setInitial, { after: updateTime, tag: 'update' });
schedule.add(updateGravity, { after: setInitial, tag: 'update' });
schedule.add(moveBodies, { after: updateGravity, tag: 'update' });
schedule.add(updateColor, { after: moveBodies, tag: 'update' });
