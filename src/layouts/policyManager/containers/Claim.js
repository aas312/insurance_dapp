import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Components
import PendingSpinner from './../components/PendingSpinner.js'

/*
 * Create component.
 */

class Claim extends Component {
  constructor(props, context) {
    super(props)

    this.handleApprove = this.handleApprove.bind(this);
    this.handleDeny = this.handleDeny.bind(this);
    this.handleCollect = this.handleCollect.bind(this);

    this.contracts = context.drizzle.contracts

    this.keys = {}

    var initialState = {}
    initialState['showSpinner'] = false
    this.state = initialState;

  }

  handleApprove() {
    //this.contracts[this.props.policy].methods.approveClaim.cacheSend(this.props.claimId, {from: this.props.accounts[0]});
    (async () => {
      let receipt = await this.contracts[this.props.policy].methods.approveClaim(this.props.claimId).send({from: this.props.accounts[0]});
      await this.updateClaim()
    })()
  }

  handleDeny() {
    (async () => {
      let receipt = await this.contracts[this.props.policy].methods.denyClaim(this.props.claimId).send({from: this.props.accounts[0]})
      await this.updateClaim()
    })()
  }

  handleCollect() {
    (async () => {
      let receipt = await this.contracts[this.props.policy].methods.collectClaim(this.props.claimId).send({from: this.props.accounts[0]})
      await this.updateClaim()
    })()
  }

  componentWillMount() {
    (async () => {
      await this.updateClaim()
    })()
  }

  async updateClaim() {

    let gas = 50000 + Math.floor(Math.random() * 1000) + 1
    let claim = await this.contracts[this.props.policy].methods.claims(this.props.claimId).call({gas})
    this.setState({claim})
  }



  render() {

    let claim
    let statusOptions = ['Open', 'Approved', 'Denied', 'Collected']

    claim = this.state.claim

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
        {claim.status !== "2" && claim.status !== "3" &&
          <form className="pure-form pure-form-stacked">
            {this.props.isPolicyManager && claim.status === "0" &&
              <div>
                <button key="approve" className="pure-button" type="button" onClick={this.handleApprove}>Approve</button>
                <button style={{marginLeft: '20px'}} key="deny" className="pure-button" type="button" onClick={this.handleDeny}>Deny</button>
              </div>
            }
            {!this.props.isPolicyManager && claim.status === "1" && claim.policyHolder === this.props.accounts[0] &&
              <button key="collect" className="pure-button" type="button" onClick={this.handleCollect}>Collect</button>
            }
            <PendingSpinner contract={this.props.policy} />
          </form>
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
