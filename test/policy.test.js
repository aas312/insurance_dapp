const { addDaysOnEVM, assertRevert } = require('truffle-js-test-helper')

var Policy = artifacts.require('Policy')
var policyAddress

contract('Policy', function(accounts) {

    const owner = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]
    const paul = accounts[3]

    let address
    let policyAddress
    const name = "Policy Name";
    const price = 10
    const maxClaim = 500
    const coveragePeriod = 3600
    const coverageTerms = "The terms of the policy."
    const coverageTermsHash = "Qmcw6Gr3F3ZeFo8FQqk9VvNmAiXwjtPoLGjSCHASPn4qeT"
    const balance = 1000000000000000000
    const claim1Amount = 200
    const claim1Reason = "Reason1"
    const claim2Amount = 300
    const claim2Reason = "Reason2"
    const claim3Amount = 400
    const claim3Reason = "Reason3"

    // Need to deploy policy ourselves to pass constructor parameters.
    before(async function () {
      policy = await Policy.new(name, price, coveragePeriod, maxClaim, coverageTerms, coverageTermsHash, alice, {value: balance});
      policyAddress = policy.address
    });

    it("should have correct constructor values", async() => {
      const policy = await Policy.at(policyAddress);

      const policyPrice = await policy.price.call()
      const policyCoveragePeriod = await policy.coveragePeriod.call()
      const policyMaxClaim = await policy.maxClaim.call()
      const policyCoverageTerms = await policy.coverageTerms.call()
      const policyManager = await policy.policyManager.call()
      const policyBalance = await policy.getBalance.call()

      assert.equal(policyPrice.toString(10), price, 'the price of the deployed policy does not match the expected value')
      assert.equal(policyCoveragePeriod.toString(10), coveragePeriod, 'the coverage period of the deployed policy does not match the expected value')
      assert.equal(policyMaxClaim.toString(10), maxClaim, 'the max claim of the deployed policy does not match the expected value')
      assert.equal(policyCoverageTerms, coverageTerms, 'the price of the deployed policy does not match the expected value')
      assert.equal(policyManager, alice, 'the policy manager of the deployed policy does not match the expected value')
      assert.equal(policyBalance.toString(10), balance, 'the balance of the added policy does not match the expected value')
    })

    it("should add a policy holder", async() => {
        const policy = await Policy.at(policyAddress);

        let eventEmitted = false
        let bobAddress

        const FinalizePolicyHolder = policy.FinalizePolicyHolder()
        var result
        // create promise so Mocha waits for value to be returned
        let checkForPolicy = new Promise((resolve, reject) => {
          // watch for our FinalizePolicyHolder event
          FinalizePolicyHolder.watch(async function(error, result) {
            if (error) {
              reject(error)
            }
            // Get the policy we just created.
            result = await policy.policyHolders.call(bob)
            // stop watching event and resolve promise
            FinalizePolicyHolder.stopWatching()
            eventEmitted = true
            resolve(result)
          })
        })

        var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber()
        var policyBalanceBefore = await web3.eth.getBalance(policyAddress).toNumber()

        await policy.purchasePolicy({from: bob, value: 50})
        // call promise and wait for result
        result = await checkForPolicy

        var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber()
        var policyBalanceAfter = await web3.eth.getBalance(policyAddress).toNumber()

        assert.equal(policyBalanceAfter, policyBalanceBefore + parseInt(price, 10), 'The policies balance should be increased by the price of the policy')
        assert.isBelow(bobBalanceAfter, bobBalanceBefore - price, 'bob\'s balance should be reduced by more than the price of the item (including gas costs)')
        assert.equal((parseInt(result[0].toString(10), 10) + coveragePeriod).toString(10), result[1].toString(10), 'The policies end date should equal the start date plus the coverage period')
        assert.equal(eventEmitted, true, 'adding a policy holder should emit a FinalizePolicyHolder event')
    })



    it("should add a claim", async() => {
        const policy = await Policy.at(policyAddress);

        let eventEmitted = false
        let bobAddress
        let claimId

        const ClaimFinalize = policy.ClaimFinalize()
        // create promise so Mocha waits for value to be returned
        let checkForClaim = new Promise((resolve, reject) => {
          // watch for our FinalizePolicyHolder event
          ClaimFinalize.watch(async function(error, result) {
            if (error) {
              reject(error)
            }
            // Get logged data.
            bobAddress = result.args.policyHolder
            claimId = result.args.claimId.toString(10)
            ClaimFinalize.stopWatching()
            eventEmitted = true
            resolve(result)
          })
        })

        await policy.createClaim(claim1Amount, claim1Reason, {from: bob})
        await checkForClaim
        const claimsResult = await policy.claims.call(claimId)

        const policyHolderResult = await policy.policyHolders.call(bobAddress)
        const policyHolderClaimId = await policy.fetchPolicyHolderClaimId.call(bobAddress, 0)
        const claimCount = await policy.claimCount.call()
        const policyHolderClaimIds = await policy.fetchPolicyHolderClaimsIds.call(bobAddress)

        assert.equal(eventEmitted, true, 'adding a claim should emit a ClaimSubmit event')
        assert.equal(claimsResult[0].toString(10), 0, 'the claim status of the submitted claim does not match the expected value')
        assert.equal(claimsResult[1].toString(10), claim1Amount, 'the claim amount of the submitted claim does not match the expected value')
        assert.equal(claimsResult[2], bob, 'the claim address of the submitted claim does not match the expected value')
        assert.equal(claimsResult[3].toString(10), claim1Reason, 'the claim status of the submitted claim does not match the expected value')
        assert.equal(policyHolderClaimId.toString(10), claimId, 'the holder claim id of the submitted claim does not match the expected value')
        assert.equal(claimCount.toString(10), 1, 'the claim count does not match the expected value')

    })

    it("should deny a claim", async() => {
        const policy = await Policy.at(policyAddress);

        let eventEmitted = false
        let bobAddress
        let claimId

        const ClaimFinalize = policy.ClaimFinalize()
        // create promise so Mocha waits for value to be returned
        let checkForClaim = new Promise((resolve, reject) => {
          // watch for our FinalizePolicyHolder event
          ClaimFinalize.watch(async function(error, result) {
            if (error) {
              reject(error)
            }
            // Get logged data.
            bobAddress = result.args.policyHolder
            claimId = result.args.claimId.toString(10)

            ClaimFinalize.stopWatching()
            eventEmitted = true
            resolve(result)
          })
        })

        await policy.createClaim(claim1Amount, claim1Reason, {from: bob})
        await checkForClaim
        const claimsResult = await policy.claims.call(claimId)

        const policyHolderResult = await policy.policyHolders.call(bobAddress)

        const policyHolderClaimIds = await policy.fetchPolicyHolderClaimsIds.call(bobAddress)

        assert.equal(eventEmitted, true, 'adding a claim should emit a ClaimSubmit event')
        assert.equal(claimsResult[0].toString(10), 0, 'the claim status of the submitted claim does not match the expected value')
        assert.equal(claimsResult[1].toString(10), claim1Amount, 'the claim amount of the submitted claim does not match the expected value')
        assert.equal(claimsResult[2], bob, 'the claim address of the submitted claim does not match the expected value')
        assert.equal(claimsResult[3].toString(10), claim1Reason, 'the claim status of the submitted claim does not match the expected value')

        await policy.denyClaim(claimId, {from: alice})
        const claimsDeniedResult = await policy.claims.call(claimId)
        assert.equal(claimsDeniedResult[0].toString(10), 2, 'the claim denied status of the submitted claim does not match the expected value')
    })

    it("should approve a claim", async() => {
        const policy = await Policy.at(policyAddress);

        let eventEmitted = false
        let bobAddress
        let claimId

        const ClaimFinalize = policy.ClaimFinalize()
        // create promise so Mocha waits for value to be returned
        let checkForClaim = new Promise((resolve, reject) => {
          // watch for our FinalizePolicyHolder event
          ClaimFinalize.watch(async function(error, result) {
            if (error) {
              reject(error)
            }
            // Get logged data.
            bobAddress = result.args.policyHolder
            claimId = result.args.claimId.toString(10)
            ClaimFinalize.stopWatching()
            eventEmitted = true
            resolve(result)
          })
        })

        await policy.createClaim(claim1Amount, claim1Reason, {from: bob})
        await checkForClaim
        const claimsResult = await policy.claims.call(claimId)

        const policyHolderResult = await policy.policyHolders.call(bobAddress)

        const policyHolderClaimIds = await policy.fetchPolicyHolderClaimsIds.call(bobAddress)

        assert.equal(eventEmitted, true, 'adding a claim should emit a ClaimSubmit event')
        assert.equal(claimsResult[0].toString(10), 0, 'the claim status of the submitted claim does not match the expected value')
        assert.equal(claimsResult[1].toString(10), claim1Amount, 'the claim amount of the submitted claim does not match the expected value')
        assert.equal(claimsResult[2], bob, 'the claim address of the submitted claim does not match the expected value')
        assert.equal(claimsResult[3].toString(10), claim1Reason, 'the claim status of the submitted claim does not match the expected value')

        await policy.approveClaim(claimId, {from: alice})
        const claimsApprovedResult = await policy.claims.call(claimId)

        assert.equal(claimsApprovedResult[0].toString(10), 1, 'the claim approved status of the submitted claim does not match the expected value')
    })

    it("should collect a claim", async() => {
        const policy = await Policy.at(policyAddress);

        let eventEmitted = false
        let bobAddress
        let claimId

        const ClaimFinalize = policy.ClaimFinalize()
        // create promise so Mocha waits for value to be returned
        let checkForClaim = new Promise((resolve, reject) => {
          // watch for our FinalizePolicyHolder event
          ClaimFinalize.watch(async function(error, result) {
            if (error) {
              reject(error)
            }
            // Get logged data.
            bobAddress = result.args.policyHolder
            claimId = result.args.claimId.toString(10)

            ClaimFinalize.stopWatching()
            eventEmitted = true
            resolve(result)
          })
        })

        await policy.createClaim(claim1Amount, claim1Reason, {from: bob})
        await checkForClaim
        const claimsResult = await policy.claims.call(claimId)

        const policyHolderResult = await policy.policyHolders.call(bobAddress)

        const policyHolderClaimIds = await policy.fetchPolicyHolderClaimsIds.call(bobAddress)

        assert.equal(eventEmitted, true, 'adding a claim should emit a ClaimSubmit event')
        assert.equal(claimsResult[0].toString(10), 0, 'the claim status of the submitted claim does not match the expected value')
        assert.equal(claimsResult[1].toString(10), claim1Amount, 'the claim amount of the submitted claim does not match the expected value')
        assert.equal(claimsResult[2], bob, 'the claim address of the submitted claim does not match the expected value')
        assert.equal(claimsResult[3].toString(10), claim1Reason, 'the claim status of the submitted claim does not match the expected value')

        await policy.approveClaim(claimId, {from: alice})
        const claimsApprovedResult = await policy.claims.call(claimId)

        assert.equal(claimsApprovedResult[0].toString(10), 1, 'the claim approved status of the submitted claim does not match the expected value')

        var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber()
        var policyBalanceBefore = await web3.eth.getBalance(policyAddress).toNumber()

        await policy.collectClaim(claimId, {from: bob})
        const claimsCollectedResult = await policy.claims.call(claimId)

        var policyBalanceAfter = await web3.eth.getBalance(policyAddress).toNumber()
        var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber()

        assert.equal(policyBalanceAfter, policyBalanceBefore - parseInt(claim2Amount, 10), 'The policies balance should be decreased by the amount of the claim')
        assert.isBelow(bobBalanceAfter, bobBalanceBefore + claim2Amount, 'bob\'s balance should be increased by just over the amount of the claim (including gas costs)')
        assert.equal(claimsCollectedResult[0].toString(10), 3, 'the claim collected status of the submitted claim does not match the expected value')
    })

    it("should accept funds", async () => {
      const policy = await Policy.at(policyAddress);

      let eventEmitted = false
      let toFund = 5000

        const ReceivedFunds = policy.ReceivedFunds()
        // create promise so Mocha waits for value to be returned
        let checkForFunds = new Promise((resolve, reject) => {
          // watch for our FinalizePolicyHolder event
          ReceivedFunds.watch(async function(error, result) {
            if (error) {
              reject(error)
            }
            ReceivedFunds.stopWatching()
            eventEmitted = true
            resolve(result)
          })
        })

      var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber()
      var policyBalanceBefore = await web3.eth.getBalance(policyAddress).toNumber()

      await policy.sendTransaction({from: bob, value: toFund})
      await checkForFunds
      var policyBalanceAfter = await web3.eth.getBalance(policyAddress).toNumber()
      var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber()

      assert.equal(eventEmitted, true, 'adding funds should emit a ReceivedFunds event')
      assert.equal(policyBalanceAfter, policyBalanceBefore + parseInt(toFund, 10), 'The policies balance should be increased by the amount funded')
      assert.isBelow(bobBalanceAfter, bobBalanceBefore - toFund, 'bob\'s balance should be reduced by more than the amount of the item (including gas costs)')
    });
});
