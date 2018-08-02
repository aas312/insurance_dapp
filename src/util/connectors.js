import { Connect, SimpleSigner } from 'uport-connect'

//export let uport = new Connect('TruffleBox')


export let uport = new Connect('Insurance Dapp', {
  clientId: '2onbVUNbw8aSU46PWjmMnqLNR9PXeKjEXuB',
  network: 'rinkeby',
  signer: SimpleSigner('abd27519a1398381a060ac578243e415e5e2f56dfa5a3b300232a389b63059d7')
})

export const web3 = uport.getWeb3()
