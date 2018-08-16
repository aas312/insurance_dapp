pragma solidity 0.4.24;

import "./SafeMath.sol";
import "./usingOraclize.sol";


/** @title Insurance Policy. */
contract Policy is usingOraclize {

    // Variable to hold Oraclize time measurements.
    uint public currentTime;

    // The manager of the policy
    address public policyManager;

    // Policy info
    string public name;                 // Policy Name
    uint public price;                  // Policy Price
    uint public maxClaim;               // Policy Max Claim
    string public coverageTerms;        // Policy coverage terms as string
    string public coverageTermsHash;    // IPFS of uploaded policy terms
    uint public coveragePeriod;         // Policy Coverage period in seconds

    // Policy Holder Coverage
    // A specific instance of a purchased policy
    struct PolicyInstance {
        uint startDate; // The start date of an individuals policy
        uint endDate;   // The end date of an individuals policy
        uint[] claimIds;// An array of the claimIds of claims submitted by the holder
    }

    // Mapping of Policy Holders as address to the instance of their policy.
    mapping (address => PolicyInstance) public policyHolders;

    // Different types of Oraclize calls we are using.
    enum OCType {PolicyPurchase, ClaimSubmit}

    // Stored data of Oraclize call to retrieve and use in callback.
    struct OraclizeCall {
        OCType octype;          // Cal type (PolicyPurchase or ClaimSubmit)
        address policyHolder;   // The Policy holder, as address
        string reason;          // Reason, used for submitting a claim
        uint amount;            // Amount, used for submitting a claim
    }

    // Map Oraclize query ids to the stored data to use in the callback.
    mapping (bytes32 => OraclizeCall) public pendingcalls;

    // Claims information
    uint public claimCount;  // Number of submitted claims.
    enum Status {Open, Approved, Denied, Paid}  // Current status of a claim.

    // All data for a single instance of a claim
    struct Claim {
        Status status;  // Status of the current claim.
        uint amount;    // The amount of the claim.
        address policyHolder; // The policy holder that submitted the claim
        string reason;  // The reason for the claim.
    }

    // Mapping to hold all claims
    // ClaimIds incremented by claim count
    // mapped to a claim instance.
    mapping (uint => Claim) public claims;

    // Circuit Breaker
    bool public stopped = false;

    // Policy purchase events
    event SubmitPolicyHolder(address indexed policyHolder);
    event FinalizePolicyHolder(address indexed policyHolder);

    // Claim events
    event ClaimSubmit(address indexed policyHolder);
    event ClaimFinalize(address indexed policyHolder, uint indexed claimId);
    event ClaimApproved(address indexed policyHolder, uint indexed claimId);
    event ClaimDenied(address indexed policyHolder, uint indexed claimId);
    event ClaimPaid(address indexed policyHolder, uint indexed claimId);

    // Circuit breaker events
    event ContractStopped();
    event ContractRestarted();

    // Policy fund and withdrawal events
    event ReceivedFunds(address indexed funder, uint amount);
    event WithdrawFundsEvent(uint amount);

    // Oraclize base events
    event NewOraclizeQuery(string description);
    event NewTimeMeasure(string time);

    // Emergency Stop Modifiers
    modifier stopInEmergency { require(!stopped, "stopInEmergency"); _; }   // Not allowed when stopped
    modifier onlyInEmergency { require(stopped, "onlyInEmergency"); _; }    // Only allowed when stopped

    // Restrict Access Modifiers
    // Only allowed for Policy Manger
    modifier onlyPolicyManager { require(msg.sender == policyManager, "onlyPolicyManager"); _; }
    // Only allowed for a policy owner
    modifier onlyValidPolicyHolder { require(policyHolders[msg.sender].endDate > 0, "onlyValidPolicyHolder"); _; }

    // Only allowed when policy hasn't been purchased or is expired.
    modifier notValidPolicyHolder {
        require(
            policyHolders[msg.sender].endDate == 0 || now > policyHolders[msg.sender].endDate,
            "notValidPolicyHolder"
        );
        _;
    }

    // Claim Modifiers
    // Only allowed for open claim.
    modifier claimOpen(uint _claimId) {require(claims[_claimId].status == Status.Open, "claimOpen"); _;}
    // Only allow claims lower than max claim for policy.
    modifier validClaim(uint _amount) {require(_amount < maxClaim, "validClaim"); _;}
    // Verify claim exist before taking action.
    modifier claimExist(uint _claimId) {require(claims[_claimId].policyHolder != address(0), "claimExist"); _;}

    // Verify the policy has the funds to cover payment before approving or collecting claim.
    modifier fundsAvailable (uint _claimId) {
        require(
            claims[_claimId].amount <= address(this).balance,
            "fundsAvailable"
        );
        _;
    }

    // Policy Purchase Modifiers
    // Verify enough has been paid to purchase the policy.
    modifier paidEnough() { require(msg.value >= price, "paidEnough"); _;}

    // Refund any extra value sent during purchase.
    modifier checkValue() {
        _;
        uint amountToRefund = msg.value - price;
        msg.sender.transfer(amountToRefund);
    }

    /** @dev Constructor to set up policy.
      * @param _name Name of the policy.
      * @param _price Price of the policy.
      * @param _coveragePeriod The coverage period of the policy.
      * @param _maxClaim The max claim of the policy.
      * @param _coverageTerms The coverage terms as a string of the policy.
      * @param _coverageTermsHash The hash of an ipfs file with the terms of the policy.
      * @param _policyManager The policy manager address of the policy.
      */
    constructor(
        string _name,
        uint _price,
        uint _coveragePeriod,
        uint _maxClaim,
        string _coverageTerms,
        string _coverageTermsHash,
        address _policyManager
    )
        public
        payable
    {
        require(_price > 0, "Policy price must be greater than 0"); // Revert is price is 0 or less.
        // Revert if coverage period is 0 or less.
        require(_coveragePeriod > 0, "Policy coverage period must be greater than 0");
        require(_maxClaim > 0, "Policy max claim must be greater than 0");  // Revert is max claim is 0 or less.
        require(_policyManager != 0, "Policy Manager is required"); // Revert if no policy manager was set.
        bytes memory nameCheck = bytes(_name);
        require(nameCheck.length > 0, "Policy name is required");   // Revert if name is not set.

        name = _name;   // Set policy name in storage.
        price = _price; // Set policy price in storage.
        coveragePeriod = _coveragePeriod;   // Set coverage period in storage.
        maxClaim = _maxClaim;   // Set the max claim in storage.
        coverageTerms = _coverageTerms; // Set the coverage terms as a string in storage.
        claimCount = 0; // Initialize the claim count to 0.
        policyManager = _policyManager; // Set the policy manage in storage.
        coverageTermsHash = _coverageTermsHash; // Set the hash of the terms stored as an ipfs file.
    }

    /** @dev Fall back function for recieving funds.
      */
    function ()
        public
        payable
    {
        emit ReceivedFunds(msg.sender, msg.value);
    }

    /** @dev Purchase policy.
      * Accepts funds, returns extra, calls oracle to get curret time.
      * Finalizes purchase in callback.
      */
    function purchasePolicy ()
        public
        payable
        stopInEmergency
        notValidPolicyHolder
        paidEnough
        checkValue
        returns(bytes32 myID)
    {
        // Submit to Oraclize to get the current time.
        emit NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        myID = oraclize_query("WolframAlpha", "Timestamp now");
        // Store the date we'll need to create the policy.
        pendingcalls[myID].octype = OCType.PolicyPurchase;  // The type used in the callback to finalize purchase.
        pendingcalls[myID].policyHolder = msg.sender;       // Store the policy holder in our mapping
        emit SubmitPolicyHolder(msg.sender);
    }

    /** @dev Create a claim.
      * @param _amount Amount of the claim.
      * @param _reason Reason for the claim.
      */
    function createClaim (uint _amount, string _reason)
        public
        validClaim(_amount)
        onlyValidPolicyHolder
        stopInEmergency
    {
        // Submit to Oraclize to get the current time.
        emit NewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        bytes32 myID = oraclize_query("WolframAlpha", "Timestamp now");
        // Save out data to create claim in the callback.
        pendingcalls[myID].octype = OCType.ClaimSubmit; // The type used in the callback to finalize the claim.
        pendingcalls[myID].reason = _reason;    // Store reason to use for the claim.
        pendingcalls[myID].amount = _amount;    // Store amount to use for the claim.
        pendingcalls[myID].policyHolder = msg.sender;   // Store the policy holder to use for the claim.
        emit ClaimSubmit(msg.sender);
    }

    /** @dev Policy Manager can approve a claim.
      * @param _claimId claim id of the claim.
      */
    function approveClaim (uint _claimId)
        public
        payable
        onlyPolicyManager
        claimExist(_claimId)
        claimOpen (_claimId)
        fundsAvailable (_claimId)
        stopInEmergency
    {
        claims[_claimId].status = Status.Approved;  // Update the status of the claim to approved.
        emit ClaimApproved(claims[_claimId].policyHolder, _claimId);
    }

    /** @dev Claim submitter can collect the claim.
      * @param _claimId claim id of the claim.
      */
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
        claims[_claimId].status = Status.Paid;  // Update the status of the claim to paid.
        // Transfer the approved claim value to the policy holder and claim submitter.
        msg.sender.transfer(claims[_claimId].amount);
        emit ClaimPaid(claims[_claimId].policyHolder, _claimId);
    }

    /** @dev Policy Manager can deny a claim.
      * @param _claimId claim id of the claim.
      */
    function denyClaim (uint _claimId)
        public
        onlyPolicyManager
        claimExist(_claimId)
        claimOpen (_claimId)
        stopInEmergency
    {
        claims[_claimId].status = Status.Denied;    // Update the claim status to denied.
        emit ClaimDenied(claims[_claimId].policyHolder, _claimId);
    }

    /** @dev Policy Manager can stop the policy.
      * Freezes certain contract functions.
      */
    function stopContract ()
        public
        onlyPolicyManager
    {
        stopped = true; // Update stored variable.
        emit ContractStopped();
    }

    /** @dev Policy Manager can restart the policy.
      * Unfreezes certain contract functions.
      */
    function restartContract ()
        public
        onlyPolicyManager
    {
        stopped = false;    // Update stopped to restart contract.
        emit ContractRestarted();
    }

    /** @dev Get the current balance of the policy.
      * @return The current balance of the policy.
      */
    function getBalance ()
        public
        view
        returns (uint256)
    {
        return address(this).balance;
    }

    /** @dev Get the claim id for a policy holders claim.
      * @param _address Address of the policy holder.
      * @param _holderClaimId Array index from holders list of claim ids.
      * @return _claimId The id of the claim.
      */
    function fetchPolicyHolderClaimId (address _address, uint _holderClaimId)
        public
        view
        returns (uint _claimId)
    {
        // The claim id to be returned.
        _claimId = policyHolders[_address].claimIds[_holderClaimId];
    }

    /** @dev Get all claim ids for a policy holder.
      * @param _address Address of the policy holder.
      * @return _claimIds An array of claim ids for the policy holder.
      */
    function fetchPolicyHolderClaimsIds (address _address)
        public
        view
        returns (uint[] _claimIds)
    {
        // The array of claim ids to return.
        _claimIds = policyHolders[_address].claimIds;
    }

    /** @dev Get all info for policy.
      * @return _name Name of the policy.
      * @return _price Price of the policy.
      * @return _coveragePeriod The coverage period of the policy.
      * @return _maxClaim The max claim of the policy.
      * @return _coverageTerms The coverage terms as a string of the policy.
      * @return _coverageTermsHash The hash of an ipfs file with the terms of the policy.
      * @return _policyManager The policy manager address of the policy.
      */
    function getPolicyInfo ()
        public
        view
        returns (
            address _policyManager,
            string _name,
            uint _price,
            uint _coveragePeriod,
            uint _maxClaim,
            string _coverageTerms,
            string _coverageTermsHash
        )
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

    /** @dev Get current block time.
      */
    function getPolicyTime ()
        public
        view
        returns (uint _now)
    {
        _now = now;
        return _now;
    }

    /** @dev Get all info for policy.
      * @param myID The id returnd from the oraclize query call.
      * @param result The result.
      */
    function __callback(bytes32 myID, string result) public {
        require(msg.sender == oraclize_cbAddress());    // Only the oraclize callback address can use this function.
        currentTime = parseInt(result); // Set the current time from the returned result.
        emit NewTimeMeasure(result);
        // Get the policy holder stored from the stored pending calss data.
        address policyHolder = pendingcalls[myID].policyHolder;
        // If we are doing a purchase.
        if (pendingcalls[myID].octype == OCType.PolicyPurchase) {
            // Set the start date to the return time.
            policyHolders[policyHolder].startDate = currentTime;
            // Set the policy instance end date based on the start and coverage period.
            policyHolders[policyHolder].endDate = SafeMath.add(currentTime, coveragePeriod);
            emit FinalizePolicyHolder(policyHolder);
        }
        // If we are doing a claim.
        if (pendingcalls[myID].octype == OCType.ClaimSubmit) {
            // Require policy not expired
            // Only a current policy holder can submit a claim.
            require(currentTime < policyHolders[policyHolder].endDate, "Claim submitted for expired policy.");
            claimCount++;   // Increment claim count to get next claim id.
            uint _claimId = claimCount; // Next claim id.
            claims[_claimId].status = Status.Open;  // Initialize new claim status.
            claims[_claimId].amount = pendingcalls[myID].amount;    // The amount of the claim.
            claims[_claimId].policyHolder = policyHolder;   // Store the policy holder who submitted the claim.
            claims[_claimId].reason = pendingcalls[myID].reason;    // Store the reason for the claim.
            // Add the claim id to the array of claim ids associated with the policy holder.
            policyHolders[policyHolder].claimIds.push(claimCount);
            emit ClaimFinalize(policyHolder, _claimId);
        }
    }

    /** @dev Policy Manager can withdraw funds from the policy.
      * @param _amount The amount to withdraw from the policy.
      */
    function withdrawFunds (uint _amount)
        public
        payable
        onlyPolicyManager
    {
        // Require withdraw amount is greater than 0.
        require(_amount >= 0, "Withdraw amount less than zero.");
        // Require there are enough funds in the policy to cover withdrawal amount.
        require(
            _amount <= address(this).balance,
            "funds available to withdraw"
        );
        msg.sender.transfer(_amount);
        emit WithdrawFundsEvent(_amount);
    }
}
