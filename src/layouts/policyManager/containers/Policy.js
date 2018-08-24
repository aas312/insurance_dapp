import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Components
import HolderClaims from './HolderClaims.js'
import PolicyManagerProcessClaims from './PolicyManagerProcessClaims.js'

/*
 * Create component.
 */

class Policy extends Component {
  constructor(props, context) {
    super(props)

    this.handleClaimSubmit = this.handleClaimSubmit.bind(this);
    this.handlePolicyPurchase = this.handlePolicyPurchase.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.contracts = context.drizzle.contracts

    let initialState = {_amount: '', _reason: ''}
    initialState['showSpinner'] = false
    initialState['showSpinnerPurchase'] = false
    this.state = initialState;

  }

  componentWillMount() {
    (async () => {
      await this.updateClaims()
      await this.updateIsPolicyHolder()
    })()
  }

  async updateClaims() {
    let gas = 50000 + Math.floor(Math.random() * 1000) + 1
    let claimCount = await this.contracts[this.props.policy].methods.claimCount().call({gas})
    let holderClaimIds = await this.contracts[this.props.policy].methods.fetchPolicyHolderClaimsIds(this.props.accounts[0]).call({gas})
    this.setState({claimCount, holderClaimIds})
  }

  async updateIsPolicyHolder() {
    let gas = 50000 + Math.floor(Math.random() * 1000) + 1
    let policyCurrentTime = await this.contracts[this.props.policy].methods.getPolicyTime().call({gas})
    policyCurrentTime = parseInt(policyCurrentTime, 10)

    let policyInstance = await this.contracts[this.props.policy].methods.policyHolders(this.props.accounts[0]).call({gas})
    let isPolicyHolder = (parseInt(policyInstance.startDate, 10) > 0 && parseInt(policyInstance.endDate, 10) > policyCurrentTime) ? true : false

    this.setState({policyCurrentTime, isPolicyHolder})

    let policyInfo = await this.contracts[this.props.policy].methods.getPolicyInfo().call({gas})

    this.setState({
      policyManager: policyInfo._policyManager,
      price: policyInfo._price,
      coveragePeriod: policyInfo._coveragePeriod,
      maxClaim: policyInfo._maxClaim,
      coverageTerms: policyInfo._coverageTerms,
      isPolicyManager: (policyInfo._policyManager === this.props.accounts[0]) ? true : false,
      coverageTermsHash: policyInfo._coverageTermsHash,
      name: policyInfo._name,
    })
  }

