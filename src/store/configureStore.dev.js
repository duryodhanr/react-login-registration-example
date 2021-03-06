// This file merely configures the store for hot reloading.
// This boilerplate file is likely to be the same for each project that uses Redux.
// With Redux, the actual stores are in /reducers.

import {createStore, applyMiddleware, compose} from 'redux';
import createLogger from 'redux-logger';
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';
import createSagaMiddleware, {END} from 'redux-saga';
import {persistState} from 'redux-devtools';
import rootReducer from '../reducers';
import DevTools from '../containers/DevTools';
import sagas from '../sagas';
import {routerMiddleware} from 'react-router-redux';
import {browserHistory} from 'react-router';

const sagaMiddleware = createSagaMiddleware();
const loggerMiddlware = createLogger();
const routerMw = routerMiddleware(browserHistory);


const enhancer = compose(
  // Middleware you want to use in development:
  applyMiddleware(

    routerMw,

    // Redux middleware that spits an error on you when you try to mutate your state either inside a dispatch or between dispatches.
    reduxImmutableStateInvariant(),

    sagaMiddleware,
    loggerMiddlware
  ),
  // Required! Enable Redux DevTools with the monitors you chose
  DevTools.instrument(),
  // Optional. Lets you write ?debug_session=<key> in address bar to persist debug sessions
  persistState(getDebugSessionKey())
);

function getDebugSessionKey() {
  // You can write custom logic here!
  // By default we try to read the key from ?debug_session=<key> in the address bar
  const matches = window.location.href.match(/[?&]debug_session=([^&#]+)\b/);
  return (matches && matches.length > 0)? matches[1] : null;
}

export default function configureStore(initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    enhancer
  );

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default; // eslint-disable-line global-require
      store.replaceReducer(nextReducer);
    });
  }

  sagaMiddleware.run(sagas);
  store.close = () => store.dispatch(END);

  return store;
}
