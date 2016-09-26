import {
  filter, flow, invoke, isFunction, negate, overSome, property,
} from 'lodash'
import defaults from 'lodash/fp/defaults'
import has from 'lodash/fp/has'
import { hasMethodOf } from 'cape-lodash'

export const missingType = negate(has('type'))
export const missingPayload = negate(has('payload'))
export const getError = property('error')
export function noReducerOfType(reducers) {
  return flow(property('type'), negate(hasMethodOf(reducers)))
}
export function invalidAction(reducers, { isInvalidAction, skipErrors, skipNoPayload }) {
  return overSome(filter([
    missingType,
    skipErrors && getError,
    skipNoPayload && missingPayload,
    noReducerOfType(reducers),
    isInvalidAction,
  ], isFunction))
}
export const reducerDefaults = defaults({
  actionPick: property('payload'),
  skipErrors: true,
  skipNoPayload: false,
})
// Send reducers obj where key is type and value is func with (state, payload) sig.
export function createReducer(reducers, defaultState = {}, options = {}) {
  const opts = reducerDefaults(options)
  const skipAction = invalidAction(reducers, opts)
  return function reducer(state = defaultState, action) {
    if (skipAction(action)) return state
    return invoke(reducers, action.type, state, opts.actionPick(action))
  }
}
