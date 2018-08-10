import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PolicyInterface from './../../../../build/contracts/Policy.json'

// Components
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
import ContractFormValue from './ContractFormValue.js'
import PendingSpinner from './../components/PendingSpinner.js'
import HolderClaims from './HolderClaims.js'
import PolicyManagerProcessClaims from './PolicyManagerProcessClaims.js'

/*
 * Create component.
 */

class Policy extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts

    this.keys = {}

    this.keys.getPolicyInfo = this.contracts[this.props.policy].methods.getPolicyInfo.cacheCall()
    this.keys.policyHolders = this.contracts[this.props.policy].methods.policyHolders.cacheCall(this.props.accounts[0])
    this.keys.getPolicyTime = this.contracts[this.props.policy].methods.getPolicyTime.cacheCall()
    this.keys.claimCount = this.contracts[this.props.policy].methods.claimCount.cacheCall()
  }

  render() {

    let policyInfo
    let policyManager
    let price
    let coveragePeriod
    let maxClaim
    let coverageTerms
    let isPolicyManager
    let policyInstance
    let isPolicyHolder
    let policyCurrentTime
    let holderClaimIds
    let claimCount
    let coverageTermsHash
    let name

    if((this.keys.getPolicyInfo in this.props.contracts[this.props.policy].getPolicyInfo)) {
      policyInfo = this.props.contracts[this.props.policy].getPolicyInfo[this.keys.getPolicyInfo].value
      policyManager = policyInfo._policyManager
      price = policyInfo._price
      coveragePeriod = policyInfo._coveragePeriod
      maxClaim = policyInfo._maxClaim
      coverageTerms = policyInfo._coverageTerms
      isPolicyManager = (policyManager === this.props.accounts[0]) ? true : false
      coverageTermsHash = policyInfo._coverageTermsHash
      name = policyInfo._name
    }

    if((this.keys.getPolicyTime in this.props.contracts[this.props.policy].getPolicyTime)) {
      policyCurrentTime = this.props.contracts[this.props.policy].getPolicyTime[this.keys.getPolicyTime].value
      policyCurrentTime = parseInt(policyCurrentTime, 10)
    }

    if((this.keys.claimCount in this.props.contracts[this.props.policy].claimCount)) {
      claimCount = this.props.contracts[this.props.policy].claimCount[this.keys.claimCount].value
      claimCount = parseInt(claimCount, 10)
    }

    // Make sure we have required data before rendering.
    if (typeof policyInfo === 'undefined' || typeof policyCurrentTime === 'undefined') {
      return(
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>⚙️</h1>
            <p>Fetching Data...</p>
          </div>
        </div>
      )
    }

    if((this.keys.policyHolders in this.props.contracts[this.props.policy].policyHolders)) {
      policyInstance = this.props.contracts[this.props.policy].policyHolders[this.keys.policyHolders].value
      isPolicyHolder = (parseInt(policyInstance.startDate, 10) > 0 && parseInt(policyInstance.endDate, 10) > policyCurrentTime) ? true : false
    }

    (async () => {
      this.policyBalance = await this.context.drizzle.web3.eth.getBalance(this.props.policy)
    })()

    return(
      <div className="pure-u-1-1">
        <h2>Policy: {name}</h2>
        <p>Policy Manager: {policyManager} </p>
        <p>Price: {price} </p>
        <p>Coverage Period: {coveragePeriod} </p>
        <p>Max Claim: {maxClaim} </p>
        <p>Coverage Terms: {coverageTerms} </p>
        <p>Policy Contract Balance: {this.policyBalance}</p>
        {coverageTermsHash &&
          <p>View terms and conditions: <a target="_blank" href={'https://ipfs.io/ipfs/' + coverageTermsHash}>Terms and Conditions</a></p>
        }

        {!isPolicyHolder && !isPolicyManager &&
          <div>
            <h2>Purchase Policy</h2>
            <p>{price} wei plus gas will be sent to cover the cost of the policy.</p>
            <ContractFormValue contract={this.props.policy} method="purchasePolicy" value={price}/>
            <br/>
            <PendingSpinner contract={this.props.policy} />
          </div>
        }

        {isPolicyHolder &&

          <div>
            <p>Congratulations for owning this policy!</p>
            <h2>Submit Claim</h2>
            <ContractFormValue contract={this.props.policy} method="createClaim" value={0} labels={["Claim Amount", "Claim Reason"]}/>
            <br/>
            <PendingSpinner contract={this.props.policy} />
          </div>
        }

        <HolderClaims policy={this.props.policy} claimCount={claimCount} />
        {isPolicyManager &&
          <PolicyManagerProcessClaims policy={this.props.policy} claimCount={claimCount} />
        }



      </div>
    )
  }
}

Policy.contextTypes = {
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

export default drizzleConnect(Policy, mapStateToProps)
