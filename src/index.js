import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { DrizzleProvider } from 'drizzle-react'
import { Provider } from 'react-redux'

// Layouts
import App from './App'
import PolicyManager from './layouts/policyManager/containers/PolicyManager'
import { LoadingContainer } from 'drizzle-react-components'

import store from './store'
import drizzleOptions from './drizzleOptions'

// Initialize react-router-redux.
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render((
    <DrizzleProvider options={drizzleOptions} store={store} >
      <LoadingContainer>
       <App/>
      </LoadingContainer>
    </DrizzleProvider>
  ),
  document.getElementById('root')
);
