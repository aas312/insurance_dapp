import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PolicyInterface from './../../../../build/contracts/Policy.json'

// Components
import Policy from './Policy.js'
import { AccountData } from 'drizzle-react-components'
import AddPolicyManager from './../components/AddPolicyManager.js'
import CreatePolicy from './../components/CreatePolicy.js'

class PolicyManager extends Component {



  constructor(props, context) {
    super(props)

		this.keys = {}
		this.contracts = context.drizzle.contracts

    this.keys.isPolicyManager = this.contracts.PolicyManager.methods.policyManagers.cacheCall(this.props.accounts[0])
    this.keys.admin = this.contracts.PolicyManager.methods.admin.cacheCall()

    this.keys.policies = this.contracts.PolicyManager.methods.getAllPolicies.cacheCall()


    this.keys.policyManagerContract = this.contracts.Registry.methods.getBackendContract.cacheCall()



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

  	let isPolicyManager
  	let policies
  	let admin
  	let currentAddress = this.props.accounts[0]
  	let isAdmin = false
  	let policyList


    if((this.keys.isPolicyManager in this.props.PolicyManager.policyManagers)) {
    	isPolicyManager = this.props.PolicyManager.policyManagers[this.keys.isPolicyManager].value
    }

    if((this.keys.policies in this.props.PolicyManager.getAllPolicies)) {
    	policies = this.props.PolicyManager.getAllPolicies[this.keys.policies].value
    	policyList = policies.map((policy) => <Policy key={policy} policy={policy} />)
		}

    if((this.keys.admin in this.props.PolicyManager.admin)) {
    	admin = this.props.PolicyManager.admin[this.keys.admin].value
	  	if(admin === currentAddress) {
	  		isAdmin = true
	  	}
		}

		// Make sure we have required data before rendering.
		if (typeof isPolicyManager === 'undefined'|| typeof policies === 'undefined' || typeof admin === 'undefined') {
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
            <h2>Uport User Data</h2>
            {typeof this.props.user.data.name !== 'undefined' &&
              <p>Name: {this.props.user.data.name}</p>
            }
            {typeof this.props.user.data.country !== 'undefined' &&
              <p>Country: {this.props.user.data.country}</p>
            }
            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>Active Account</h2>
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
          	<AddPolicyManager />
          }

          {isPolicyManager &&
	          	<CreatePolicy />
          }

          {policyList}

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
    user: state.user
  }
}

export default drizzleConnect(PolicyManager, mapStateToProps);
