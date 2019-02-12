import test from 'tape'
import { createStore } from 'redux'
import {
  constant, get, isFunction, nthArg, over, partial, partialRight,
} from 'lodash/fp'

import {
  addListener, createReducer, selectorAction,
  thunkAction, mapDispatchToProps,
} from '../src'
import { state, props } from './mock'

const getState = constant(state)

test('thunkAction', (t) => {
  t.plan(12)
  function selector(arg1, arg2) {
    t.equal(arg1, state, 'state')
    t.equal(arg2, props, 'props')
    return 'foo'
  }
  function actionBuilder(str) {
    t.equal(str, 'foo', 'selector result sent to action')
    return { type: str }
  }
  const createdActionBuilder = thunkAction(selector, actionBuilder)
  t.ok(isFunction(createdActionBuilder), 'isFunction')
  const calledAction = createdActionBuilder(props)
  t.ok(isFunction(calledAction), 'isFunction')
  function dispatch(act) {
    t.equal(act.type, 'foo', 'action obj')
  }
  calledAction(dispatch, getState)
  thunkAction(selector, over([actionBuilder, actionBuilder]))(props)(dispatch, getState)
})

test('selectorAction', (t) => {
  t.plan(2)
  const getPay = get('collection.a1.id')
  const dispatch = partialRight(t.deepEqual, [{ type: 'Angry', payload: 'a1' }])
  selectorAction('Angry', getPay)()(dispatch, getState)

  const dispatch2 = partialRight(t.deepEqual, [{ type: 'Angry', payload: 'a1', meta: 'happy' }])
  selectorAction('Angry', getPay, nthArg(1))('happy')(dispatch2, getState)
})

function makeAction(type) { return { type } }
test('mapDispatchToProps', (t) => {
  function getActions({ item, title }) {
    return {
      foo: partial(makeAction, [item.id]),
      bar: partial(makeAction, [title]),
    }
  }
  const expectedTypes = ['bar', 'strawberry']
  function dispatch({ type }) {
    t.equal(type, expectedTypes.shift())
  }
  const { foo, bar } = mapDispatchToProps(getActions)(dispatch, props)
  t.ok(isFunction(foo))
  foo()
  t.ok(isFunction(bar))
  bar()
  t.end()
})

const reducer = createReducer({
  UPDATE: (preState, payload) => ({ ...preState, test: payload }),
  OTHER: (preState, payload) => ({ ...preState, other: payload }),
})

test('addListener', (t) => {
  const store = createStore(reducer)
  t.plan(2)
  function onChange(st, currentValue) {
    t.ok(isFunction(st.getState))
    t.equal(currentValue, 'patch')
  }
  const selector = get('test')
  addListener(selector, store, onChange)
  store.dispatch({ type: 'UPDATE', payload: 'patch' })
  store.dispatch({ type: 'OTHER', payload: 'apple' })
})
