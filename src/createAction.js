import {
  constant, cond, defaultTo, eq, flow, get, identity,
  isError, isFunction, isString, isUndefined, noop, nthArg,
  over, overEvery, overSome, stubTrue,
} from 'lodash/fp'

import omitBy from 'lodash/fp/omitBy'
import pick from 'lodash/fp/pick'
import zipObject from 'lodash/fp/zipObject'

export const payloadIsErr = flow(
  defaultTo(null),
  overSome([isError, get('error'), get('isBoom')]),
)
export const payloadFromErr = pick(['error', 'message', 'fileName', 'lineNumber', 'type'])
export const arg2True = flow(nthArg(1), eq(true))
export const msgObj = message => ({ message })
export function createGetPayload(lastFunc = identity) {
  return cond([
    [overEvery([arg2True, isString]), msgObj],
    [payloadIsErr, payloadFromErr],
    [stubTrue, lastFunc],
  ])
}
export const getPayload = createGetPayload()
export const hasError = cond([
  [overSome([arg2True, payloadIsErr]), stubTrue],
  [stubTrue, noop],
])

export const getMeta = (arg1, arg2, arg3) => (arg2 === true ? arg3 : arg2)

export function validateProps(type, payloadCreator, metaCreator) {
  if (!isString(type)) throw new Error('type must be a string')
  if (!isFunction(payloadCreator)) throw new Error('payloadCreator must be a func.')
  if (!isFunction(metaCreator)) throw new Error('metaCreator must be a func.')
}
// @TODO Need some validation of payload.
export function createAction(type, payloadCreator = getPayload, metaCreator = getMeta) {
  validateProps(type, payloadCreator, metaCreator)
  return flow(
    over([constant(type), payloadCreator, hasError, metaCreator]),
    zipObject(['type', 'payload', 'error', 'meta']),
    omitBy(isUndefined),
  )
}
export function createSimpleAction(type, payloadCreator = identity, metaCreator = noop) {
  validateProps(type, payloadCreator, metaCreator)
  return flow(
    over([constant(type), payloadCreator, metaCreator]),
    zipObject(['type', 'payload', 'meta']),
    omitBy(isUndefined),
  )
}
export const noopAction = flow(type => ({ type }), constant)
