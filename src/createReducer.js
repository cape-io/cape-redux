import {
  defaults, filter, get, has, isFunction, negate, overSome,
} from 'lodash/fp'

export const missingType = negate(has('type'))
export const missingPayload = negate(has('payload'))
export const getError = get('error')
export const noReducerOfType = obj => ({ type }) => !isFunction(obj[type])

export function invalidAction(reducers, { isInvalidAction, skipErrors, skipNoPayload }) {
  return overSome(filter(isFunction, [
    missingType,
    skipErrors && getError,
    skipNoPayload && missingPayload,
    noReducerOfType(reducers),
    isInvalidAction,
  ]))
}
export const reducerDefaults = defaults({
  actionPick: get('payload'),
  skipErrors: true,
  skipNoPayload: false,
})

// Send reducers obj where key is type and value is func with (state, payload) sig.
export function createReducer(reducers, defaultState = {}, options = {}) {
  const opts = reducerDefaults(options)
  const skipAction = invalidAction(reducers, opts)
  return function reducer(state = defaultState, action) {
    if (skipAction(action)) return state
    return reducers[action.type](state, opts.actionPick(action))
  }
}
