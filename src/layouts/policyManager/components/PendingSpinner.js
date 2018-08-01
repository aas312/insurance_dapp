import React from 'react'
import { drizzleConnect } from 'drizzle-react'

function PendingSpinner(props) {

	let pendingSpinner = props.contracts[props.contract].synced ? '' : ' 🔄'

  return (
  	<div>{pendingSpinner}</div>
  );
}

const mapStateToProps = state => {
  return {
    contracts: state.contracts
  }
}

export default drizzleConnect(PendingSpinner, mapStateToProps);