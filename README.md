# cape-redux v1.5.0

- `addListener(selector, store, onChange)` - Trigger a call to onChange() when result of selector changes.
- `createAction(type, payloadCreator)` - Makes an action creator.
- `createReducer(reducers, defaultState = {}, opts)` - Send reducers obj where key is type and value is func with (state, payload) sig. Default opts `{ actionPick: property('payload'), makeImmutable: false, skipErrors: true, skipNoPayload: false }`. This will skip over actions with errors but allow actions with no payload to be sent to the action type reducers. Can pass `isInvalidAction()` in opts to add some custom checking.
- `mapDispatchToProps(getActions)` - getActions func is passed state. Result is passed to bindActionCreators.
- `merge(object, [sources])` - Creates a new object with the result of sources spread over object.
- `fpMerge(source, object)` - Curried. Object is 2nd arg.
- `imSet(key, obj, value)` - curried. Calls `set` on object with `key` and `value` arguments.
- `set(key, obj, value)` - curried. return new object with key set as value on obj. No array support.
- `setIn(arrayPath, obj, value)` - curried. Returns new objects created along path until value is set. Uses `set` internally.
- `thunkAction` - Like createSelector but it builds and dispatches an action creator.
- `thunkSelect(selector, props)` - Send getState() and props to selector from thunk arg signature.
