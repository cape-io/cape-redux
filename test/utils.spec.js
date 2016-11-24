import test from 'tape'
import { createStore } from 'redux'
import { constant, isFunction, nthArg, over, partial, partialRight, property } from 'lodash'

import {
  addListener, createReducer, merge, fpMerge, selectorAction, set, setIn,
  thunkAction, mapDispatchToProps, noopAction,
} from '../src'
import { collection, state, props } from './mock'

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
  thunkAction(selector, over(actionBuilder, actionBuilder))(props)(dispatch, getState)
})
test('selectorAction', (t) => {
  t.plan(2)
  const getPay = property('collection.a1.id')
  const dispatch = partialRight(t.deepEqual, { type: 'Angry', payload: 'a1' })
  selectorAction('Angry', getPay)()(dispatch, getState)
  const dispatch2 = partialRight(t.deepEqual, { type: 'Angry', payload: 'a1', meta: 'happy' })
  selectorAction('Angry', getPay, nthArg(1))('happy')(dispatch2, getState)
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
  const obj1 = { kai: 'foo', rev: 'minor', same: 'same' }
  const obj2 = { rev: 'bar' }
  const obj3 = { same: 'diff', sally: 'hair' }
  const merged = merge(obj1, obj2, obj3)
  t.false(obj1 === merged)
  t.false(obj2 === merged)
  t.false(obj3 === merged)
  t.deepEqual(merged, { kai: 'foo', rev: 'bar', same: 'diff', sally: 'hair' })
  t.end()
})
test('fpMerge', (t) => {
  const obj1 = { kai: 'foo', rev: 'minor', same: 'same' }
  const obj2 = { rev: 'bar' }
  t.equal(fpMerge(obj2, obj1).rev, 'bar')
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
test('setIn', (t) => {
  const updateTitle = setIn([ 'a1', 'title' ])
  const res1 = updateTitle(collection, 'apples')
  t.false(collection === res1)
  t.false(collection.a1 === res1.a1, 'a1')
  t.equal(res1.a1.title, 'apples', 'title')
  t.equal(collection.a1.creator, res1.a1.creator, 'a1 creator')
  t.equal(collection.a2, res1.a2, 'a2')
  t.equal(collection.a3, res1.a3, 'a3')
  const res2 = setIn([ 'a3', 'creator', 'anon', 'name' ], collection, 'drone')
  t.equal(collection.a1.creator.anon, res2.a1.creator.anon)
  t.equal(res2.a3.creator.anon.name, 'drone')
  const res3 = setIn([ 'foo', 'bar', 'song' ], {}, 'valueThingy')
  t.equal(res3.foo.bar.song, 'valueThingy', 'set in empty obj')
  t.end()
})
test('noopAction', (t) => {
  const act = noopAction('cape/TEST')
  t.ok(isFunction(act))
  const obj1 = act('foo')
  t.deepEqual(obj1, { type: 'cape/TEST' })
  t.equal(obj1, act('bar'))
  t.end()
})
