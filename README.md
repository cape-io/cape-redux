# cape-redux v1.1.2

- `addListener(selector, store, onChange)` - Trigger a call to onChange() when result of selector changes.
- `createAction(type, payloadCreator)` - Makes an action creator.
- `createReducer(reducers, defaultState = {}, opts)` - Send reducers obj where key is type and value is func with (state, payload) sig. Default opts `{ actionPick: property('payload'), skipErrors: true, skipNoPayload: false }`. This will skip over actions with errors but allow actions with no payload to be sent to the action type reducers. Can pass `isInvalidAction()` in opts to add some custom checking.
- `mapDispatchToProps(getActions)` - getActions func is passed state. Result is passed to bindActionCreators.
- `thunkAction` - Like createSelector but it builds and dispatches an action creator.
