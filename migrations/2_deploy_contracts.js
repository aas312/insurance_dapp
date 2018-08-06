var PolicyManager = artifacts.require("./PolicyManager.sol");
var Registry = artifacts.require("./Registry.sol");

module.exports = function(deployer) {

var PolicyManagerInstance
var RegistryInstance
deployer.then(function() {
  // Create a new version of A
  return deployer.deploy(PolicyManager);
}).then(function(instance) {
  PolicyManagerInstance = instance;
  // Get the deployed instance of B
  return deployer.deploy(Registry);
}).then(function(instance) {
  RegistryInstance = instance;
  // Set the new instance of A's address on B via B's setA() function.
  return RegistryInstance.changeBackend(PolicyManagerInstance.address);
});};
