import React from 'react'

//Components
import { ContractForm } from 'drizzle-react-components'
import PendingSpinner from './PendingSpinner.js'

function CreatePolicy(props) {

  return (
	  <div className="pure-u-1-1">
	    <h2>Add Policy</h2>
	    <ContractForm contract="PolicyManager" method="createPolicy" labels={["Price", "Coverage Period", "Max Claim", "Terms"]}/>
	    <PendingSpinner contract="PolicyManager" />
	    <br/><br/>
	  </div>
  );
}

export default CreatePolicy;