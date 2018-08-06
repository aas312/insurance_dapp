import PolicyManager from './../build/contracts/PolicyManager.json'
import Registry from './../build/contracts/Registry.json'

const drizzleOptions = {
  web3: {
    block: false,
    fallback: {
      type: 'ws',
      url: 'ws://127.0.0.1:8545'
    }
  },
  contracts: [
    PolicyManager,
    Registry
  ],
  events: {
    PolicyManager: ['AddPolicy']
  },
  polls: {
    accounts: 1500
  }
}

export default drizzleOptions
