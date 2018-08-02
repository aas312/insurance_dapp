//import { connectedReduxRedirect } from 'redux-auth-wrapper/history3/redirect'
//import { routerActions } from 'react-router-redux'
import connectedAuthWrapper from 'redux-auth-wrapper/connectedAuthWrapper'


export const UserIsAuthenticated = connectedAuthWrapper({
  //redirectPath: '/',
  authenticatedSelector: state => state.user.data !== null,
  wrapperDisplayName: 'UserIsAuthenticated',
  // Returns true if the user auth state is loading
  //authenticatingSelector: state => state.user.isLoading,
  //redirectAction: routerActions.replace,
  // Render this component when the authenticatingSelector returns true
  //AuthenticatingComponent: LoadingSpinner,
})

export const UserIsNotAuthenticated = connectedAuthWrapper({
  // This sends the user either to the query param route if we have one, or to the landing page if none is specified and the user is already logged in
  //redirectPath: '/',
  // Determine if the user is authenticated or not
  authenticatedSelector: state => state.user.data == null,
  //redirectAction: routerActions.replace,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsNotAuthenticated'
})

/*
import { UserAuthWrapper } from 'redux-auth-wrapper'
import { routerActions } from 'react-router-redux'

// Layout Component Wrappers

export const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.user.data,
  redirectAction: routerActions.replace,
  failureRedirectPath: '/', // '/login' by default.
  wrapperDisplayName: 'UserIsAuthenticated'
})

export const UserIsNotAuthenticated = UserAuthWrapper({
  authSelector: state => state.user,
  redirectAction: routerActions.replace,
  failureRedirectPath: (state, ownProps) => ownProps.location.query.redirect || '/',
  wrapperDisplayName: 'UserIsNotAuthenticated',
  predicate: user => user.data === null,
  allowRedirectBack: false
})

// UI Component Wrappers

export const VisibleOnlyAuth = UserAuthWrapper({
  authSelector: state => state.user,
  wrapperDisplayName: 'VisibleOnlyAuth',
  predicate: user => user.data,
  FailureComponent: null
})

export const HiddenOnlyAuth = UserAuthWrapper({
  authSelector: state => state.user,
  wrapperDisplayName: 'HiddenOnlyAuth',
  predicate: user => user.data === null,
  FailureComponent: null
})
*/
