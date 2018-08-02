import React, { Component } from 'react'
import { UserIsAuthenticated, UserIsNotAuthenticated } from './util/wrappers.js'

import { Link } from 'react-router'

import LoginButtonContainer from './user/ui/loginbutton/LoginButtonContainer'
import LogoutButtonContainer from './user/ui/logoutbutton/LogoutButtonContainer'

// Styles
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

    const OnlyAuthLinks = UserIsAuthenticated(() =>
      <span>
        <LogoutButtonContainer />
      </span>
    )

    const OnlyGuestLinks = UserIsNotAuthenticated(() =>
      <span>
        <LoginButtonContainer />
      </span>
    )


class App extends Component {
  render() {


    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <ul className="pure-menu-list navbar-right">
            <OnlyGuestLinks />
            <OnlyAuthLinks />
          </ul>
        </nav>

        {this.props.children}
      </div>
    );
  }
}

export default App
