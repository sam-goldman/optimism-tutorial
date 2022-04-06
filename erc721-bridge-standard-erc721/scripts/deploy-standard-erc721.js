// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

const L2StandardERC721FactoryArtifact = require(`../abi/L2StandardERC721Factory.json`);

async function main() {
  // MODIFY TO DESIRED PARAMS
  const L1ERC721Address = process.env.L1_ERC721_ADDRESS;
  const L2ERC721Name = process.env.L2_ERC721_NAME;
  const L2ERC721Symbol = process.env.L2_ERC721_SYMBOL;

  // Instantiate the signer
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log(
    "Creating instance of L2StandardERC721 on",
    hre.network.name,
    "network"
  );

  // Instantiate the Standard ERC721 factory
  const l2StandardERC721Factory = new ethers.Contract(
    "0xC8369642f6eC99da81072388b2E6d0ECDb148620",
    L2StandardERC721FactoryArtifact.abi,
    signer
  );

  const tx = await l2StandardERC721Factory.createStandardL2ERC721(
    L1ERC721Address,
    L2ERC721Name,
    L2ERC721Symbol
  );
  const receipt = await tx.wait();
  const args = receipt.events.find(
    ({ event }) => event === "StandardL2ERC721Created"
  ).args;

  // Get the L2 ERC721 address from the emmited event and log
  const l2ERC721Address = args._l2Token;
  console.log("L2StandardERC721 deployed to:", l2ERC721Address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
