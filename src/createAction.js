import {
  constant, cond, flow, identical, identity, isError, isString, isUndefined,
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
export const getPayload = cond([
  [ overEvery(arg2True, isString), msgObj ],
  [ payloadIsErr, payloadFromErr ],
  [ stubTrue, identity ],
])
export const hasError = cond([
  [ overSome(arg2True, payloadIsErr), stubTrue ], [ stubTrue, noop ],
])
export const getMeta = cond([ [ arg2True, nthArg(2) ], [ stubTrue, nthArg(1) ] ])
export function createAction(type, payloadCreator = getPayload, metaCreator = getMeta) {
  return flow(
    over(constant(type), payloadCreator, hasError, metaCreator),
    zipObject([ 'type', 'payload', 'error', 'meta' ]),
    omitBy(isUndefined)
  )
}
