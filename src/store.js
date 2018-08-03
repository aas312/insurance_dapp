import { browserHistory } from 'react-router'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { routerMiddleware } from 'react-router-redux'
import reducer from './reducer'
import rootSaga from './rootSaga'
import createSagaMiddleware from 'redux-saga'
import { generateContractsInitialState } from 'drizzle'
import drizzleOptions from './drizzleOptions'

// Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const routingMiddleware = routerMiddleware(browserHistory)
const sagaMiddleware = createSagaMiddleware()

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (error) {
    console.error(error);
  }
};

const persistedState = loadState();

const initialState = Object.assign({contracts: generateContractsInitialState(drizzleOptions)}, persistedState);

const store = createStore(
  reducer,
  initialState,
  composeEnhancers(
    applyMiddleware(
      thunkMiddleware,
      routingMiddleware,
      sagaMiddleware
    )
  )
)

let currentValue = store.getState().accounts[0]
function accountChange() {
  let previousValue = currentValue
  currentValue = store.getState().accounts[0]

  if (typeof previousValue !== undefined && typeof currentValue !== undefined && previousValue !== currentValue) {
    //window.location.reload();
    //alert("Remember to reload the browser whenever changing accounts.")
    console.log(
      'Account changed from',
      previousValue,
      'to',
      currentValue
    )
  }
}
store.subscribe(accountChange)

store.subscribe(() => {
  saveState({
    user: store.getState().user,
  });
});

sagaMiddleware.run(rootSaga)

export default store
