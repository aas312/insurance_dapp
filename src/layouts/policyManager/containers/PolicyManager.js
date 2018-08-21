import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PolicyInterface from './../../../../build/contracts/Policy.json'
import PolicyManagerInterface from './../../../../build/contracts/PolicyManager.json'

// Components
import Policy from './Policy.js'
import { AccountData } from 'drizzle-react-components'
import AddPolicyManager from './../components/AddPolicyManager.js'
import CreatePolicyForm from './CreatePolicyForm.js'
import PendingSpinner from './../components/PendingSpinner.js'


class PolicyManager extends Component {

  constructor(props, context) {
    super(props)

    this.handleStop = this.handleStop.bind(this);
    this.handleRestart = this.handleRestart.bind(this);
    this.loadPolicies = this.loadPolicies.bind(this);

		this.keys = {}
		this.contracts = context.drizzle.contracts

    this.keys.isPolicyManager = this.contracts.PolicyManager.methods.policyManagers.cacheCall(this.props.accounts[0])
    this.keys.admin = this.contracts.PolicyManager.methods.admin.cacheCall()

    this.keys.policyManagerContract = this.contracts.Registry.methods.getBackendContract.cacheCall()

    let initialState = {policies: []}
    initialState['showSpinner'] = false
    this.state = initialState;

  }

  async loadPolicies() {
    let gas = 50000 + Math.floor(Math.random() * 1000) + 1
    let policies = await this.contracts.PolicyManager.methods.getAllPolicies().call({gas})
    for (let policy of policies) {
      if (typeof this.contracts[policy] == undefined) {
        let contractConfig = {
          contractName: policy,
          web3Contract: new this.context.drizzle.web3.eth.Contract(PolicyInterface.abi, policy)
        }

        this.context.drizzle.addContract(contractConfig)
      }
    }
    policies.reverse()
    this.setState({policies})
  }

  componentWillMount() {

    (async () => {
      await this.updateStopped()
      await this.loadPolicies()
    })()
  }

  handleStop() {
    (async () => {
      await this.contracts.PolicyManager.methods.stopContract().send({from: this.props.accounts[0]});
      await this.updateStopped()
    })()
  }

  handleRestart() {
    (async () => {
      await this.contracts.PolicyManager.methods.restartContract().send({from: this.props.accounts[0], gas: 50000})
      await this.updateStopped()
    })()
  }

  async updateStopped() {
    let gas = 50000 + Math.floor(Math.random() * 1000) + 1
    let stopped = await this.contracts.PolicyManager.methods.stopped().call({gas})
    this.setState({stopped})
  }

  render() {

  	let isPolicyManager
  	let policies
  	let admin
  	let currentAddress = this.props.accounts[0]
  	let isAdmin = false
  	let policyList
    let stopped

    if((this.keys.isPolicyManager in this.props.PolicyManager.policyManagers)) {
    	isPolicyManager = this.props.PolicyManager.policyManagers[this.keys.isPolicyManager].value
    }

    if((this.keys.admin in this.props.PolicyManager.admin)) {
    	admin = this.props.PolicyManager.admin[this.keys.admin].value
	  	if(admin === currentAddress) {
	  		isAdmin = true
	  	}
		}

    // Get policies
    policies = this.state.policies
    policyList = policies.map((policy) => <Policy key={policy} policy={policy} />)

    stopped = this.state.stopped

		// Make sure we have required data before rendering.
		if (typeof isPolicyManager === 'undefined'|| typeof policies === 'undefined' || typeof admin === 'undefined' || typeof stopped === 'undefined') {
	    return(
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>⚙️</h1>
            <p>Loading dapp...</p>
          </div>
        </div>
	    )
	 	}

    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1 header">
            <h1>Insurance Policy Manager</h1>
            <p>Fun and Fancy insurance to meet all of your needs.</p>
            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>User Data</h2>
            {typeof this.props.user.data.name !== 'undefined' &&
              <p>Uport Name: {this.props.user.data.name}</p>
            }
            {typeof this.props.user.data.country !== 'undefined' &&
              <p>Uport Country: {this.props.user.data.country}</p>
            }
            <p>
            Active Account
            </p>
            <AccountData accountIndex="0" units="ether" precision="3" />
            <p>Remember to reload the browser whenever changing accounts.</p>
            <br/><br/>
          </div>

          {this.keys.policyManagerContract in this.props.Registry.getBackendContract &&
            <div className="pure-u-1-1">
              <h2>PolicyManager address in Registry contract</h2>
              <p>{this.props.Registry.getBackendContract[this.keys.policyManagerContract].value}</p>
              <br/><br/>
            </div>
          }

          {isAdmin &&
            <div>
              <form>
                {!stopped &&
                  <div>
                    <button style={{color: 'red'}} key="stop" className="pure-button" type="button" onClick={this.handleStop}>Stop Contract</button>
                  </div>
                }
                {stopped &&
                  <button style={{color: 'green'}} key="restart" className="pure-button" type="button" onClick={this.handleRestart}>Restart Contract</button>
                }
              </form>
              {!stopped &&
                <AddPolicyManager />
              }
          </div>
          }

          {isPolicyManager && !stopped &&
            <div className="pure-u-1-1">
              <h2>Add Policy</h2>
              <CreatePolicyForm loadPolicies={this.loadPolicies} labels={["Name", "Price", "Coverage Period (seconds)", "Max Claim", "Terms", "IPFS Hash Terms File"]} value={1000000000000000000}/>
              <PendingSpinner contract="PolicyManager" />
              <br/><br/>
            </div>
          }

          {!stopped &&
            policyList
          }
          <PendingSpinner contract="PolicyManager" />

        </div>
      </main>
    )
  }
}

PolicyManager.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {

  return {
    accounts: state.accounts,
    PolicyManager: state.contracts.PolicyManager,
    Registry: state.contracts.Registry,
    contracts: state.contracts,
    drizzleStatus: state.drizzleStatus,
    transactions: state.transactions,
    user: state.user,
    web3: state.web3
  }
}

export default drizzleConnect(PolicyManager, mapStateToProps);
