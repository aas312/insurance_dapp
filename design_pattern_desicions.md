### Design Decisions

### Factory
The project is setup using the factory model.  The policy manager contract acts as a factory for managing policy managers and creating any number of policy contracts.  It would be possible to create the same functionality using a single contract but it would be more complex and present higher risk from a security perspective.  By limiting the funds, management, policy holders and claims for a policy instance to a single contract the risk of some unforeseen risk, from a bad actor, to faulty code conditions is greatly mitigated.  It also allows the possibility of upgrading the Policy Manager factory contract functionality while leaving already created policies secure and untouched.

### Circuit Breaker
A circuit breaker has been implemented in both the policy manager contract and any created policies.  A policy manager could lock the policy against claim submissions and policy purchases, but still add and withdraw funds in case of an emergency, security or otherwise.

### Pull Payments
While it was possible to transfer payment immediately when a claim was approved this created a risk of a malicious contract not being able to accept funds and would lock the policy from being able to approve claims.  Forcing a policy holder to withdraw the funds after approval puts the requirement on them without the possibility of breaking functionality for the policy manager.

### Restricting Access
Access is restricted in a number of ways as only specific users are allowed to take specific actions.
* Only the owner of the Registry contract can change the backend.
* Only the owner/admin can add new policy managers.
* Only policy managers can create new policies, stop/start the contract, withdraw funds, approve/deny claims.
* Only an owner of a policy can submit a claim or collect the approved claim.

### Fail Early and Loud
Whenever required conditions are not met to make an action to change state the transactions is reverted.  This applies to all state changes: adding policy managers, new policies, purchasing policies, submitting claims.  There are no silent failures in regard to missing state changes.
