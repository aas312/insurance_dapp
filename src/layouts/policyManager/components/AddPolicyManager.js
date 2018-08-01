import React from 'react'

//Components
import { ContractForm } from 'drizzle-react-components'
import PendingSpinner from './PendingSpinner.js'

function AddPolicyManager(props) {

  return (
	  <div className="pure-u-1-1">
	    <h2>Add Policy Managers</h2>
	    <ContractForm contract="PolicyManager" method="addPolicyManager" labels={["address"]}/>
	    <PendingSpinner contract="PolicyManager" />
	    <br/><br/>
	  </div>
  );
}

export default AddPolicyManager;