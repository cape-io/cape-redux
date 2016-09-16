import test from 'tape'
import { identity, noop } from 'lodash'

import {
  createObj, payloadIsErr, payloadFromErr, arg2True, msgObj, getPayload,
  hasError, getMeta, createAction,
} from '../src'

test('createObj', (t) => {
  t.deepEqual(createObj('foo', 'bar'), { foo: 'bar' })
  t.end()
})
test('payloadIsErr', (t) => {
  t.ok(payloadIsErr(new Error('err')), 'Error')
  t.ok(payloadIsErr({ error: true }), 'error prop')
  t.ok(payloadIsErr({ isBoom: true }), 'boom')
  t.false(payloadIsErr('string'))
  t.end()
})
test('payloadFromErr', (t) => {
  t.deepEqual(payloadFromErr(new Error('err')), { message: 'err' }, 'Error')
  t.deepEqual(payloadFromErr({ error: true, oth: false, b: identity }), { error: true }, 'obj')
  t.end()
})
test('arg2True', (t) => {
  t.true(arg2True(false, true))
  t.false(arg2True(true, false), 'bool')
  t.false(arg2True(false, 'meta'), 'str')
  t.false(arg2True(false, { meta: 'data' }), 'obj')
  t.end()
})
test('msgObj', (t) => {
  t.deepEqual(msgObj('fish'), { message: 'fish' })
  t.end()
})
test('getPayload', (t) => {
  t.deepEqual(getPayload('foo'), 'foo')
  t.deepEqual(getPayload(new Error('pizza')), { message: 'pizza' })
  t.deepEqual(getPayload('foo', true), { message: 'foo' })
  t.end()
})
test('hasError', (t) => {
  t.true(hasError(true, true), 'bool arg 2')
  t.true(hasError(new Error('something')), 'error')
  t.false(hasError(false, new Error('something')), 'error arg2')
  t.false(hasError(), 'empty')
  t.false(hasError('string'))
  t.false(hasError('string', { meta: 'data' }))
  t.end()
})
test('getMeta', (t) => {
  t.equal(getMeta('one', 'two'), 'two', '2nd arg')
  t.equal(getMeta('one', true, 'three'), 'three')
  t.end()
})
test('createAction', (t) => {
  const foo = createAction('foo')
  t.deepEqual(foo(), { type: 'foo' }, 'no args')
  t.deepEqual(foo('bar'), { type: 'foo', payload: 'bar' }, 'str arg')
  t.deepEqual(foo('bar', 'data'), { type: 'foo', payload: 'bar', meta: 'data' }, 'meta')
  const bar = createAction('bar', noop)
  t.deepEqual(bar('str'), { type: 'bar' }, 'noop')
  t.end()
})