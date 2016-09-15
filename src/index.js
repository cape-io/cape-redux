import {
  cond, defaultTo, flow, get, identical,
  isEmpty, isObject, negate, over, property, spread, stubTrue,
} from 'lodash'
import fpDefaultTo from 'lodash/fp/defaultTo'
import fpPartialRight from 'lodash/fp/partialRight'
// Returns true if sent a value that is exactly false.
export const isFalse = identical(false)
// Find the first truthy argument value.
export const firstValArg = flow(Array, find)

// Given two paths, select the first one that is defined.
export function getDefault(path1, path2) {
  return flow(
    over([ property(path1), property(path2) ]),
    spread(defaultTo)
  )
}
// Returns the collection property at key as determined by idSelector.
export function getSelect(collectionSelector, idSelector) {
  return flow(over([ collectionSelector, idSelector ]), spread(get))
}
// Send arg to selector then get property at path. Apply defaultValue.
export function select(selector, path, defaultValue = null) {
  return flow(selector, property(path), fpDefaultTo(defaultValue))
}
// See createSelector(). This has no memoization.
export function simpleSelector(...funcs) {
  const last = funcs.pop()
  return flow(over(funcs), spread(last))
}
// Turn empty objs and arrays to false. Turn other vals into a boolean.
export const toBool = cond([ [ isObject, negate(isEmpty) ], [ stubTrue, Boolean ] ])
// Select something and turn it into boolean.
export const boolSelector = fpPartialRight(fpPartialRight, toBool)

// Like createSelector but it builds and dispatches an action creator.
export function thunkActionSelector(...funcs) {
  const action = funcs.pop()
  return (props, ...args) => (dispatch, getState) => {
    const params = funcs.map(dependency => dependency(getState(), props, ...args))
    dispatch(action(...params))
  }
}
export function mapDispatchToProps(getActions) {
  return (dispatch, props) => bindActionCreators(getActions(props), dispatch)
}

// Trigger a call to onChange() when result of selector changes.
export function addListener(selector, onChange, store) {
  const { getState, subscribe } = store
  let currentValue = selector(getState())
  function handleChange() {
    const previousValue = currentValue
    currentValue = selector(getState())
    if (previousValue !== currentValue) {
      onChange(store, currentValue)
    }
  }
  return subscribe(handleChange)
}
