pragma solidity 0.4.24;


/** @title Registry. */
contract Registry {


    address public backendContract; // Store address of current backend contract.
    address[] public previousBackends;  // Array of previous contract backends.
    address public owner;   // Address of contract owner

    /** @dev Constructor for registry contract.
      */
    constructor() public {
        owner = msg.sender; // Set owner of contract to contract creator.
    }

    // Only allowed for owner.
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /** @dev Change the stored backend.
      * @param newBackend The new backend contract to store in registry.
      * @return true on successful backend update
      */
    function changeBackend(address newBackend) public
        onlyOwner()
    returns (bool)
    {
        // Revert if new backend is the same as our current backend.
        require(newBackend != backendContract, "New backend must be different than old backend.");
        previousBackends.push(backendContract); // Add current backend to list of previous backends.
        backendContract = newBackend;   // Replace current backend with new backend.
        return true;    // Return true.
    }

    /** @dev Get current backend contract.
      * @return The current backend contract.
      */
    function getBackendContract ()
        public
        view
        returns (address)
    {
        return backendContract;
    }

    /** @dev Get list of previous backend contracts.
      * @return An array of previous backend contracts.
      */
    function getPreviousBackends ()
        public
        view
        returns (address[])
    {
        return previousBackends;
    }
}
