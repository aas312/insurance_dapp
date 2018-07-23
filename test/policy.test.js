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
    const price = 10
    const maxClaim = 500
    const coveragePeriod = 3600
    const coverageTerms = "The terms of the policy."
    const claim1Amount = 200
    const claim1Reason = "Reason1"
    const claim2Amount = 300
    const claim2Reason = "Reason2"
    const claim3Amount = 400
    const claim3Reason = "Reason3"

    // Need to deploy policy ourselves to pass constructor parameters.
    before(async function () {
      policy = await Policy.new(price, coveragePeriod, maxClaim, coverageTerms, alice);
      policyAddress = policy.address
    });

    it("should have correct constructor values", async() => {
      const policy = await Policy.at(policyAddress);

      const policyPrice = await policy.price.call()
      const policyCoveragePeriod = await policy.coveragePeriod.call()
      const policyMaxClaim = await policy.maxClaim.call()
      const policyCoverageTerms = await policy.coverageTerms.call()
      const policyManager = await policy.policyManager.call()

      assert.equal(policyPrice.toString(10), price, 'the price of the deployed policy does not match the expected value')
      assert.equal(policyCoveragePeriod.toString(10), coveragePeriod, 'the coverage period of the deployed policy does not match the expected value')
      assert.equal(policyMaxClaim.toString(10), maxClaim, 'the max claim of the deployed policy does not match the expected value')
      assert.equal(policyCoverageTerms, coverageTerms, 'the price of the deployed policy does not match the expected value')
      assert.equal(policyManager, alice, 'the policy manager of the deployed policy does not match the expected value')
    })

    it("should add a policy holder", async() => {
        const policy = await Policy.at(policyAddress);

        let eventEmitted = false
        let bobAddress

        let event = policy.AddPolicyHolder()
        await event.watch((err, res) => {
            bobAddress = res.args.policyHolder.toString(10)
            eventEmitted = true
            console.log(bobAddress)
            console.log(eventEmitted)
            if (err) {
            console.log(err)        
            } else {
            console.log(result)
            }
          //  event.stopWatching() // WITHOUT THIS, EXECUTION NEVER ENDS
        })

        var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber()
        var policyBalanceBefore = await web3.eth.getBalance(policyAddress).toNumber()

        await policy.purchasePolicy({from: bob, value: 50})

            console.log(bobAddress)
            console.log(eventEmitted)

        var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber()
        var policyBalanceAfter = await web3.eth.getBalance(policyAddress).toNumber()

event.get((error, logs) => {
      console.log(logs)      
    })   
//event.stopWatching() // WITHOUT THIS, EXECUTION NEVER ENDS
        const result = await policy.policyHolders.call(bob)

        assert.equal(policyBalanceAfter, policyBalanceBefore + parseInt(price, 10), 'The policies balance should be increased by the price of the policy')
        assert.isBelow(bobBalanceAfter, bobBalanceBefore - price, 'bob\'s balance should be reduced by more than the price of the item (including gas costs)')
        assert.equal((parseInt(result[0].toString(10), 10) + coveragePeriod).toString(10), result[1].toString(10), 'The policies end date should equal the start date plus the coverage period')
        assert.equal(eventEmitted, true, 'adding a policy holder should emit a AddPolicyHolder event')
    })

    it("should add a claim", async() => {
        const policy = await Policy.at(policyAddress);

        let eventEmitted = false
        let bobAddress
        let claimId

        let event = policy.ClaimSubmit()
        await event.watch((err, res) => {
            bobAddress = res.args.policyHolder.toString(10)
            claimId = res.args.claimId.toString(10)
            eventEmitted = true
        })

        await policy.createClaim(claim1Amount, claim1Reason, {from: bob})

        const claimsResult = await policy.claims.call(claimId)
        const policyHolderResult = await policy.policyHolders.call(bobAddress)
        const policyHolderClaimId = await policy.fetchPolicyHolderClaimId.call(bobAddress, 1)
        const claimCount = await policy.claimCount.call()

 
        assert.equal(eventEmitted, true, 'adding a claim should emit a ClaimSubmit event')
        assert.equal(claimsResult[0].toString(10), 0, 'the claim status of the submitted claim does not match the expected value')
        assert.equal(claimsResult[1].toString(10), claim1Amount, 'the claim amount of the submitted claim does not match the expected value')
        assert.equal(claimsResult[2], bob, 'the claim address of the submitted claim does not match the expected value')
        assert.equal(claimsResult[3].toString(10), claim1Reason, 'the claim status of the submitted claim does not match the expected value')
        assert.equal(policyHolderClaimId.toString(10), claimId, 'the holder claim id of the submitted claim does not match the expected value')
        assert.equal(claimCount.toString(10), 1, 'the claim count does not match the expected value')
    })

    it("should accept funds", async () => {
      const policy = await Policy.at(policyAddress);

      let eventEmitted = false
      let toFund = 5000

      let event = policy.ReceivedFunds()
      await event.watch((err, res) => {
          eventEmitted = true
      })

      var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber()
      var policyBalanceBefore = await web3.eth.getBalance(policyAddress).toNumber()

      await policy.sendTransaction({from: bob, value: toFund})

      var policyBalanceAfter = await web3.eth.getBalance(policyAddress).toNumber()
      var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber()

      assert.equal(eventEmitted, true, 'adding funds should emit a ReceivedFunds event')
      assert.equal(policyBalanceAfter, policyBalanceBefore + parseInt(toFund, 10), 'The policies balance should be increased by the amount funded')
      assert.isBelow(bobBalanceAfter, bobBalanceBefore - toFund, 'bob\'s balance should be reduced by more than the amount of the item (including gas costs)')
    });


    it("should pay a claim", async() => {
        const policy = await Policy.at(policyAddress);

        let eventEmitted = false
        let bobAddress
        let claimId

        let event = policy.ClaimSubmit()
        await event.watch((err, res) => {
            bobAddress = res.args.policyHolder.toString(10)
            claimId = res.args.claimId.toString(10)
        })

        let event1 = policy.ClaimPaid()
        await event1.watch((err, res) => {
            bobPaidAddress = res.args.policyHolder.toString(10)
            claimPaidId = res.args.claimId.toString(10)
            eventEmitted = true
        })

        // bob creates a claim.
      await policy.createClaim(claim2Amount, claim2Reason, {from: bob})

      var bobBalanceBefore = await web3.eth.getBalance(bob).toNumber()
      var policyBalanceBefore = await web3.eth.getBalance(policyAddress).toNumber()

      await policy.payClaim(claimId, {from: alice})

      var policyBalanceAfter = await web3.eth.getBalance(policyAddress).toNumber()
      var bobBalanceAfter = await web3.eth.getBalance(bob).toNumber()

      console.log(bobBalanceBefore)
      console.log(policyBalanceBefore)
      console.log(bobBalanceAfter)
      console.log(policyBalanceAfter)

      console.log(claimId)
      console.log(claimPaidId)

        const claimsResult = await policy.claims.call(claimId)
        const policyHolderResult = await policy.policyHolders.call(bobAddress)
        const policyHolderClaimId = await policy.fetchPolicyHolderClaimId.call(bobAddress, 2)
        const claimCount = await policy.claimCount.call()
        
        console.log(claimsResult)
        console.log(policyHolderResult)
        console.log(policyHolderClaimId)
        console.log(claimCount)

        console.log(bobAddress)
        console.log(bobPaidAddress)
        console.log(bob)


        assert.equal(claimsResult[0].toString(10), 1, 'the claim status of the paid claim does not match the expected value')
        assert.equal(claimsResult[1].toString(10), claim2Amount, 'the claim amount of the submitted claim does not match the expected value')
        assert.equal(claimsResult[2], bob, 'the claim address of the submitted claim does not match the expected value')
        assert.equal(claimsResult[3].toString(10), claim2Reason, 'the claim status of the submitted claim does not match the expected value')
        assert.equal(policyHolderClaimId.toString(10), claimId, 'the holder claim id of the submitted claim does not match the expected value')
        assert.equal(claimCount.toString(10), 2, 'the claim count does not match the expected value')        

        assert.equal(policyBalanceAfter, policyBalanceBefore - parseInt(claim2Amount, 10), 'The policies balance should be decreased by the amount of the claim')
        assert.isBelow(bobBalanceAfter, bobBalanceBefore + claim2Amount, 'bob\'s balance should be increased by just over the amount of the claim (including gas costs)')
        assert.equal(claimId.toString(10), claimPaidId.toString(10), 'the claim paid id should match the id of the claim submitted')        

    })
    
});
