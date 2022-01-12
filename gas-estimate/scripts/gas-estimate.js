const hre = require("hardhat");
const optimismContracts = require("@eth-optimism/contracts")

async function main() {
  // Get network information
  await hre.ethers.provider._networkPromise
  const provider = hre.ethers.provider
  const signer = await hre.ethers.getSigner()

  const Greeter = await hre.ethers.getContractFactory("Greeter");
  let greeter

  switch (provider._network.chainId) {
    case 10:   // If we are on the main Optimistic network, use an existing contract
      greeter = await Greeter.attach("0x3810B272B40bb01d9eb63fD3a3b935011A40Fa71").
          connect(signer)
      break
    case 420:  // Local optimism development node, deploy a new contract
      greeter = await Greeter.deploy("Hello, Hardhat!")
      await greeter.deployed();
      break;
    default:  // Inappropriate chain
      console.log(`We need to be on an Optimism chain, not ${provider._network.name}`)
      console.log(`Run one of these:`)
      console.log(`   yarn hardhat run scripts/gas-estimate.js --network optimism-devnode`)
      console.log(`   yarn hardhat run scripts/gas-estimate.js --network optimism-mainnet`)

      process.exit(-1)
  }

  // Specify just once to make it easy to change
  const methodName = "setGreeting"
  const methodParam = "Hola, mundo!"

  // Estimate the L2 gas, get the price, and figure the L2 fee
  const l2Gas = await greeter.estimateGas[methodName](methodParam)
  const l2GasPrice = await provider.getGasPrice()
  const l2Fee = l2Gas*l2GasPrice

  console.log(`   L2 fee: ${String(l2Fee).padStart(30)} wei = ${l2Gas} gas * ${l2GasPrice} wei/gas`)

  const GasPriceOracle = optimismContracts.getContractFactory('OVM_GasPriceOracle')
    .attach(optimismContracts.predeploys.OVM_GasPriceOracle).connect(provider)

  // Get the transaction request fields
  const txReq = await greeter.populateTransaction[methodName](methodParam)
  var tx = await signer.populateTransaction(txReq)
  delete tx.from

  // To read the L1 fee we need a serialized transaction
  const serializedTx = ethers.utils.serializeTransaction(tx)

  // Use GasPriceOracle.getL1Fee to get the L1 fee
  const l1Fee = await GasPriceOracle.getL1Fee(serializedTx)

  console.log(`   L1 fee: ${String(l1Fee).padStart(30)} wei`)
  console.log(`Fee total: ${String(BigInt(l1Fee)+BigInt(l2Fee)).padStart(30)} wei`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
