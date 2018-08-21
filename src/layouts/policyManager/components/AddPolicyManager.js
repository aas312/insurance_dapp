import React from 'react'

//Components
import PendingSpinner from './PendingSpinner.js'
import ContractFormValue from '../containers/ContractFormValue.js'

function AddPolicyManager(props) {

  return (
	  <div className="pure-u-1-1">
	    <h2>Add Policy Managers</h2>
	    <ContractFormValue contract="PolicyManager" method="addPolicyManager" labels={["address"]}/>
	    <br/><br/>
	  </div>
  );
}

export default AddPolicyManager;
