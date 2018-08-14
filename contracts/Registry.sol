pragma solidity ^0.4.24;

contract Registry {
    address backendContract;
    address[] previousBackends;
    address owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function changeBackend(address newBackend) public
    onlyOwner()
    returns (bool)
    {
        if(newBackend != backendContract) {
            previousBackends.push(backendContract);
            backendContract = newBackend;
            return true;
        }

        return false;
    }

  function getBackendContract ()
    public
    view
    returns (address)
  {
    return backendContract;
  }

}
