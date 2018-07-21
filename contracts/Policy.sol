pragma solidity ^0.4.23;

import "./SafeMath.sol";

contract Policy {

	//using SafeMath for uint;	

	address public policyManager;

	uint public price;
	uint public maxClaim;
	string public coverageTerms;

		//enum CoverageOptions {OneMin, FiveMin, OneHour, OneDay, OneWeek, OneMonth, SixMonth, OneYear}
	    //CoverageOptions coveragePeriod;
	    uint public coveragePeriod;

	//Policy Holder Coverage
	struct PolicyInstance {
		uint startDate;
		uint endDate;
		uint[] claimIds;
	}
	mapping (address => PolicyInstance) public policyHolders;

	// Claims
	uint public claimCount;
	enum Status {Open, Paid, Denied}
	struct Claim {
		Status status;
		uint amount;
		address policyHolder;
		string reason;
	}
	mapping (uint => Claim) public claims;

	// Circuit Breaker
	bool public stopped = false;

	//events
	event AddPolicyHolder(address indexed policyHolder);
	event ClaimSubmit(address indexed policyHolder, uint indexed claimId);
	event ClaimPaid(address indexed policyHolder, uint indexed claimId);
	event ClaimDenied(address indexed policyHolder, uint indexed claimId);
	event contractStopped();
	event contractRestarted();

	//modifiers
	// Emergency Stop
	modifier stopInEmergency { require(!stopped, "stopInEmergency"); _; }
	modifier onlyInEmergency { require(stopped, "onlyInEmergency"); _; }

	//Restrict Access
	modifier onlyPolicyManager { require(msg.sender == policyManager, "onlyPolicyManager"); _; }
	modifier onlyValidPolicyHolder { require(policyHolders[msg.sender].endDate > 0 && now < policyHolders[msg.sender].endDate, "onlyValidPolicyHolder"); _; }
    modifier notValidPolicyHolder { require(policyHolders[msg.sender].endDate == 0 || now > policyHolders[msg.sender].endDate, "notValidPolicyHolder"); _; }

	//Check State
	modifier claimOpen (uint _claimId) {require (claims[_claimId].status == Status.Open, "claimOpen"); _;}
	modifier validClaim (uint _amount) {require (_amount < maxClaim, "validClaim"); _;}
	modifier claimExist (uint _claimId) {require (claims[_claimId].policyHolder != address(0), "claimExist"); _;}

	//Check Value
  modifier paidEnough() { require(msg.value >= price, "paidEnough"); _;}
  modifier checkValue() {
    //refund them after pay for item (why it is before, _ checks for logic before func)
    _;
    uint amountToRefund = msg.value - price;
    msg.sender.transfer(amountToRefund);
  }


	modifier fundsAvailable (uint _claimId) {require (claims[_claimId].amount <= address(this).balance, "fundsAvailable"); _;}


	constructor(uint _price, uint _coveragePeriod, uint _maxClaim, string _coverageTerms, address _policyManager) 
	  public
	{
		price = _price;
		coveragePeriod = _coveragePeriod;
		maxClaim = _maxClaim;
		coverageTerms = _coverageTerms;
		claimCount = 0;
		policyManager = _policyManager;
	}

	function purchasePolicy ()
		public
		payable
		stopInEmergency
		notValidPolicyHolder
		paidEnough
		checkValue
	{
		policyHolders[msg.sender].startDate = now;
		policyHolders[msg.sender].endDate = SafeMath.add(now, coveragePeriod);
		//policyHolders[msg.sender].claimIds = new uint[](0);
	}

	function createClaim (uint _amount, string _reason)
		public
		onlyValidPolicyHolder
		validClaim(_amount)
		stopInEmergency
	{
	    claimCount++;
	    uint _claimId = claimCount;
	    claims[_claimId].status = Status.Open;
	    claims[_claimId].amount = _amount;
	    claims[_claimId].policyHolder = msg.sender;
	    claims[_claimId].reason = _reason;

        policyHolders[msg.sender].claimIds.push(_claimId);

        emit ClaimSubmit(msg.sender, _claimId);
	}

	function payClaim (uint _claimId)
		public
		payable
		onlyPolicyManager
		claimExist(_claimId)
		claimOpen (_claimId)
		fundsAvailable (_claimId)
		stopInEmergency
	{
	    claims[_claimId].policyHolder.transfer(claims[_claimId].amount);
	    claims[_claimId].status = Status.Paid;
	    emit ClaimPaid(claims[_claimId].policyHolder, _claimId);
	}	

	function denyClaim (uint _claimId)
		public
		onlyPolicyManager
		claimExist(_claimId)
		claimOpen (_claimId)
		stopInEmergency
	{
	    claims[_claimId].status = Status.Denied;
	    emit ClaimDenied(claims[_claimId].policyHolder, _claimId);
	}	

	function stopContract ()
		public
		onlyPolicyManager
	{
		stopped = true;
		emit contractStopped();
	}

	function restartContract ()
		public
		onlyPolicyManager
	{
		stopped = false;
		emit contractRestarted();
	}
	
	function getBalance()
	    public
	    view
	    returns (uint256) {
        return address(this).balance;
    }

    function ()
      public
      payable 
    {
    }
    
}