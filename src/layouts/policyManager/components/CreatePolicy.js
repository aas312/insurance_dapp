import React from 'react'

//Components
import CreatePolicyForm from '../containers/CreatePolicyForm.js'
import PendingSpinner from './PendingSpinner.js'

function CreatePolicy(props) {

  return (
	  <div className="pure-u-1-1">
	    <h2>Add Policy</h2>
	    <CreatePolicyForm contract="PolicyManager" method="createPolicy" labels={["Name", "Price", "Coverage Period (seconds)", "Max Claim", "Terms", "IPFS Hash Terms File"]}/>
	    <PendingSpinner contract="PolicyManager" />
	    <br/><br/>
	  </div>
  );
}

export default CreatePolicy;
