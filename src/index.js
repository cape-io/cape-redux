import { bindActionCreators } from 'redux'
import { isError, isFunction, identity, isObject, isString, isUndefined, pickBy } from 'lodash'

// Like createSelector but it builds and dispatches an action creator.
export function thunkAction(...funcs) {
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
export function createAction(type, payloadCreator) {
  const getPayload = isFunction(payloadCreator) ? payloadCreator : identity
  return function actionCreator(arg1, arg2, arg3) {
    const payload = getPayload(arg1)
    const hasError = arg2 === true
    const meta = isObject(arg2) ? arg2 : arg3
    const action = {
      type,
    }
    if (isError(payload)) {
      action.error = true
      action.payload = pickBy(payload, val => identity(val) && !isFunction(val))
    } else if (hasError) {
      action.error = true
      action.payload = isString(payload) ? { message: payload } : payload
    } else if (!isUndefined(payload)) {
      action.payload = payload
    }
    if (isObject(meta)) {
      action.meta = meta
    }
    return action
  }
}
export function createReducer(reducers, defaultState = {}) {
  return function reducer(state = defaultState, action) {
    if (action.error || !action.type || !isFunction(reducers[action.type])) return state
    if (!action.payload) return state
    return reducers[action.type](state, action.payload)
  }
}
