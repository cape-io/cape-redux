import { bindActionCreators } from 'redux'
import {
  constant, cond, curry, filter, flow, identical, invoke,
  isError, isFunction, identity, isString, isUndefined, negate,
  noop, nthArg, over, overEvery, overSome, partial, property, stubTrue,
} from 'lodash'
import defaults from 'lodash/fp/defaults'
import has from 'lodash/fp/has'
import omitBy from 'lodash/fp/omitBy'
import pick from 'lodash/fp/pick'
import zipObject from 'lodash/fp/zipObject'
import { handleChanges, hasMethodOf } from 'cape-lodash'

// Trigger a call to onChange() when result of selector changes.
export function addListener(selector, store, onChange) {
  return store.subscribe(handleChanges(
    flow(store.getState, selector), partial(onChange, store)
  ))
}

// @TODO Isn't there a better way to create an obj?
export const createObj = curry((key, val) => ({ [key]: val }))
export const payloadIsErr = overSome(isError, property('error'), property('isBoom'))
export const payloadFromErr = pick([ 'error', 'message', 'fileName', 'lineNumber', 'type' ])
export const arg2True = flow(nthArg(1), identical(true))
export const msgObj = createObj('message')
export const getPayload = cond([
  [ overEvery(arg2True, isString), msgObj ],
  [ payloadIsErr, payloadFromErr ],
  [ stubTrue, identity ],
])
export const hasError = cond([
  [ overSome(arg2True, payloadIsErr), stubTrue ], [ stubTrue, noop ],
])
export const getMeta = cond([ [ arg2True, nthArg(2) ], [ stubTrue, nthArg(1) ] ])
export function createAction(type, payloadCreator = getPayload, metaCreator = getMeta) {
  return flow(
    over(constant(type), payloadCreator, hasError, metaCreator),
    zipObject([ 'type', 'payload', 'error', 'meta' ]),
    omitBy(isUndefined)
  )
}
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
// getActions() is passed state. Result is passed to bindActionCreators.
export function mapDispatchToProps(getActions) {
  return (dispatch, props) => bindActionCreators(getActions(props), dispatch)
}
// Like createSelector but it builds and dispatches an action creator.
export function thunkAction(...funcs) {
  const action = funcs.pop()
  return (props, ...args) => (dispatch, getState) => {
    const params = funcs.map(dependency => dependency(getState(), props, ...args))
    dispatch(action(...params))
  }
}
