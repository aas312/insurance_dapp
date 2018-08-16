const { addDaysOnEVM, assertRevert } = require('truffle-js-test-helper')


let Registry = artifacts.require('Registry')

contract('Registry', function(accounts) {

    const owner = accounts[0]
    const alice = accounts[1]
    const bob = accounts[2]
    const paul = accounts[3]

    const address1 = '0x1dc9dcc39478add1ccbd039a4cf907c6888b53e4'
    const address2 = '0xe57cb7451cee7033703dd002b10e56ab2c2e320e'

    it("should reject non owner updating backends.", async () => {
      const registry = await Registry.deployed()
      await assertRevert(
        registry.changeBackend(address1, {from: paul})
      );
    });

    it("should set a backend", async() => {
        const registry = await Registry.deployed()

        await registry.changeBackend(address1, {from: owner})
        const result = await registry.getBackendContract.call()

        assert.equal(result, address1, 'The backend should match the expected value')
    })

    it("should get a backend", async() => {
        const registry = await Registry.deployed()

        const result = await registry.getBackendContract.call()

        assert.equal(result, address1, 'The backend should match the expected value')
    })

    it("should update a backend", async() => {
        const registry = await Registry.deployed()

        await registry.changeBackend(address2, {from: owner})
        const result = await registry.getBackendContract.call()

        assert.equal(result, address2, 'The backend should match the expected value')
    })

    it("should get a list of previous backends", async() => {
        const registry = await Registry.deployed()

        const result = await registry.getPreviousBackends.call()
        assert.equal(result[2], address1, 'The backend should be in the previous value list')
    })
});
