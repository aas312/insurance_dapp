import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Components
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import ContractFormValue from './ContractFormValue.js'
import PendingSpinner from './../components/PendingSpinner.js'
import Claim from './Claim.js'

/*
 * Create component.
 */

class PolicyManagerProcessClaims extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.keys = {}    

  }

  claimsList = () => {
    let list = []

    for(let i = this.props.claimCount; i > 0; i--) {
      list.push(<Claim key={i} claimId={i} policy={this.props.policy}/>)
    }

    return list
  }

  render() {

    if (this.props.claimCount == 0) {
      return null
    }

    return(
      <div className="pure-u-1-1">
        <h2>Process Claims</h2>
        <h2>Pay Claim</h2>
        <ContractFormValue contract={this.props.policy} method="payClaim" value={0} labels={["Id"]}/>
        <h2>Deny Claim</h2>
        <ContractFormValue contract={this.props.policy} method="denyClaim" value={0} labels={["Id"]}/>
        <PendingSpinner contract={this.props.policy} />
        {this.claimsList()}
      </div>
    )
  }
}

PolicyManagerProcessClaims.contextTypes = {
  drizzle: PropTypes.object
}

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    contracts: state.contracts
  }
}

export default drizzleConnect(PolicyManagerProcessClaims, mapStateToProps)