# Using Optimistic Ethereum with the Hardhat Development Environment

[![Discord](https://img.shields.io/discord/667044843901681675.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discord.com/channels/667044843901681675)
[![Twitter Follow](https://img.shields.io/twitter/follow/optimismPBC.svg?label=optimismPBC&style=social)](https://twitter.com/optimismPBC)

This tutorial aims to help you get started with developing decentralized applications on [Optimistic Ethereum](https://optimism.io/) using [Hardhat](https://hardhat.org/). Applications 
running on top of Optimistic Ethereum are about as secure as those running on the underlying Ethereum mainnet itself, but are
[significantly cheaper](https://archive.optimism.io/gas-comparison).

## Build an Optimistic Ethereum Node

The fastest way to test and debug apps on Optimistic Ethereum is to run a 
local Optimistic Ethereum node, so we'll build one.
The directions in this section are for an Ubuntu 20.04 VM running on GCP with 
a 20 GB disk (the default, 10 GB, is not enough) and 16 GB RAM
but they should be similar for other Linux versions and other platforms.

### Install Prerequisite Software

1. Install [Docker](https://www.docker.com/). If you prefer not to use the convenience script shown below, 
   [there are other installation methods](https://docs.docker.com/engine/install/ubuntu).

   ```sh
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. Configure Docker settings.

   ```sh
   sudo usermod -a -G docker `whoami`
   ```
   
3. Install [Docker Compose](https://docs.docker.com/compose/install/).
  
   ```sh
   sudo apt install -y docker-compose
   ```

4. Install [Node.js](https://nodejs.org/en/). The version in the OS repository is 
  out of date, so we'll get the package from a different source. 
  
   ```sh
   curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
   sudo bash nodesource_setup.sh
   sudo apt install -y nodejs
   ```
   
5. Install the Node.js packages we need. [See here](https://github.com/sindresorhus/guides/blob/main/npm-global-without-sudo.md)
   if you'd rather install these packages without root permissions.
   ```sh   
   sudo npm install -g yarn hardhat
   ```
   
6. Log out and log back in to complete the Docker installation (required).


### Start an Optimistic Ethereum Node

This process downloads and starts an Optimistic Ethereum network of one node.

1. Clone the [Optimism monorepo](https://github.com/ethereum-optimism/optimism).

   ```sh
   git clone https://github.com/ethereum-optimism/optimism.git
   ```

1. Start the Optimistic Ethereum node. This process downloads the images
   from [the Docker hub](https://hub.docker.com/u/ethereumoptimism), and 
   depending on the hardware it can take up to ten minutes.

   ```sh
   cd optimism/ops
   docker-compose -f docker-compose-nobuild.yml up -t 3600
   ``` 

   You might get a timeout at first. If that is the case, just run the 
   `docker-compose` command again.

> :information_source: It takes a few minutes for all the processes to start and communicate
> with each other. If at first you see `curl` failure to connect errors wait
> a few minutes.


## Migrate a Dapp to Optimistic Ethereum

Now that we have Optimistic Ethereum running, it is time to run a decentralized application (dapp) on it.

> :information_source: If you don't need the explanations and just want to see running code, 
> [click here](https://github.com/ethereum-optimism/optimism-tutorial/). The 
> `hardhat/dapp` directory only requires these steps to run:
> 1. `yarn`
> 1. `npx hardhat test --network optimistic`


### Get a Sample Application

The easiest way is to start with a sample application. 

1. Open a second command line terminal
1. Run `hardhat`, the development environment we use in this tutorial
   ```sh
   mkdir dapp
   cd dapp
   npx hardhat
   ```
1. Select **Create a basic sample project** and accept all the defaults.
1. Verify the sample application.
   ```sh
   npx hardhat test
   ```
   
#### Interact with the Sample App Manually (optional)   
   
If you want to be more hands on, you can interact with the contract manually.

1. Start the console
   ```sh
   npx hardhat console
   ```
2. Deploy the greeter contract.
   ```javascript
   const Greeter = await ethers.getContractFactory("Greeter")
   const greeter = await Greeter.deploy("Hello, world!")
   await greeter.deployed()
   ```
3. Get the current greeting.
   ```javascript
   await greeter.greet()
   ```
4. Modify the greeting.
   ```javascript
   const tx = await greeter.setGreeting("Hola, mundo")
   await tx.wait()
   ```
5. Verify the greeting got modified.
   ```javascript
   await greeter.greet()
   ```
   
6. Leave the console.
   ```javascript
   .exit
   ```

### Migrate the Sample App to Optimistic Ethereum

Now that we have a running Optimistic Ethereum node and a dapp to run on it, we can deploy to Optimistic Ethereum.

1. Edit `hardhat.config.js` to add `optimistic` to the list of networks:
   ```js
   // hardhat.config.js

   ...
   
   module.exports = {
     solidity: "0.8.4",
     networks: {
       optimistic: {
         url: 'http://127.0.0.1:8545',
         accounts: { mnemonic: 'test test test test test test test test test test test junk' }
       }
     }
   };
   ```

1. Test the contract on Optimistic Ethereum. 

   ```sh
   npx hardhat --network optimistic test
   ```

1. If you want to interact with the app manually, use the console. You can use 
   the same JavaScript commands to control it you used above.
   ```sh
   npx hardhat --network optimistic console
   ```
   
   

## Deploying to a Real Network

To deploy to a real network (Optimistic Ethereum or Optimistic Kovan),
edit `hardhat.config.js`'s `modules.export.networks` to add a definition
similar to this one:

```javascript
    "optimistic-kovan": {
       url: 'https://kovan.optimism.io',
       accounts: { mnemonic: <your account mnemonic goes here> }

    }
```    

## Best Practices for Running Tests

As you may have noticed, in this tutorial we ran all the tests first on the HardHat EVM and only then on Optimistic Ethereum. This is
important, because it lets you isolate contract problems from problems that are the result of using Optimistic Ethereum rather than 
vanilla Ethereum.


## Conclusion

This tutorial has only touched the most basic points of Optimistic Ethereum development. For more information, you can 
[check out the full integration guide](https://community.optimism.io/docs/developers/tutorials.html) on the Optimism community hub.
Go read it, and then write a dapp that will amaze us.
