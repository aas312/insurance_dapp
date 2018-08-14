import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import PolicyInterface from './../build/contracts/Policy.json'

import LoginButtonContainer from './user/ui/loginbutton/LoginButtonContainer'
import LogoutButtonContainer from './user/ui/logoutbutton/LogoutButtonContainer'
import PolicyManager from './layouts/policyManager/containers/PolicyManager'

// Styles
import './css/pure-min.css'
import './App.css'

class App extends Component {

  constructor(props, context) {
    super(props)

    this.keys = {}
    this.contracts = context.drizzle.contracts
  }

  componentWillMount() {

  (async () => {
    let policies = await this.contracts.PolicyManager.methods.getAllPolicies().call()
    for (let policy of policies) {
        var contractConfig = {
        contractName: policy,
        web3Contract: new this.context.drizzle.web3.eth.Contract(PolicyInterface.abi, policy)
      }

      this.context.drizzle.addContract(contractConfig)
    }
  })()
}

  render() {

    let userButton
    let isLoggedIn = (this.props.user.data == null ? false : true)

    if (!isLoggedIn) {
      userButton = <LoginButtonContainer />
    } else {
      userButton = <LogoutButtonContainer />
    }

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <ul className="pure-menu-list navbar-right">
            <span>
              {userButton}
            </span>
          </ul>
        </nav>

        {isLoggedIn && <PolicyManager/>}
      </div>
    );
  }
}

App.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {

  return {
    user: state.user,
    contracts: state.contracts
  }
}

export default drizzleConnect(App, mapStateToProps);
