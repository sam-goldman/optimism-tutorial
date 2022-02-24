# How can a contract on Optimism communicate with L1?

[![Discord](https://img.shields.io/discord/667044843901681675.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discord.com/channels/667044843901681675)
[![Twitter Follow](https://img.shields.io/twitter/follow/optimismPBC.svg?label=optimismPBC&style=social)](https://twitter.com/optimismPBC)

This tutorial teaches you how to write a contract that runs on Optimism which calls a contract on L1.
This allows, for example, for complex calculations to take place on Optimism, where they are cheap, and the results provided to an L1 contract.
Note that because of the [fault challenge and proof mechanism](https://community.optimism.io/docs/how-optimism-works/#fault-proofs) on the production network it takes seven days for that result to be communicated to L1. On the Kovan test network it only takes a minute.

[You can read more details about this process here](https://community.optimism.io/docs/developers/bridge/messaging/).

## Seeing it in action

We installed on Kovan a copy of [Hardhat's Greeter contract](https://github.com/NomicFoundation/hardhat/blob/master/packages/hardhat-core/sample-projects/basic/contracts/Greeter.sol) at address `0x06a8872A698bf6Db44bB3221f26953FfabD9a163`.


1. Edit `hardhat.config.js`:
   1. Set `mnemonic` to point to an account that has ETH on the Kovan test network. 
   1. Set `module.exports.networks.kovan` to point to a URL that accesses the Kovan test network.

1. Install the necessary packages.

   ```sh
   yarn
   ```

1. Connect the Hardhat console to Kovan (L1):
  
   ```sh
   yarn hardhat console --network kovan
   ```

1. Connect to the Greeter on L1 and see the greeting:

   ```js
   Greeter = await ethers.getContractFactory("Greeter")
   greeter = await Greeter.attach("0x06a8872A698bf6Db44bB3221f26953FfabD9a163")
   await greeter.greet()
   ```

1. Open another window and connect the Hardhat console to Optimistic Kovan (L2):

   ```js
   yarn hardhat console --network optimistic-kovan
   Controller = await ethers.getContractFactory("ControlL1Greeter")
   controller = await Controller.deploy()
   tx = await controller.setGreeting("Shalom")
   rcpt = await tx.wait()
   ```

1. Keep a copy of the transaction hash.

   ```js
   tx.hash
   ```

Once the fault challenge period is over (one minute on Kovan, seven days on the production network) it is necessary to claim the transaction on L1. 
This is a complex process that requires a [Merkle proof](https://medium.com/crypto-0-nite/merkle-proofs-explained-6dd429623dc5):

1. Browse to the [message relayer](https://kovan-optimistic.etherscan.io/messagerelayer).

1. Enter the transaction hash and click the magnifying glass.

1. Ignore the fact that no token withdrawals are found and click **Execute**.

1. Approve the transaction in the wallet (which has to be connected to Kovan and have sufficient Kovan ETH).

1. Run a console on Kovan and verify (using `await greeter.greet()`) that the greeting has changed.


## The L2 contract

Let's go over the L2 contract that controls Greeter on L1, [`ControlL1Greeter.sol`](contracts/ControlL1Greeter.sol).

```solidity
//SPDX-License-Identifier: Unlicense
// This contracts runs on L1, and controls a Greeter on L2.
pragma solidity ^0.8.0;

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";
```

This line imports the interface to send messages, [`ICrossDomainMessenger.sol`](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts/contracts/libraries/bridge/ICrossDomainMessenger.sol).


```solidity
contract ControlL1Greeter {
    address crossDomainMessengerAddr = 0x4200000000000000000000000000000000000007;
```

This is the address of [`L2CrossDomainMessenger`](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts/contracts/L2/messaging/L2CrossDomainMessenger.sol). 
As an Optimism predeploy, it has the same address on all networks.

```solidity
    address greeterL1Addr = 0x06a8872A698bf6Db44bB3221f26953FfabD9a163;
```    

This is the address on which `Greeter` is installed on Kovan.

```solidity
    function setGreeting(string calldata _greeting) public {
```

This function sets the new greeting. Note that the string is stored in `calldata`. 
This saves us some gas, because when we are called from an externally owned account or a different contract there no need to copy the input string to memory.
The downside is that we cannot call `setGreeting` from within this contract, because contracts cannot modify their own calldata.

```solidity
        bytes memory message;
```

This is where we'll store the message to send to L1.

```solidity 
        message = abi.encodeWithSignature("setGreeting(string)", 
            _greeting);
```

Here we create the message, the calldata to be sent on L1.
The Solidity [`abi.encodeWithSignature`](https://docs.soliditylang.org/en/v0.8.12/units-and-global-variables.html?highlight=abi.encodeWithSignature#abi-encoding-and-decoding-functions) function creates this calldata.
As [specified in the ABI](https://docs.soliditylang.org/en/v0.5.3/abi-spec.html), it is four bytes of signature for the function being called followed by the parameter, in this case a string.

```solidity
        ICrossDomainMessenger(crossDomainMessengerAddr).sendMessage(
            greeterL1Addr,
            message,
            1000000  // irrelevant here
        );
```

This call actually sends the message. It gets three parameters:

1. The address on L1 of the contract being contacted
1. The calldata to send that contract
1. The gas limit. 
   The gas limit is part of the function because it is standard on both directions, but in the case of L2 to L1 transaction it is irrelevant.
   The real gas limit is the one of the claiming transaction on L1.


```solidity
    }      // function setGreeting 
}          // contract ControlL1Greeter
```

## Addresses

[For security reasons](https://community.optimism.io/docs/developers/build/differences/#using-eth-in-contracts) the source contract address for a call on L2 has to be different than the real L1 source contract address.