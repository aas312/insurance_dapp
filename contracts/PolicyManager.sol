pragma solidity 0.4.24;

import "./Policy.sol";


/** @title Insurance Policy Manager. */
contract PolicyManager {


    // Admin is creator of contract
    address public admin;

    // Mapping of policy managers.
    // Set to true to add policy manager.
    mapping (address => bool) public policyManagers;

    // Circuit Breaker
    bool public stopped = false;

    // List of policies mapped to a policy manager;
    mapping (address => address[]) public policiesByManager;
    // All Policy Catalog
    // Array of Policy addresses
    address[] public allPolicies;

    //modifiers
    modifier stopInEmergency { require(!stopped, "stopInEmergency"); _; }   // Not allowed when stopped
    modifier onlyInEmergency { require(stopped, "onlyInEmergency"); _; }    // Only allowed when stopped

    modifier onlyAdmin { require(msg.sender == admin, "onlyAdmin"); _; }    // Only admin can use this function
    // Only a policy manager can use this function.
    modifier onlyPolicyManager { require(policyManagers[msg.sender] == true, "onlyPolicyManager"); _; }

    // Add policy manager event.
    event AddPolicyManagerEvent(address indexed policyManager);
    // Add policy even
    event AddPolicy(address indexed policy);

    // Stop contract event
    event ContractStopped();
    // Restart contract event.
    event ContractRestarted();

    /** @dev Constructor to initialize policy manager contract.
      */
    constructor() public {
        admin = msg.sender; // Set the contract admin to the creator of the policy manager contract.
    }

    /** @dev Constructor to set up policy.
      * @param _address The policy manager to add, by address.
      * @return true.
      */
    function addPolicyManager(address _address)
        public
        onlyAdmin
        stopInEmergency
        returns(bool)
    {
        policyManagers[_address] = true;    // Set address to true in policy manager array to add manager.
        emit AddPolicyManagerEvent(_address);
        return true;
    }

    /** @dev Create a new Policy contract and store it's address.
      * @param _name Name of the policy.
      * @param _price Price of the policy.
      * @param _coveragePeriod The coverage period of the policy.
      * @param _maxClaim The max claim of the policy.
      * @param _coverageTerms The coverage terms as a string of the policy.
      * @param _coverageTermsHash The hash of an ipfs file with the terms of the policy.
      * @return the address of the created policy.
      */
    function createPolicy(
        string _name,
        uint _price,
        uint _coveragePeriod,
        uint _maxClaim,
        string _coverageTerms,
        string _coverageTermsHash
    )
        public
        payable
        onlyPolicyManager
        stopInEmergency
        returns(address)
    {
        // Create a new policy instance based on input values and msg sender.
        address _policyManager = msg.sender;
        Policy newPolicy = new Policy(
            _name, _price,
            _coveragePeriod,
            _maxClaim,
            _coverageTerms,
            _coverageTermsHash,
            _policyManager
        );
        // Add to list of policies belonging to a policy manager.
        policiesByManager[msg.sender].push(address(newPolicy));
        allPolicies.push(address(newPolicy));   // Add new policy address to list of all policies.
        // Transfer all value passed to new policy.
        // Policy manager contract doesn't hold any value.
        address(newPolicy).transfer(msg.value);
        emit AddPolicy(address(newPolicy));
        return address(newPolicy);  // Return new policy address.
    }

    /** @dev Get number of created policies.
      * @return The number of policies.
      */
    function getAllPoliciesCount ()
        public
        view
        returns (uint)
    {
        return allPolicies.length;  // Return policy count.
    }

    /** @dev Get all policies.
      * @return An array of all policies.
      */
    function getAllPolicies ()
        public
        view
        returns (address[])
    {
        return allPolicies;
    }

    /** @dev Stop contract.
      */
    function stopContract ()
        public
        onlyAdmin
    {
        stopped = true; // Update storage to stop contract.
        emit ContractStopped();
    }

    /** @dev Restart contract.
      */
    function restartContract ()
        public
        onlyAdmin
    {
        stopped = false;    // Update storage to restart contract.
        emit ContractRestarted();
    }
}
