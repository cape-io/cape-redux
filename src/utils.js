import { curry, flow, forEach, isArray, over, partial, rearg } from 'lodash'
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
export const fpMerge = curry(rearg(merge, [ 1, 0 ]), 2)
export const set = curry((key, state, value) => ({ ...state, [key]: value }))
export const setIn = curry(([ key, ...rest ], state, value) => {
  if (!rest.length) return set(key, state, value)
  return set(key, state, setIn(rest, state[key], value))
})
export const imSet = curry((key, state, value) => state.set(key, value))
// Like createSelector but it builds and dispatches an action creator.
export function thunkAction(...funcs) {
  const actionBuilder = funcs.pop()
  return (...actionArgs) => (dispatch, getState) => {
    const action = actionBuilder(...over(funcs)(getState(), ...actionArgs))
    if (isArray(action)) return forEach(action, dispatch)
    return dispatch(action)
  }
}
export function wPyld(actionReducer) {
  return (state, action) => actionReducer(state, action.payload)
}
