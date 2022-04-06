const hre = require("hardhat");
const ethers = require('ethers')

const L1ERC721BridgeArtifact = require(`../abi/L1ERC721Bridge.json`);
const L2StandardERC721FactoryArtifact = require(`../abi/L2StandardERC721Factory.json`);
const L2ERC721BridgeArtifact = require(`../abi/L2ERC721Bridge.json`);

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(hre.network.config.url);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // L1ERC721Bridge
  // const Factory__L1ERC721Bridge = new ethers.ContractFactory( 
  //   L1ERC721BridgeArtifact.abi,
  //   L1ERC721BridgeArtifact.bytecode
  // )

  // const L1ERC721Bridge = await Factory__L1ERC721Bridge.connect(signer).deploy()
  
  // console.log('L1ERC721Bridge deployed on: ', L1ERC721Bridge.address)

  // // L2StandardERC721Factory
  // const Factory__L2StandardERC721Factory = new ethers.ContractFactory( 
  //   L2StandardERC721FactoryArtifact.abi,
  //   L2StandardERC721FactoryArtifact.bytecode
  // )

  // const L2StandardERC721Factory = await Factory__L2StandardERC721Factory.connect(signer).deploy()
  
  // console.log('L2StandardERC721Factory deployed on: ', L2StandardERC721Factory.address)


  // L2ERC721Bridge
  // const l2CrossDomainMessengerAddress = '0x4200000000000000000000000000000000000007'
  // const l1ERC721BridgeAddress = '0x6138B40551452b7584AD96F8207a74F002D82FA9'

  // const Factory__L2ERC721Bridge = new ethers.ContractFactory( 
  //   L2ERC721BridgeArtifact.abi,
  //   L2ERC721BridgeArtifact.bytecode
  // )

  // const L2ERC721Bridge = await Factory__L2ERC721Bridge.connect(signer).deploy(
  //   l2CrossDomainMessengerAddress,
  //   l1ERC721BridgeAddress
  // )
  
  // console.log('L2ERC721Bridge deployed on: ', L2ERC721Bridge.address)


  // L1ERC721
  const name = 'L1ERC721'
  const symbol = 'L1'
  const Factory__L1ERC721 = new ethers.ContractFactory( 
    L1ERC721.abi,
    L1ERC721.bytecode
  )

  const L1ERC721 = await L1ERC721.connect(signer).deploy(
    l2CrossDomainMessengerAddress,
    l1ERC721BridgeAddress
  )
  
  console.log('L1ERC721 deployed on: ', L1ERC721.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });