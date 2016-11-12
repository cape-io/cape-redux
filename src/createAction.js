import {
  constant, cond, flow, identical, identity, isError, isFunction, isString, isUndefined,
  noop, nthArg, over, overEvery, overSome, property, stubTrue,
} from 'lodash'
import omitBy from 'lodash/fp/omitBy'
import pick from 'lodash/fp/pick'
import zipObject from 'lodash/fp/zipObject'
import { createObj } from 'cape-lodash'

export const payloadIsErr = overSome(isError, property('error'), property('isBoom'))
export const payloadFromErr = pick([ 'error', 'message', 'fileName', 'lineNumber', 'type' ])
export const arg2True = flow(nthArg(1), identical(true))
export const msgObj = createObj('message')
export function createGetPayload(lastFunc = identity) {
  return cond([
    [ overEvery(arg2True, isString), msgObj ],
    [ payloadIsErr, payloadFromErr ],
    [ stubTrue, lastFunc ],
  ])
}
export const getPayload = createGetPayload()
export const hasError = cond([
  [ overSome(arg2True, payloadIsErr), stubTrue ], [ stubTrue, noop ],
])
export const getMeta = cond([ [ arg2True, nthArg(2) ], [ stubTrue, nthArg(1) ] ])
export function validateProps(type, payloadCreator, metaCreator) {
  if (!isString(type)) throw new Error('type must be a string')
  if (!isFunction(payloadCreator)) throw new Error('payloadCreator must be a func.')
  if (!isFunction(metaCreator)) throw new Error('metaCreator must be a func.')
}
// @TODO Need some validation of payload.
export function createAction(type, payloadCreator = getPayload, metaCreator = getMeta) {
  validateProps(type, payloadCreator, metaCreator)
  return flow(
    over(constant(type), payloadCreator, hasError, metaCreator),
    zipObject([ 'type', 'payload', 'error', 'meta' ]),
    omitBy(isUndefined)
  )
}
