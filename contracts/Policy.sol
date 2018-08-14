pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./usingOraclize.sol";

contract Policy is usingOraclize {





    uint public currentTime;

	//using SafeMath for uint;

	address public policyManager;
	string public name;
	uint public price;
	uint public maxClaim;
	string public coverageTerms;
	string public coverageTermsHash;

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

	//Oraclize
	enum OCType {PolicyPurchase, ClaimSubmit}
	struct OraclizeCall {
		OCType octype;
		address policyHolder;
		string reason;
		uint amount;
	}
	mapping (bytes32 => OraclizeCall) public pendingcalls;

	// Claims
	uint public claimCount;
	enum Status {Open, Approved, Denied, Paid}
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
	event SubmitPolicyHolder(address indexed policyHolder);
	event FinalizePolicyHolder(address indexed policyHolder);
	event ClaimSubmit(address indexed policyHolder);
	event ClaimFinalize(address indexed policyHolder, uint indexed claimId);
	event ClaimApproved(address indexed policyHolder, uint indexed claimId);
	event ClaimDenied(address indexed policyHolder, uint indexed claimId);
	event ClaimPaid(address indexed policyHolder, uint indexed claimId);
	event contractStopped();
	event contractRestarted();
	event ReceivedFunds(address indexed funder, uint amount);
  event newOraclizeQuery(string description);
  event newTimeMeasure(string time);

	//modifiers
	// Emergency Stop
	modifier stopInEmergency { require(!stopped, "stopInEmergency"); _; }
	modifier onlyInEmergency { require(stopped, "onlyInEmergency"); _; }

	//Restrict Access
	modifier onlyPolicyManager { require(msg.sender == policyManager, "onlyPolicyManager"); _; }
	modifier onlyValidPolicyHolder { require(policyHolders[msg.sender].endDate > 0, "onlyValidPolicyHolder"); _; }
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

	constructor(string _name, uint _price, uint _coveragePeriod, uint _maxClaim, string _coverageTerms, string _coverageTermsHash, address _policyManager)
	  public
	  payable
	{
	    name = _name;
		price = _price;
		coveragePeriod = _coveragePeriod;
		maxClaim = _maxClaim;
		coverageTerms = _coverageTerms;
		claimCount = 0;
		policyManager = _policyManager;
		coverageTermsHash = _coverageTermsHash;
	}

	function purchasePolicy ()
		public
		payable
		stopInEmergency
		notValidPolicyHolder
		paidEnough
		checkValue
		returns(bytes32 myID)
	{
        // Submit to Oraclize.
		emit newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
		myID = oraclize_query("WolframAlpha", "Timestamp now");
		// Store the date we'll need to create the policy.
        pendingcalls[myID].octype = OCType.PolicyPurchase;
        pendingcalls[myID].policyHolder = msg.sender;
		emit SubmitPolicyHolder(msg.sender);
	}

	function createClaim (uint _amount, string _reason)
		public
		validClaim(_amount)
		onlyValidPolicyHolder
		stopInEmergency
	{
	    // Submit to Oraclize.
		emit newOraclizeQuery("Oraclize query was sent, standing by for the answer..");
		bytes32 myID = oraclize_query("WolframAlpha", "Timestamp now");
		// Save out data to create claim.
        pendingcalls[myID].octype = OCType.ClaimSubmit;
        pendingcalls[myID].reason = _reason;
        pendingcalls[myID].amount = _amount;
        pendingcalls[myID].policyHolder = msg.sender;

        emit ClaimSubmit(msg.sender);
	}

	function approveClaim (uint _claimId)
		public
		payable
		onlyPolicyManager
		claimExist(_claimId)
		claimOpen (_claimId)
		fundsAvailable (_claimId)
		stopInEmergency
	{
	    claims[_claimId].policyHolder.transfer(claims[_claimId].amount);
	    claims[_claimId].status = Status.Approved;
	    emit ClaimApproved(claims[_claimId].policyHolder, _claimId);
	}

	function collectClaim (uint _claimId)
		public
		payable
		claimExist(_claimId)
		fundsAvailable (_claimId)
		stopInEmergency
	{
			// Only the claim submitter can collect claim.
			require(msg.sender == claims[_claimId].policyHolder, "Only the claim submitter can collect claim");
			// Only approved claim can be collected.
			require(claims[_claimId].status == Status.Approved, "Only approved claim can be collected");
	    msg.sender.transfer(claims[_claimId].amount);
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
    emit ReceivedFunds(msg.sender, msg.value);
  }

	function fetchPolicyHolderClaimId (address _address, uint _holderClaimId)
		public
		view
		returns (uint _claimId)
	{
		_claimId = policyHolders[_address].claimIds[_holderClaimId];
	}

	function fetchPolicyHolderClaimsIds (address _address)
		public
		view
		returns (uint[] _claimIds)
	{
		_claimIds = policyHolders[_address].claimIds;
	}

	function getPolicyInfo ()
		public
		view
		returns (address _policyManager, string _name, uint _price, uint _coveragePeriod, uint _maxClaim, string _coverageTerms, string _coverageTermsHash)
	{
		_policyManager = policyManager;
		_name = name;
		_price = price;
		_maxClaim = maxClaim;
		_coverageTerms = coverageTerms;
		_coverageTermsHash = coverageTermsHash;
		_coveragePeriod = coveragePeriod;

		return (_policyManager, _name, _price, _coveragePeriod, _maxClaim, _coverageTerms, _coverageTermsHash);
	}

	function getPolicyTime ()
		public
		view
		returns (uint _now)
	{
		_now = now;
		return _now;
	}

  function __callback(bytes32 myID, string result) public {
    require(msg.sender == oraclize_cbAddress());
    currentTime = parseInt(result);
    emit newTimeMeasure(result);
    address policyHolder = pendingcalls[myID].policyHolder;
    // If we are doing a purchase.
    if(pendingcalls[myID].octype == OCType.PolicyPurchase) {
			policyHolders[policyHolder].startDate = currentTime;
			policyHolders[policyHolder].endDate = SafeMath.add(currentTime, coveragePeriod);
			emit FinalizePolicyHolder(policyHolder);
    }
    // If we are doing a claim.
    if(pendingcalls[myID].octype == OCType.ClaimSubmit) {
      // Require policy expired
      require(currentTime < policyHolders[policyHolder].endDate, "Claim submitted for expired policy.");
      claimCount++;
	    uint _claimId = claimCount;
	    claims[_claimId].status = Status.Open;
	    claims[_claimId].amount = pendingcalls[myID].amount;
	    claims[_claimId].policyHolder = policyHolder;
	    claims[_claimId].reason = pendingcalls[myID].reason;
	    policyHolders[policyHolder].claimIds.push(claimCount);
	    emit ClaimFinalize(policyHolder, _claimId);
    }
  }
}