  handlePolicyPurchase() {
    (async () => {

      let queryID = null
      let currentBlock = "latest"
      let receipt = await this.contracts[this.props.policy].methods.purchasePolicy().send({from: this.props.accounts[0], value: this.state.price})

      this.setState({ showSpinnerPurchase: true });

      if(typeof receipt.events.NewOraclizeQuery.returnValues.queryID !== undefined) {
        queryID = receipt.events.NewOraclizeQuery.returnValues.queryID
      }

      if(typeof receipt.blockNumber !== undefined) {
        currentBlock = receipt.blockNumber
      }
      const policyContractWeb3 = new this.context.drizzle.web3.eth.Contract(this.contracts[this.props.policy].abi, this.contracts[this.props.policy].address);
      let checkPolicyFinalize = new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          const pastEvents = await policyContractWeb3.getPastEvents(
            'FinalizePolicyHolder',
            {
               from: currentBlock,
               to: 'pending'
            }
          );

          for (let event of pastEvents) {
            if(
                typeof event.returnValues.queryID !== undefined &&
                event.returnValues.queryID === queryID
              ) {
              clearInterval(interval)
              resolve(event)
              this.setState({ showSpinnerPurchase: false });
            }
          }
        }, 1000);
      })

      await checkPolicyFinalize

      await this.updateIsPolicyHolder()
    })()
  }

  handleClaimSubmit() {
    (async () => {

      let queryID = null
      let currentBlock = "latest"
      let receipt = await this.contracts[this.props.policy].methods.createClaim(this.state._amount, this.state._reason).send({from: this.props.accounts[0]})

      this.setState({ showSpinner: true });

      if(typeof receipt.events.NewOraclizeQuery.returnValues.queryID !== undefined) {
        queryID = receipt.events.NewOraclizeQuery.returnValues.queryID
      }

      if(typeof receipt.blockNumber !== undefined) {
        currentBlock = receipt.blockNumber
      }

      const policyContractWeb3 = new this.context.drizzle.web3.eth.Contract(this.contracts[this.props.policy].abi, this.contracts[this.props.policy].address);

      let checkForClaim = new Promise((resolve, reject) => {
        const interval = setInterval(async () => {
          const pastEvents = await policyContractWeb3.getPastEvents(
            'ClaimFinalize',
            {
              from: currentBlock,
              to: 'pending'
            }
          );

          for (let event of pastEvents) {
            if(
                typeof event.returnValues.queryID !== undefined &&
                event.returnValues.queryID === queryID
              ) {
              clearInterval(interval)
              resolve(event)
              this.setState({ showSpinner: false });
            }
          }
        }, 1000);
      })

      await checkForClaim

      this.setState({
        _amount: '',
        _reason: '',
      })

      await this.updateClaims()

    })()
  }

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {

    let claimCount = this.state.claimCount
    let isPolicyHolder = this.state.isPolicyHolder
    let policyCurrentTime = this.state.policyCurrentTime

    let policyManager = this.state.policyManager
    let price = this.state.price
    let coveragePeriod = this.state.coveragePeriod
    let maxClaim = this.state.maxClaim
    let coverageTerms = this.state.coverageTerms
    let isPolicyManager = this.state.isPolicyManager
    let coverageTermsHash = this.state.coverageTermsHash
    let name = this.state.name

    // Make sure we have required data before rendering.
    if (typeof isPolicyHolder === 'undefined' || typeof policyCurrentTime === 'undefined' || typeof claimCount === 'undefined') {
      return(
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>⚙️</h1>
            <p>Fetching Data...</p>
          </div>
        </div>
      )
    }

    (async () => {
      this.policyBalance = await this.context.drizzle.web3.eth.getBalance(this.props.policy)
    })()

    return(
      <div style={{border: 'solid 1px black', padding: '15px 30px 30px 30px'}} className="pure-u-1-1">
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
            <h2>Purchase {name}</h2>
            <p>{price} wei plus gas will be sent to cover the cost of the policy.</p>
            <form className="pure-form pure-form-stacked">
              <button key="claimSubmit" className="pure-button" type="button" onClick={this.handlePolicyPurchase}>Submit</button>
              {this.state.showSpinnerPurchase &&
                <p> 🔄 Waiting for Oraclize Callback</p>
              }
            </form>
          </div>
        }

        {isPolicyHolder &&

          <div>
            <p>Congratulations for owning this policy!</p>
            <h2>Submit Claim</h2>
            <form className="pure-form pure-form-stacked">
              <input key="_amount" type="number" name="_amount" value={this.state._amount} placeholder="Amount" onChange={this.handleInputChange} />
              <input key="_reason" type="text" name="_reason" value={this.state._reason} placeholder="Reason" onChange={this.handleInputChange} />
              <button key="claimSubmit" className="pure-button" type="button" onClick={this.handleClaimSubmit}>Submit</button>
              {this.state.showSpinner &&
                <p> 🔄 Waiting for Oraclize Callback</p>
              }
            </form>
            <br/>
          </div>
        }

        <HolderClaims policy={this.props.policy} claimCount={claimCount} isPolicyManager={isPolicyManager} holderClaimIds={this.state.holderClaimIds} />
        {isPolicyManager &&
          <PolicyManagerProcessClaims policy={this.props.policy} claimCount={claimCount} isPolicyManager={isPolicyManager} />
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
