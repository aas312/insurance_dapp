import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Components
import Claim from './Claim.js'

/*
 * Create component.
 */

class HolderClaims extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

  }

  render() {

    let holderClaimIds = this.props.holderClaimIds

    // Wait for claim id list.
    if (typeof holderClaimIds === 'undefined') {

      return(
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>⚙️</h1>
            <p>Fetching Data...</p>
          </div>
        </div>
      )
    }

    let claimList = holderClaimIds.map((claimId) => <Claim key={claimId} claimId={claimId} policy={this.props.policy} isPolicyManager={this.props.isPolicyManager} />)

    if (holderClaimIds.length === 0) {
      return null
    }

    return(
      <div className="pure-u-1-1">
        <h2>Claims</h2>
        {claimList.reverse()}
      </div>
    )
  }
}

HolderClaims.contextTypes = {
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

export default drizzleConnect(HolderClaims, mapStateToProps)
