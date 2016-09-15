import test from 'tape'
import { isFunction } from 'lodash'

import { thunkAction } from '../src'
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
