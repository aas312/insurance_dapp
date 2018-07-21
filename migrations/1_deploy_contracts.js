var PolicyManager = artifacts.require("./PolicyManager.sol");

module.exports = function(deployer) {
  deployer.deploy(PolicyManager);
};
