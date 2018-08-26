Steps taken to avoid common attacks

### Logic Bugs
Used extensive code review, testing and unit test.

### Recursive Calls
The contracts uses pull withdrawal method to avoid reentrancy from a fallback function.  Ether is transferred at the end of function calls after state updates.  Access to functions is limited in many cases.

### Integer Arithmetic Overflow/Underflow
Using safe math library for integer arithmetic.

### Poison Data
Limits are set for the size of all user-supplied strings.
Other used supplied data is checked for correctness, i.e. guarding against negative or zero values.

### Exposed Functions
All functions are public but access is restricted to certain users/addresses in certain cases.

### Exposed Secrets
All data is expected to be exposed

### Timestamp Vulnerabilities
Using an oracle for time dependent state changes.  The policy start time is set using an oracle at the time of purchase.  The coverage period is used to calculate the end date.  The oracle is used to get the current time when a claim is submitted to verify that the policy has not expired.

### tx.origin problem
tx.origin is not used.

### Gas Limits
Designed logic and structures so that there is no iteration of arrays within contract functions to avoid block gas limits.  Limits are set for the size of all user supplied strings.  No loops are used in contract functions.
