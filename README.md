* [Description](#description)
* [User Stories](#user-stories)
* [Setup](#setup)
* [Start the application](#start-the-application)
* [Login to the application](#login-to-the-application)
* [Owner Features](#owner-features)
  * [Emergency Stop](#emergency-stop)
  * [Add a policy manager](#add-a-policy-manager)
* [Policy Manager Features](#policy-manager-features)
  * [Add a policy](#add-a-policy)
  * [Approve/Deny a claim](#approvedeny-a-claim)
* [User Features](#user-features)
  * [Purchase a policy](#purchase-a-policy)
  * [Submit a claim](#submit-a-claim)
  * [Collect a claim](#collect-a-claim)
* [Testing](#testing)
  * [Explanation of test](#explanation-of-test)
* [Design Pattern Requirements](#design-pattern-requirements)
* [Security considerations](#security-considerations)
* [Library Contract](#library-contract)
* [Additional Requirements](#additional-requirements)
* [Stretch Goals](#stretch-goals)
  * [Project uses IPFS](#project-uses-ipfs)
  * [Project uses uPort](#project-uses-uport)
  * [Project uses the Ethereum Name Service](#project-uses-the-ethereum-name-service)
  * [Project uses an Oracle](#project-uses-an-oracle)
  * [Project uses an upgradable pattern](#project-uses-an-upgradable-pattern)
  * [Testnet Deployment](#testnet-deployment)

### Description
An online insurance marketplace on the blockchain.

There are a list of insurance policies that a user can purchase and receive coverage for a period of time.  During their coverage period they may submit claims which can be approved and collected or denied.

An admin manages the marketplace adding policy managers.  A policy manager can create new policies and manage any claims against them.  A user may purchase a policy using ether to become a policy holder and submit claims.

### User Stories

An administrator opens the web app. The web app reads the address and identifies that the user is an admin, showing them the admin only function of adding new policy managers.

A policy manager opens the web app.  The web app reads the address and identifies that they are a policy manager.  The policy manager may create a new policy which requires: a policy name, the price to purchase the policy, the maximum claim amount that can be submitted, the coverage period for the policy, the terms of the policy and optionally upload a file to IPFS to represent the terms of the policy.  The policy manager can manage any claim against any of their policies, either approving or denying it.

A policy holder opens the web app.  The web app reads the address and identifies that the user is a policy holder.  The policy holder may submit a claim against any policies that they own.  The policy holder can collect any claims against any previously submitted claims that have been approved.

A user opens the web app.  The web app reads the address and identifies the user as having no current role.  The user may purchase a policy.

### Setup

Install truffle:
```
npm install -g truffle
```
Install ganache cli
```
npm install -g ganache-cli
```
Install oraclize ethereum bridge
```
npm install -g ethereum-bridge
```
Download and install the MetaMask extension for chrome or firefox
https://metamask.io/

Clone the repository
```
git clone https://github.com/jethr0j0nes/insurance_dapp.git
cd insurance_dapp/
```
Download dependencies from the repo root
```
npm install
```

### Start the application
Open a new terminal and start the local blockchain with ganache cli
```
ganache-cli -m "farm fossil million man pluck inside dial cheese skin humor nuclear pull"
```
Leave it running

Open a new terminal and start the local oraclize ethereum bridge
```
ethereum-bridge -H localhost:8545 -a 9 --dev
```
Leave it running

Run the contract migration from the repo root
```
truffle migrate
```

Open a browser window<br/>
Log out of MetaMask<br/>
Select "Restore from seed phrase"<br/>
Enter the seed phrase used to start the ganache local blockchain
```
farm fossil million man pluck inside dial cheese skin humor nuclear pull
```
Create a password

Select the accounts button and "Create Account" until there is a total of at least 3 accounts.<br/>
The account addresses should match the accounts listed when ganache-cli was started:
Available Accounts


(0) 0xece650266409a2348c1d65e0423d55228ec03e57<br/>
(1) 0x92531fe27d14a8812ccdde7721cd4766a28529dc<br/>
(2) 0xb63e8485429b3c8c3f9538fadb9f97eac05d9203<br/>
(3) 0x874200485d6b7df82c492f09302f1d307b63cb7d<br/>
(4) 0xced87daaf3c70c9aeffb23ac13e01333bd3938da<br/>
(5) 0x2ebc78e0b9b5b51ea4cad2e33c1f744ec59a99ef<br/>
(6) 0x3bec711afd64fad258545a1d4f099737bd58d7e7<br/>
(7) 0x6e868b5729f0d0878a264f6f520206c75ecb2cbf<br/>
(8) 0x77fb29842cf42c625bf6026ba5b2e1aa43d5b2e0<br/>
(9) 0x8225581895c67b689eb384e7359cad6c35ad4b8c<br/>

Private Keys

(0) 64ee33717699488e480a1da7361286dc466774b76f47533ce96a1ddd6aadec46<br/>
(1) c487fef68581afe330474b4bb79acc6ac31818ec5fc2838dd15da591e6ac8e24<br/>
(2) 48bb5030b4843b51cc9e1bf977cc1c6d865082bd372b98f04abe4f9f4b1cbc52<br/>
(3) 92e7f1c6d72daf5c6bbe7aa7414b1c53f09a87ff9a2081c6e37d68a47f39a696<br/>
(4) e61b24937d59a919b8b23151196f7d63f02559f7746298f6777b22294e710923<br/>
(5) db2c33ced583315fc0b6230a36f9b80fa4dbebfd74485c916161e02b0181d298<br/>
(6) 2fdb8d91421920752c5e15737d418be4508881f48f8479f3d0471562f04884d7<br/>
(7) 6fa07da7ef6ca939076ad9f26aa62fc51b177652d9018757fff941c1202f6e72<br/>
(8) c2d2b87c118e4cda25a537f95536a32f53b6395fc73441b8877b0890df525c96<br/>
(9) c20d12fe4bc426165a5072d74650ff780cb68e2798a6a5d82df5b70c4a7a3ec3<br/>

Open a new terminal window<br/>
From the repo root run
```
npm start
```

This should start the application on http://localhost:3000/<br/>
You can visit it in the browser if it didn't open on it's own.

### Login to the application
At this point the local ganache-cli chain should be running, the ethererum-bridge for Oraclize calls should be started, the contracts should be migrated to the local chain and the local application should be running on http://localhost:3000/

You should see "Insurance Dapp" as the title and "Login with Uport" in the upper right hand corner in the browser window.

Clicking "Login with Uport" will the give the uPort login options.

Download and set up the uPort app on your device.

On the Insurance Dapp page click "Continue with uPort."

On your device use the QR code scanner from the uPort app to scan the QR code.<br/>
Insurance Dapp should appear as requesting information.

Click "Continue" on your device.<br/>
This should complete the login in the browser dapp.

You should now see the uPort Name and Country you provided, along with the active account and balance of your current MetaMask account.

You should see the policy manager address in the registry contract.

### Owner Features
Switch to account 1 in MetaMask.  Refresh the page.

#### Emergency Stop
Account 1 may use the emergency stop to lock the contract and restart the contract to make contract functions available again.

#### Add a policy manager
To use, copy the address of another account from MetaMask (copy the address for account 2.)  Enter it in the text field, click submit and sign the transaction with MetaMask.  Wait for it to complete.  We now have a policy manager!

### Policy Manager Features
Switch to account 2 in MetaMask that was just added as policy manager.  Refresh the page.
The option to add a policy should now be available.

#### Add a policy
Name<br/>
Price in wei<br/>
Coverage Period in seconds (3600 second = 1 hour)<br/>
The maximum allowed claim for the policy<br/>
Terms text string<br/>
Optionally, either enter a hash of an IPFS file to represent the terms or use the upload field to upload a file to IPFS.  This may take some time depending on the size of the file.  When the upload is complete it should automatically populate the hash field.<br/>
Click submit and approve the transaction in MetaMask.  This should add the policy.

#### Approve/Deny a claim
Once a claim has been submitted the policy manager for the policy can approve or deny it.
Click Approve or Deny and sign the transaction in MetaMask.

### User Features
Switch to account 3 in MetaMask.  Refesh the page.

#### Purchase a policy
The policy we just added should now be available for purchase.
Click submit and sign the transaction in MetaMask.
This transaction uses an Oraclize callback to get the current timestamp off chain.  Oraclize receives the query when we submit our transaction, then uses a second transaction to call back into our contract and complete the purchase.  The timestamp received is the contract start time.

#### Submit a claim
Now that we are a policy owner we can submit any number of claims against the policy.  Claims must be submitted while the policy is active (the length of the coverage period after the start date.)
Enter an amount (lower than the max claim.).
Enter a reason for the claim.
Submit and sign.
This also uses an Oraclize call back to get a current timestamp and uses that to validate the requirement that the policy is currently valid and not expired.

#### Collect a claim
Once a claim has been approved by the policy manager the submitter of the claim may collect it.
Click collect and sign in MetaMask.
This will transfer the funds from the policy to the policy holder.

### Testing

Run truffle test from the repo root
```
truffle test
```

#### Explanation of test

Policy.sol in policy.test.js

The policy contract requires constructor values and is created in a factory fashion so we can't rely on the migration script or an existing deployed contract.  Before our test we create a new instance of the contract with correct constructor values and capture it's address to use in all test.

should accept funds:<br/>
Written to verify the ability to send funds to the contract.  Verifies correct balances for a user and the policy contract when funds are sent to the contract and event is emitted.  

should withdraw funds:<br/>
Written to verify the ability of the policy manager to withdraw funds from the contract.  Verifies correct balances after withdrawal and that event is emitted.

should stop the contract:<br/>
Written to verify the ability to use the emergency stop for the contract.  Verify the stop function, contract state is updated as expected and events are emitted.

should restart the contract:<br/>
Written to verify the ability to restart the contract after the emergency stop has been used.  Verify the restart function, contract state and emitted events.

should have correct constructor values:<br/>
Written to verify the policy is created as expected with the passed constructor values.  Test contstructor function and getter functions for public variables.

should add a policy holder:<br/>
Written to verify the ability of a user to purchase a policy.  Test the purchase policy function, Oraclize callback, the emitted event and the ability to get policy holder info.

should add a claim:<br/>
Written to verify the ability of a policy holder to submit a claim.  Test the submit claim function, Oraclize callback, the emitted event and getting the info for a submitted claim.

should deny a claim:<br/>
Written to verify the ability of the policy manager to deny a claim.  Test creates a claim from a policy holder, test the deny claim function with an emitted event and that the claim state is updated accordingly.

should approve a claim:<br/>
Written to verify the ability of the policy manager to approve a claim.  Test creates a claim from a policy holder, test the approve claim function with an emitted event and the the claim state is updated accordingly.

should collect a claim:<br/>
Written to verify the ability of a user to collect a claim they have submitted.  Test creates a claim from a policy holder, approves it by a policy manager and test the claim collect function and emitted event for the user as well as balances.

PolicyManager.sol in policy_manager.test.js

should add a policy manager:<br/>
Written to verify the ability of the factory contract owner to add a policy manager.  Test add policy manager function, emitted event and state update.

should add a policy:<br/>
Written to verify the ability of a policy manager to create a new policy.  Test the create policy function, emitted event and that the policy was created as expected.

should stop the contract:<br/>
Written to verify the ability of the contract owner to use the emergency stop.  Test stop contract function, emitted events and state updates.

should restart the contract:<br/>
Written to verify the ability of the contract owner to restart the contract.  Test the restart contract function, emitted events and state updates.

should reject non admins adding policy managers:<br/>
Written to verify modifier will throw an error if non admin/owner user tries to add a policy manager.  Will assert that an error is thrown.

should reject non policy managers adding policies:<br/>
Written to veriy that only a policy manager can add policies.  Will assert that an error is thrown.

### Design Pattern Requirements
Circuit breaker is implemented in Policy Manager and Policy contracts.  It is available in the UI of the front end app for the Policy Manager contract for the owner/admin.

Other design decisions are discussed in [design_pattern_desicions.md](design_pattern_desicions.md)

### Security considerations
Discussed in [avoiding_common_attacks.md](avoiding_common_attacks.md)

### Library Contract
The project uses the SafeMath library for safe addition in the Policy contract.
The usingOraclize base contract is used as well.

### Additional Requirements
Project contracts are commented and formatted according to the documentation.

### Stretch Goals

#### Project uses IPFS
The project is hosted and available on IPFS [https://ipfs.infura.io/ipfs/QmZhy2hpuR2653Kt3ny5vRnTt8mv4gLnFgqju7qLmCoUSL/](https://ipfs.infura.io/ipfs/QmZhy2hpuR2653Kt3ny5vRnTt8mv4gLnFgqju7qLmCoUSL/).  To view the project on IPFS you must be connected to the Rinkeby network in MetaMask since that's where the known contract addresses are in the hosted version of the app.
It also utilizes IPFS in the creation of policies.  A user may upload a file to IPFS during the policy creation process and it will be linked in the policy information.

#### Project uses uPort
The uPort mobile app is used to login to the project and uPort information is displayed from within the project.

#### Project uses the Ethereum Name Service
From within MetaMask switch to the main net since this is where ENS names are publicly available.<br/>
Go to [http://jethrojones.eth/](http://jethrojones.eth/). (Must enter the full url)<br/>
This should redirect to the app hosted at the IPFS hash above.<br/>
The dapp won't load because it is not deployed on the main net.<br/>
Switch to the Rinkeby network in MetaMask to load the dapp and refresh.

#### Project uses an Oracle
The project uses the Oraclize oracle service to get the current timestamp.  This is used for policy purchases for the policy start time and submitting claims to verify a policy is valid.  The calls to oraclize can be seen in the ethereum bridge when running locally.

#### Project uses an upgradable pattern.
The project uses a registry contract which holds the currently deployed address of the Policy Manager factory contract.  As part of the migration script the address for the deployed Policy Manager factory contract is captured and updated as the new backend contract in the registry contract.  Subsequent migrations will keep the same registry contract and deploy new versions of the factory contract and update the registry.  The current Policy Manager factory contract stored in the registry is shown in the dapp.

#### Testnet Deployment
Dapp is deployed to the Rinkeby test net.  This can be seen by switching to the Rinkeby test net while using the front end hosted on IPFS [https://ipfs.infura.io/ipfs/QmZhy2hpuR2653Kt3ny5vRnTt8mv4gLnFgqju7qLmCoUSL/](https://ipfs.infura.io/ipfs/QmZhy2hpuR2653Kt3ny5vRnTt8mv4gLnFgqju7qLmCoUSL/).  Deployed addresses are listed in [deployed_addresses.txt](deployed_addresses.txt)

