const { addDaysOnEVM, assertRevert } = require('truffle-js-test-helper')


let PolicyManager = artifacts.require('PolicyManager')
let Policy = artifacts.require('Policy')

contract('PolicyManager', function(accounts) {

  const owner = accounts[0]
  const alice = accounts[1]
  const bob = accounts[2]
  const paul = accounts[3]

  const price = 10
  const maxClaim = 500
  const coveragePeriod = 3600
  const coverageTerms = "The terms of the policy."
  const name = "Policy Name"
  const coverageTermsHash = "Qmcw6Gr3F3ZeFo8FQqk9VvNmAiXwjtPoLGjSCHASPn4qeT"
  const balance = 1000000000000000000

  it("should add a policy manager", async() => {
    const policyManager = await PolicyManager.deployed()
    let address

    let eventEmitted = false

    let event = policyManager.AddPolicyManagerEvent()
    await event.watch((err, res) => {
        address = res.args.policyManager
        eventEmitted = true
    })

    await policyManager.addPolicyManager(alice, {from: owner})
    const result = await policyManager.policyManagers.call(address)

    assert.equal(result, true, 'the policy manager address added is not set to true in policyManagers')
    assert.equal(eventEmitted, true, 'adding a policy manager should emit a AddPolicyManagerEvent event')
  })

  it("should add a policy", async() => {
    const policyManager = await PolicyManager.deployed()

    let eventEmitted = false

    let event = policyManager.AddPolicy()
    await event.watch((err, res) => {
        address = res.args.policy
        eventEmitted = true
    })

    await policyManager.createPolicy(name, price, coveragePeriod, maxClaim, coverageTerms, coverageTermsHash, {from: alice, value: balance})

    const allPoliciesAddress = await policyManager.allPolicies.call(0)
    const policiesByManagerAddress = await policyManager.policiesByManager.call(alice, 0)

    const policy = await Policy.at(address);
    const policyPrice = await policy.price.call()
    const policyCoveragePeriod = await policy.coveragePeriod.call()
    const policyMaxClaim = await policy.maxClaim.call()
    const policyCoverageTerms = await policy.coverageTerms.call()
    const policyBalance = await policy.getBalance.call()

    assert.equal(address, allPoliciesAddress, 'the name of the last added item does not match the expected value')
    assert.equal(address, policiesByManagerAddress, 'the name of the last added item does not match the expected value')
    assert.equal(policyPrice.toString(10), price, 'the price of the added policy does not match the expected value')
    assert.equal(policyCoveragePeriod.toString(10), coveragePeriod, 'the coverage period of the added policy does not match the expected value')
    assert.equal(policyMaxClaim.toString(10), maxClaim, 'the max claim of the added policy does not match the expected value')
    assert.equal(policyCoverageTerms, coverageTerms, 'the price of the added policy does not match the expected value')
    assert.equal(policyBalance.toString(10), balance, 'the balance of the added policy does not match the expected value')
    assert.equal(eventEmitted, true, 'adding a policy should emit a AddPolicy event')

})

  it("should stop the contract", async() => {
    const policyManager = await PolicyManager.deployed()

    let eventEmitted = false

    let event = policyManager.ContractStopped()
    await event.watch((err, res) => {
        eventEmitted = true
    })

    await policyManager.stopContract({from: owner})

    const result = await policyManager.stopped.call()

    assert.equal(result, true, 'the value of stopped does not match the expected value')
    assert.equal(eventEmitted, true, 'stoppiing a contract should emit a ContractStopped event')
  })

  it("should restart the contract", async() => {
    const policyManager = await PolicyManager.deployed()

    let eventEmitted = false

    let event = policyManager.ContractRestarted()
    await event.watch((err, res) => {
        eventEmitted = true
    })

    await policyManager.restartContract({from: owner})

    const result = await policyManager.stopped.call()

    assert.equal(result, false, 'the value of stopped does not match the expected value')
    assert.equal(eventEmitted, true, 'restarting a contract should emit a ContractRestarted event')
  })

  it("should reject non admins adding policy managers.", async () => {
    const policyManager = await PolicyManager.deployed()
    await assertRevert(
      policyManager.addPolicyManager(paul, { from: bob})
    );
  });

  it("should reject non policy managers adding policies.", async () => {
    const policyManager = await PolicyManager.deployed()
    await assertRevert(
      policyManager.createPolicy(name, price, coveragePeriod, maxClaim, coverageTerms, coverageTermsHash, {from: paul})
    );
  });
});
