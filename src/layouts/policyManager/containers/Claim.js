import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

/*
 * Create component.
 */

class Claim extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.keys = {}
    this.keys.claims = this.contracts[this.props.policy].methods.claims.cacheCall(this.props.claimId)
  }

  render() {

    let claim
    let statusOptions = ['Open', 'Paid', 'Denied']

    if((this.keys.claims in this.props.contracts[this.props.policy].claims)) {
      claim = this.props.contracts[this.props.policy].claims[this.keys.claims].value
    }

    // Wait for claim.
    if (typeof claim === 'undefined') {

      return(
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>⚙️</h1>
            <p>Fetching Data...</p>
          </div>
        </div>
      )
    }


    return(
      <div className="pure-u-1-1">
        <p>Id: {this.props.claimId}</p>
        <p>Status: {statusOptions[claim.status]}</p>
        <p>Amount: {claim.amount}</p>
        <p>Reason: {claim.reason}</p>
        {claim.policyHolder !== this.props.accounts[0] &&
          <p>Policy Holder: {claim.policyHolder}</p>
        }

      </div>
    )
  }
}

Claim.contextTypes = {
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

export default drizzleConnect(Claim, mapStateToProps)
