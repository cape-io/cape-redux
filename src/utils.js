import { curry, flow, isFunction, partial } from 'lodash'
import { handleChanges } from 'cape-lodash'
import { bindActionCreators } from 'redux'

// Trigger a call to onChange() when result of selector changes.
export function addListener(selector, store, onChange) {
  return store.subscribe(handleChanges(
    flow(store.getState, selector), partial(onChange, store)
  ))
}

// getActions() is passed props. Result is passed to bindActionCreators.
export function mapDispatchToProps(getActions) {
  return (dispatch, props) => bindActionCreators(getActions(props), dispatch)
}
export function merge(object, ...sources) { return Object.assign({}, object, ...sources) }
export const fpMerge = curry(merge, 2)
export const set = curry((key, state, value) => ({ ...state, [key]: value }))
export const setIn = curry(([ key, ...rest ], state, value) => {
  if (!rest.length) return set(key, state, value)
  return set(key, state, setIn(rest, state[key], value))
})
export const imSet = curry((key, state, value) => state.set(key, value))
// Like createSelector but it builds and dispatches an action creator.
export function thunkAction(...funcs) {
  const action = funcs.pop()
  return (props, ...args) => (dispatch, getState) => {
    const params = funcs.map(dependency => dependency(getState(), props, ...args))
    dispatch(action(...params))
  }
}
export function thunkSelect(selector, props) {
  if (!isFunction(selector)) throw new Error('selector must be a function')
  return (dispatch, getState) => selector(getState(), props)
}
