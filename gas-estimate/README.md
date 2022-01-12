# Estimate gas costs of a transaction on Optimism

[![Discord](https://img.shields.io/discord/667044843901681675.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discord.com/channels/667044843901681675)
[![Twitter Follow](https://img.shields.io/twitter/follow/optimismPBC.svg?label=optimismPBC&style=social)](https://twitter.com/optimismPBC)

This tutorial shows how you can [estimate the cost of a transaction on Optimism](https://community.optimism.io/docs/developers/build/transaction-fees). 

## Setup

If you want to check against a local development node, you need to create it as explained in [this tutorial](https://github.com/ethereum-optimism/optimism-tutorial/tree/main/hardhat). If you want to check against the main Optimism network there is no need for a setup beyond installing `node` and `yarn`.

## Estimating the cost of a transaction

1. Install the necessary packages:
   ```sh
   yarn
   ```

1. Estimate the gas cost of a transaction:
   - On the production network:
     ```sh
     yarn hardhat run scripts/gas-estimate.js --network optimism-mainnet
     ```
   - On a local development node:
     ```sh
     yarn hardhat run scripts/gas-estimate.js --network optimism-devnode
     ```
     
### How it works

```javascript
const hre = require("hardhat");
const optimismContracts = require("@eth-optimism/contracts")
```

We need to use the [Gas Price Oracle](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts/contracts/L2/predeploys/OVM_GasPriceOracle.sol) contract.

```js
async function main() {
  // Get network information
  await hre.ethers.provider._networkPromise
  const provider = hre.ethers.provider
  const signer = await hre.ethers.getSigner()
```  

We need the provider with all the information, so we `await` until `_networkPromise`, which reads that information, is fulfilled.


```js
  const Greeter = await hre.ethers.getContractFactory("Greeter");
  let greeter
```

This is [the standard `Greeter` contract from HardHat](https://github.com/nomiclabs/hardhat/blob/master/packages/hardhat-core/sample-projects/basic/contracts/Greeter.sol). We declare the variable here because the way we set the value depends on the chain we are on.

```js
  switch (provider._network.chainId) {
    case 10:   // If we are on the main Optimistic network, use an existing contract
      greeter = await Greeter.attach("0x3810B272B40bb01d9eb63fD3a3b935011A40Fa71")
      break
```

The production network already has [a Greeter contract](https://optimistic.etherscan.io/address/0x3810b272b40bb01d9eb63fd3a3b935011a40fa71) deployed, so you won't have to waste money deploying your own.

```js
    case 420:  // Local optimism development node, deploy a new contract
      greeter = await Greeter.deploy("Hello, Hardhat!")
      await greeter.deployed();
      break;
```

[A local development node](https://community.optimism.io/docs/developers/build/dev-node) won't have a Greeter so we deploy it as part of the script.

```js
    default:  // Inappropriate chain
      console.log(`We need to be on an Optimism chain, not ${provider._network.name}`)
      console.log(`Run one of these:`)
      console.log(`   yarn hardhat run scripts/gas-estimate.js --network optimism-devnode`)
      console.log(`   yarn hardhat run scripts/gas-estimate.js --network optimism-mainnet`)

      process.exit(-1)
  }
```  

If it isn't a known Optimism network, abort (you can add Kovan yourself).

```js
  // Specify just once to make it easy to change
  const methodName = "setGreeting"
  const methodParam = "Hola, mundo!"
```  

In [ethers](https://docs.ethers.io/v5/) the [standard method to analyze transactions and their effects](https://docs.ethers.io/v5/api/contract/contract/#Contract--check) is to call `<contract>.<analysis type>.<method the transaction calls>(<parameters>)`. However, in this case we need two types of analysis: [`estimateGas`](https://docs.ethers.io/v5/api/contract/contract/#contract-estimateGas) and [`populateTransaction`](https://docs.ethers.io/v5/api/contract/contract/#contract-populateTransaction). To make it easier to adapt the code for other uses, it's best to specify the method name just once. Luckily, in JavaScript `a.b` is equivalent to `a["b"]`.

Note that to adapt it for methods that have a different number of arguments you still need to modify that in the code below.

```js
  // Estimate the L2 gas, get the price, and figure the L2 fee
  const l2Gas = await greeter.estimateGas[methodName](methodParam)
  const l2GasPrice = await provider.getGasPrice()
  const l2Fee = l2Gas*l2GasPrice

  console.log(`   L2 fee: ${String(l2Fee).padStart(30)} wei = ${l2Gas} gas * ${l2GasPrice} wei/gas`)
```

This is normal Ethereum, the same way you'd do it on L1 (except the gas price is **a lot** lower).

```js
  const GasPriceOracle = optimismContracts.getContractFactory('OVM_GasPriceOracle')
    .attach(optimismContracts.predeploys.OVM_GasPriceOracle).connect(provider)
```

The Gas Price Oracle is a predeploy and as such always at the same address, so it is easy to connect to it.

```js
  // Get the transaction request fields
  const txReq = await greeter.populateTransaction[methodName](methodParam)
  var tx = await signer.populateTransaction(txReq)
  delete tx.from
```

Get the transaction fields. Note that we need to use two different versions of `populateTransaction`. The first one, which is part of the contract object, populates the `to`, `from`, and `data` fields. The second `populateTransaction`, which is a part of the signer object, populates the remaining field: `type` (at writing Optimism only supports type 0, no access lists), `gasPrice`, `gasLimit`, `nonce`, and `chainId`. 

The `from` field is part of the transaction, but it does not appear in the serialized transaction because it is separately encoded as part of the signature, So we need to remove it.

```js
  // To read the L1 fee we need a serialized transaction
  const serializedTx = ethers.utils.serializeTransaction(tx)
```

We need a [serialized transaction](https://docs.ethers.io/v5/api/utils/transactions/#utils-serializeTransaction) to send to Gas Price Oracle.

```js
  // Use GasPriceOracle.getL1Fee to get the L1 fee
  const l1Fee = await GasPriceOracle.getL1Fee(serializedTx)
```

You could just use [the same formula as the code](https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts/contracts/L2/predeploys/OVM_GasPriceOracle.sol#L117-L124) to get the L1 fee. However, if you do that your code will produce inaccurate results if the formula, or the parameters, change. It is better to rely on the oracle which will get updated as needed.


```js
  console.log(`   L1 fee: ${String(l1Fee).padStart(30)} wei`)
  console.log(`Fee total: ${String(BigInt(l1Fee)+BigInt(l2Fee)).padStart(30)} wei`)
}
```

Report the results to the user.

## Reporting costs in different currencies


## Calculating the max amount of ETH a user can transfer
