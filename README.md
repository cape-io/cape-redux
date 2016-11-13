# cape-redux v2.1.1

- `addListener(selector, store, onChange)` - Trigger a call to onChange() when result of selector changes.
- `createAction(type, payloadCreator)` - Makes an action creator.
- `createReducer(reducers, defaultState = {}, opts)` - Send reducers obj where key is type and value is func with (state, payload) sig. Default opts `{ actionPick: property('payload'), makeImmutable: false, skipErrors: true, skipNoPayload: false }`. This will skip over actions with errors but allow actions with no payload to be sent to the action type reducers. Can pass `isInvalidAction()` in opts to add some custom checking.
- `mapDispatchToProps(getActions)` - getActions func is passed state. Result is passed to bindActionCreators.
- `merge(object, [sources])` - Creates a new object with the result of sources spread over object.
- `fpMerge(source, object)` - Curried. Object is 2nd arg.
- `imSet(key, obj, value)` - curried. Calls `set` on object with `key` and `value` arguments.
- `set(key, obj, value)` - curried. return new object with key set as value on obj. No array support.
- `setIn(arrayPath, obj, value)` - curried. Returns new objects created along path until value is set. Uses `set` internally.
- `thunkAction` - Like createSelector but it builds and dispatches an action creator. To dispatch many actions return array from builder function.
- `selectorAction(type, payloadSelector, metaSelector = noop)` Uses thunkAction to create an action from selectors.
