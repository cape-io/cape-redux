# cape-redux v1.0.0

- `addListener(selector, onChange, store)` - Trigger a call to onChange() when result of selector changes.
- `createAction(type, payloadCreator)` - Makes an action creator.
- `createReducer(reducers, defaultState = {})` - Send reducers obj where key is type and value is func with (state, payload) sig.
- `mapDispatchToProps(getActions)` - getActions func is passed state. Result is passed to bindActionCreators.
- `thunkAction` - Like createSelector but it builds and dispatches an action creator.
