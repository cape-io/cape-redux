# cape-redux v1.4.2

- `addListener(selector, store, onChange)` - Trigger a call to onChange() when result of selector changes.
- `createAction(type, payloadCreator)` - Makes an action creator.
- `createReducer(reducers, defaultState = {}, opts)` - Send reducers obj where key is type and value is func with (state, payload) sig. Default opts `{ actionPick: property('payload'), makeImmutable: false, skipErrors: true, skipNoPayload: false }`. This will skip over actions with errors but allow actions with no payload to be sent to the action type reducers. Can pass `isInvalidAction()` in opts to add some custom checking.
- `mapDispatchToProps(getActions)` - getActions func is passed state. Result is passed to bindActionCreators.
- `merge(object, [sources])` - curried. Creates a new object with the result of sources spread over object.
- `imSet(key, obj, value)` - curried. Calls `set` on object with `key` and `value` arguments.
- `set(key, obj, value)` - curried. return new object with key set as value on obj.
- `thunkAction` - Like createSelector but it builds and dispatches an action creator.
