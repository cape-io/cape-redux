import test from 'tape'
import { createStore } from 'redux'
import { isFunction, partial, property } from 'lodash'

import { addListener, createReducer, merge, set, thunkAction, mapDispatchToProps } from '../src'
import { state, props } from './mock'

test('thunkAction', (t) => {
  t.plan(6)
  function selector(arg1, arg2) {
    t.equal(arg1, state, 'state')
    t.equal(arg2, props, 'props')
    return 'foo'
  }
  function action(str) {
    t.equal(str, 'foo', 'selector result sent to action')
    return { type: str }
  }
  const createdAction = thunkAction(selector, action)
  t.ok(isFunction(createdAction), 'isFunction')
  const calledAction = createdAction(props)
  t.ok(isFunction(calledAction), 'isFunction')
  function getState() { return state }
  function dispatch(act) {
    t.equal(act.type, 'foo', 'action obj')
    t.end()
  }
  calledAction(dispatch, getState)
})

function makeAction(type) { return { type } }
test('mapDispatchToProps', (t) => {
  function getActions({ item, title }) {
    return {
      foo: partial(makeAction, item.id),
      bar: partial(makeAction, title),
    }
  }
  const expectedTypes = [ 'bar', 'strawberry' ]
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
const store = createStore(reducer)
test('addListener', (t) => {
  t.plan(2)
  function onChange({ getState }, currentValue) {
    t.ok(isFunction(getState))
    t.equal(currentValue, 'patch')
  }
  const selector = property('test')
  addListener(selector, store, onChange)
  store.dispatch({ type: 'UPDATE', payload: 'patch' })
  store.dispatch({ type: 'OTHER', payload: 'apple' })
})
test('merge', (t) => {
  const obj1 = { kai: 'foo', rev: 'minor' }
  const obj2 = { rev: 'bar' }
  const obj3 = merge(obj1, obj2)
  t.false(obj1 === obj3)
  t.false(obj2 === obj3)
  t.deepEqual(obj3, { kai: 'foo', rev: 'bar' })
  t.end()
})
test('set', (t) => {
  const foo = set('foo')
  const obj = { foo: 'cat' }
  const obj2 = foo(obj, 'dog')
  t.false(obj === obj2)
  t.equal(obj2.foo, 'dog')
  const obj3 = set('bar', obj2, 'ice')
  t.false(obj3 === obj2)
  t.deepEqual(obj3, { foo: 'dog', bar: 'ice' })
  t.end()
})
