import {
  flow, forEach, isArray, isUndefined, noop, omitBy, over, partial,
} from 'lodash'
import { handleChanges } from 'cape-lodash'
import { bindActionCreators } from 'redux'
import { validateProps } from './createAction'

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

// Like createSelector but it builds and dispatches an action creator.
export function thunkAction(...funcs) {
  const actionBuilder = funcs.pop()
  return (...actionArgs) => (dispatch, getState) => {
    const action = actionBuilder(...over(funcs)(getState(), ...actionArgs))
    if (isArray(action)) return forEach(action, dispatch)
    return dispatch(action)
  }
}
// Uses thunkAction to create an action from selectors.
export function selectorAction(type, payloadSelector, metaSelector = noop) {
  validateProps(type, payloadSelector, metaSelector)
  return thunkAction(payloadSelector, metaSelector,
    (payload, meta) => omitBy({ type, payload, meta }, isUndefined)
  )
}
// Thunkify a selector that creates an action object after giving it state.
export function thunkSelectorAction(actionSelector) {
  return (dispatch, getState) => dispatch(actionSelector(getState()))
}
export function wPyld(actionReducer) {
  return (state, action) => actionReducer(state, action.payload)
}
