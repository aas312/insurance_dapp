import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PolicyInterface from './../../build/contracts/Policy.json'

// Components
import Policy from './Policy.js'
import { AccountData, ContractData, ContractForm } from 'drizzle-react-components'
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
            <h2>Active Account</h2>
            <AccountData accountIndex="0" units="ether" precision="3" />
            <br/><br/>
          </div>

          {isAdmin &&
          	<AddPolicyManager />
          }

          {isPolicyManager &&
	          	<CreatePolicy />
          }

          {policyList}

          <div className="pure-u-1-1">
            <h2>SimpleStorage</h2>
            <p>This shows a simple ContractData component with no arguments, along with a form to set its value.</p>
            <p><strong>Stored Value</strong>: <ContractData contract="SimpleStorage" method="storedData" /></p>
            <ContractForm contract="SimpleStorage" method="set" />
            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>TutorialToken</h2>
            <p>Here we have a form with custom, friendly labels. Also note the token symbol will not display a loading indicator. We've suppressed it with the <code>hideIndicator</code> prop because we know this variable is constant.</p>
            <p><strong>Total Supply</strong>: <ContractData contract="TutorialToken" method="totalSupply" methodArgs={[{from: this.props.accounts[0]}]} /> <ContractData contract="TutorialToken" method="symbol" hideIndicator /></p>
            <p><strong>My Balance</strong>: <ContractData contract="TutorialToken" method="balanceOf" methodArgs={[this.props.accounts[0]]} /></p>
            <h3>Send Tokens</h3>
            <ContractForm contract="TutorialToken" method="transfer" labels={['To Address', 'Amount to Send']} />

            <br/><br/>
          </div>

          <div className="pure-u-1-1">
            <h2>ComplexStorage</h2>
            <p>Finally this contract shows data types with additional considerations. Note in the code the strings below are converted from bytes to UTF-8 strings and the device data struct is iterated as a list.</p>
            <p><strong>String 1</strong>: <ContractData contract="ComplexStorage" method="string1" toUtf8 /></p>
            <p><strong>String 2</strong>: <ContractData contract="ComplexStorage" method="string2" toUtf8 /></p>
            <strong>Single Device Data</strong>: <ContractData contract="ComplexStorage" method="singleDD" />

            <br/><br/>
          </div>
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
    SimpleStorage: state.contracts.SimpleStorage,
    TutorialToken: state.contracts.TutorialToken,
    PolicyManager: state.contracts.PolicyManager,
    contracts: state.contracts,
    drizzleStatus: state.drizzleStatus,
    transactions: state.transactions
  }
}



export default drizzleConnect(PolicyManager, mapStateToProps);
