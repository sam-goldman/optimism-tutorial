# Estimate gas costs of a transaction on Optimism

[![Discord](https://img.shields.io/discord/667044843901681675.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discord.com/channels/667044843901681675)
[![Twitter Follow](https://img.shields.io/twitter/follow/optimismPBC.svg?label=optimismPBC&style=social)](https://twitter.com/optimismPBC)

This tutorial shows how you can [estimate the cost of a transaction on Optimism](https://community.optimism.io/docs/developers/build/transaction-fees). 

## Setup

We assume you already have a local development node, as explained in [this tutorial](https://github.com/ethereum-optimism/optimism-tutorial/tree/main/hardhat).

## Estimating the gas cost of a 

Install the necessary packages:
```sh
yarn
```

To transfer on a local development node:
```sh
node scripts/depositETH.js
```

To transfer on a different network, edit `scripts/depositETH.js` and modify the first three lines.
