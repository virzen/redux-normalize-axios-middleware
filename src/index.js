import { normalize } from 'normalizr';
import { get, has, keys, map, mapValues } from 'lodash';

const shouldNormalizeAction = action => (
  has(action, 'payload.data') &&
  has(action, 'meta.previousAction.normalize.schema')
);

const appendAllIds = data => mapValues(data.entities, entity => (
  { items: entity, allIds: map(entity, item => item.id) }
));

export default store => next => action => {
  if(!shouldNormalizeAction(action)) return next(action);

  const data = action.payload.data;
  const schema = action.meta.previousAction.normalize.schema;
  const path = get(action.meta.previousAction.normalize, 'path');

  const requestData = path ? get(data, path) : data;
  const normalizedData = normalize(requestData, schema);
  const normalizedDataWithAllIds = appendAllIds(normalizedData);
  return next({
    ...action,
    payload: {
      ...action.payload,
      data: normalizedDataWithAllIds,
    }
  });
};
