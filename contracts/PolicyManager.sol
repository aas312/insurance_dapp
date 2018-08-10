pragma solidity ^0.4.23;

import "./Policy.sol";

contract PolicyManager {

	// creator of contract
	address public admin;

	// List of policy managers
	mapping (address => bool) public policyManagers;

	// Circuit Breaker
	bool public stopped = false;

	// List of policies mapped to a policy manager;
	mapping (address => address[]) public policiesByManager;
	// All Policy Catalog
	address[] public allPolicies;

	//modifiers
	modifier stopInEmergency { require(!stopped, "stopInEmergency"); _; }
	modifier onlyInEmergency { require(stopped, "onlyInEmergency"); _; }

	modifier onlyAdmin { require(msg.sender == admin, "onlyAdmin"); _; }
	modifier onlyPolicyManager { require(policyManagers[msg.sender] == true, "onlyPolicyManager"); _; }

	//events
	event AddPolicyManager(address indexed policyManager);
	event AddPolicy(address indexed policy);
	event contractStopped();
	event contractRestarted();


	constructor() public {
		admin = msg.sender;
	}

	function addPolicyManager(address _address)
		public
		onlyAdmin
		stopInEmergency
		returns(bool)
	{
		policyManagers[_address] = true;
		emit AddPolicyManager(_address);
		return true;
	}

	function createPolicy(string _name, uint _price, uint _coveragePeriod, uint _maxClaim, string _coverageTerms, string _coverageTermsHash)
		public
		payable
		onlyPolicyManager
		stopInEmergency
		returns(address)
	{
	    address _policyManager = msg.sender;
		Policy newPolicy = new Policy(_name, _price, _coveragePeriod, _maxClaim, _coverageTerms, _coverageTermsHash, _policyManager);
		policiesByManager[msg.sender].push(address(newPolicy));
		allPolicies.push(address(newPolicy));

		emit AddPolicy(address(newPolicy));

		return address(newPolicy);
	}

	function getAllPoliciesCount ()
		public
		view
		returns (uint)
	{
		return allPolicies.length;

	}

	function getAllPolicies ()
		public
		view
		returns (address[])
	{
		return allPolicies;
	}

	function stopContract ()
		public
		onlyAdmin
	{
		stopped = true;
		emit contractStopped();
	}

	function restartContract ()
		public
		onlyAdmin
	{
		stopped = false;
		emit contractRestarted();
	}
}
