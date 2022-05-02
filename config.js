const abis = require("./abis");

const dex = {
  uniswap: {
    contract: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    abi: abis.UNI_V2_FAC_ABI,
    node: process.env.ETH_NODE,
    network: "eth",
  },
  sushiswap_eth: {
    contract: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    abi: abis.SUSHI_V2_FAC_ABI,
    node: process.env.ETH_NODE,
    network: "eth",
  },
  sushiswap_arb: {
    contract: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    abi: abis.SUSHI_V2_FAC_ABI,
    node: process.env.ARBITRUM_NODE,
    network: "arbitrum",
  },
  sushiswap_poly: {
    contract: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    abi: abis.SUSHI_V2_FAC_ABI,
    node: process.env.POLYGON_NODE,
    network: "poly",
  },
  sushiswap_ftm: {
    contract: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    abi: abis.SUSHI_V2_FAC_ABI,
    node: process.env.FANTOM_NODE,
    network: "ftm",
  },
  sushiswap_bsc: {
    contract: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    abi: abis.SUSHI_V2_FAC_ABI,
    node: process.env.BSC_NODE,
    network: "bsc",
  },
  pancake: {
    contract: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    abi: abis.CAKE_V2_FAC_ABI,
    node: process.env.BSC_NODE,
    network: "bsc",
  },
  apeswap: {
    contract: "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6",
    abi: abis.APESWAP_FAC_ABI,
    node: process.env.BSC_NODE,
    network: "bsc",
  },
  quickswap: {
    contract: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    abi: abis.QS_V2_FAC_ABI,
    node: process.env.POLYGON_NODE,
    network: "poly",
  },
  trader_joe: {
    contract: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
    abi: abis.JOE_V2_FAC_ABI,
    node: process.env.AVAX_NODE,
    network: "avax",
  },
  spiritswap: {
    contract: "0xEF45d134b73241eDa7703fa787148D9C9F4950b0",
    abi: abis.SPIRIT_FAC_ABI,
    node: process.env.FANTOM_NODE,
    network: "ftm",
  },
  spookyswap: {
    contract: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3",
    abi: abis.SPOOKY_FAC_ABI,
    node: process.env.FANTOM_NODE,
    network: "ftm",
  },
};

exports.dex = dex;
