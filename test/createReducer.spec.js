import test from 'tape'
import { noop } from 'lodash'

import {
  missingType, missingPayload, getError, invalidAction, noReducerOfType,
  createReducer, reducerDefaults,
} from '../src'

test('missingType', (t) => {
  t.true(missingType({ foo: 'bar' }))
  t.false(missingType({ type: 'foo' }))
  t.end()
})
test('missingPayload', (t) => {
  t.true(missingPayload({ foo: 'bar' }))
  t.false(missingPayload({ payload: null }))
  t.end()
})
test('getError', (t) => {
  t.equal(getError({ error: 'bar' }), 'bar')
  t.true(getError({ error: 1 }))
  t.false(getError({ payload: null }))
  t.true(getError({ type: 'create', error: true, payload: 'message' }))
  t.end()
})
const reducers = {
  create: noop,
}
test('noReducerOfType', (t) => {
  const tester = noReducerOfType(reducers)
  t.true(tester({ type: 'something', payload: 'full' }))
  t.false(tester({ type: 'create' }))
  t.end()
})
test('invalidAction', (t) => {
  const skipAction = invalidAction(reducers, reducerDefaults({}))
  t.true(skipAction({ foo: true, payload: 'string' }), 'no type')
  t.false(skipAction({ type: 'create', payload: 'string' }), 'has type')
  t.true(skipAction({ type: 'create', error: true, payload: 'message' }), 'error')
  t.true(skipAction({ type: 'create', error: 1, payload: 'message' }), 'error num')
  t.true(skipAction({ type: 'update', error: true, payload: 'message' }), 'method missing')
  t.false(skipAction({ type: 'create' }), 'type and no pay ok')
  const skipAct2 = invalidAction(
    reducers, reducerDefaults({ skipErrors: false, skipNoPayload: true })
  )
  t.true(skipAct2({ foo: true, payload: 'string' }), 'no type')
  t.false(skipAct2({ type: 'create', error: true, payload: 'message' }), 'error')
  t.true(skipAct2({ type: 'update', error: true, payload: 'message' }), 'method missing')
  t.true(skipAct2({ type: 'create' }), 'no pay skip')
  t.end()
})
test('createReducer', (t) => {
  t.plan(4)
  const reducer = createReducer({
    thing1: (state, payload) => {
      t.equal(payload, 'foo')
      return { ...state, a: payload }
    },
    thing2: (state, payload) => {
      t.equal(payload, 'bar')
      return { ...state, b: payload }
    },
  })
  const st1 = reducer(undefined, { type: 'thing1', payload: 'foo' })
  t.deepEqual(st1, { a: 'foo' })
  const st2 = reducer(st1, { type: 'thing2', payload: 'bar' })
  t.deepEqual(st2, { a: 'foo', b: 'bar' })
  t.end()
})
