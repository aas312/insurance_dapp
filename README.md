### Description
An online insurance marketplace on the blockchain.

There are a list of insurance policies that a user can purchase and receive coverage for a period of time.  During their coverage period they may submit claims which can be approved and collected or denied.

An admin manages the marketplace adding policy managers.  A policy manager can create new policies and manage any claims against them.  A user may purchase a policy using ether to become a policy holder and submit claims.

### User Stories

An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them admin only function of adding new policy managers.

A policy manager opens the web app.  The web app reads the address and identifies that they are a policy manager.  The policy manager may create a new policy: setting a policy name, the price to purchase the policy, the maximum claim amount that can be submitted, the coverage period for the policy, the terms of the policy and optionally upload a file to ipfs to represent the terms of the policy.  The policy manager can manage any claims against own of their policies, either approving or denying it.

A policy holder opens the web app.  The web app reads the address and identifies that the user is a policy holder.  The policy holder may submit a claim against any policies that they own.  The policy holder can collect any claims against any previously submitted claims that have been approved.

A user opens the web app.  The web app reads the address and identifies the user as having no current role.  The user may purchase a policy.

### Setup

Install truffle:
```
$ npm install -g truffle
```
Install ganache cli
```
$ npm install -g ganache-cli
```
Install oraclize ethereum bridge
```
$ npm install -g ethereum-bridge
```
Download and install the metamask extension for chrome or firefox
https://metamask.io/

Clone the repository
```
$ git clone https://github.com/jethr0j0nes/insurance_dapp.git
$ cd insurance_dapp/
```
Download dependencies
From repo root
```
$ npm install
```

### Start the application
Start local blockchain with ganache cli.
Open a new terminal.
```
$ ganache-cli -m "farm fossil million man pluck inside dial cheese skin humor nuclear pull"
```
Leave it running

Start the local oraclize ethereum bridge
Open a new terminal
```
$ ethereum-bridge -H localhost:8545 -a 9 --dev
```
Leave it running


Run truffle test
From repo root
```
$ truffle test
```

Run contract migration
From repo root
```
$ truffle migrate
```

Open a browser window.
Log out of Metamask.
Select "Restore from seed phrase"
Enter the seed phrase used to start the ganache local blockchain
```
farm fossil million man pluck inside dial cheese skin humor nuclear pull
```
Create a password

Select the accounts button and "Create Account" until there is a total of at least 3 accounts.
The account addresses should match the accounts listed when ganache-cli was started:
Available Accounts
==================
(0) 0xece650266409a2348c1d65e0423d55228ec03e57
(1) 0x92531fe27d14a8812ccdde7721cd4766a28529dc
(2) 0xb63e8485429b3c8c3f9538fadb9f97eac05d9203
(3) 0x874200485d6b7df82c492f09302f1d307b63cb7d
(4) 0xced87daaf3c70c9aeffb23ac13e01333bd3938da
(5) 0x2ebc78e0b9b5b51ea4cad2e33c1f744ec59a99ef
(6) 0x3bec711afd64fad258545a1d4f099737bd58d7e7
(7) 0x6e868b5729f0d0878a264f6f520206c75ecb2cbf
(8) 0x77fb29842cf42c625bf6026ba5b2e1aa43d5b2e0
(9) 0x8225581895c67b689eb384e7359cad6c35ad4b8c

Private Keys
==================
(0) 64ee33717699488e480a1da7361286dc466774b76f47533ce96a1ddd6aadec46
(1) c487fef68581afe330474b4bb79acc6ac31818ec5fc2838dd15da591e6ac8e24
(2) 48bb5030b4843b51cc9e1bf977cc1c6d865082bd372b98f04abe4f9f4b1cbc52
(3) 92e7f1c6d72daf5c6bbe7aa7414b1c53f09a87ff9a2081c6e37d68a47f39a696
(4) e61b24937d59a919b8b23151196f7d63f02559f7746298f6777b22294e710923
(5) db2c33ced583315fc0b6230a36f9b80fa4dbebfd74485c916161e02b0181d298
(6) 2fdb8d91421920752c5e15737d418be4508881f48f8479f3d0471562f04884d7
(7) 6fa07da7ef6ca939076ad9f26aa62fc51b177652d9018757fff941c1202f6e72
(8) c2d2b87c118e4cda25a537f95536a32f53b6395fc73441b8877b0890df525c96
(9) c20d12fe4bc426165a5072d74650ff780cb68e2798a6a5d82df5b70c4a7a3ec3

Open a new terminal window
From the repo root run
```
$ npm start
```

This should start the application on http://localhost:3000/
You can visit it in the browser if it didn't open on it's own.
