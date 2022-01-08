// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const optimismContracts = require("@eth-optimism/contracts")

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // Get network information
  await hre.ethers.provider._networkPromise
  const provider = hre.ethers.provider

  const Greeter = await hre.ethers.getContractFactory("Greeter");
  let greeter

  // If we are on the main Optimistic network, use an existing contract
  if (provider._network.chainId == 10) {
    greeter = await Greeter.attach("0x3810B272B40bb01d9eb63fD3a3b935011A40Fa71")
  } else {
    // Otherwise, deploy a new contract
    greeter = await Greeter.deploy("Hello, Hardhat!")
    await greeter.deployed();
  }

  console.log(`Greeter is at: ${greeter.address}`);
  console.log(`Network: ${provider._network.name} ${provider._network.chainId}`)

  // Specify just once to make it easy to change
  const methodName = "setGreeting"
  const methodParam = "Hola, mundo!"

  const l2Gas = await greeter.estimateGas[methodName](methodParam)
  const l2GasPrice = await provider.getGasPrice()
  const l2Fee = l2Gas*l2GasPrice

  console.log(`   L2 fee: ${String(l2Fee).padStart(30)} = ${l2Gas}*${l2GasPrice}`)

  const GasPriceOracle = optimismContracts.getContractFactory('OVM_GasPriceOracle')
    .attach(optimismContracts.predeploys.OVM_GasPriceOracle).connect(provider)

  let unsignedTx = await greeter.populateTransaction[methodName](methodParam)
  unsignedTx.gasPrice = (await provider.getGasPrice())
  unsignedTx.gasLimit = l2Gas

  // When we attempt to provide "from", serializeTransaction fails
  delete unsignedTx["from"]

  const serializedTx = ethers.utils.serializeTransaction(unsignedTx)
  const l1Fee = await GasPriceOracle.getL1Fee(serializedTx)

  console.log(`   L1 fee: ${String(l1Fee).padStart(30)}`)
  console.log(`Fee total: ${String(BigInt(l1Fee)+BigInt(l2Fee)).padStart(30)}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
