require("dotenv").config();
const WebSocket = require("ws");
const config = require("./config");
const ethers = require("ethers");
const PORT = 4000;
const server = new WebSocket.Server({ port: PORT });

const DEX = {
  uniswap: {
    contract: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    abi: config.UNI_V2_FAC_ABI,
    node: process.env.ETH_NODE,
  },
  sushiswap_eth: {
    contract: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    abi: config.SUSHI_V2_FAC_ABI,
    node: process.env.ETH_NODE,
  },
  pancake: {
    contract: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    abi: config.CAKE_V2_FAC_ABI,
    node: process.env.BSC_NODE,
  },
  apeswap: {
    contract: "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6",
    abi: config.APESWAP_FAC_ABI,
    node: process.env.BSC_NODE,
  },
  quickswap: {
    contract: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32",
    abi: config.QS_V2_FAC_ABI,
    node: process.env.POLYGON_NODE,
  },
  trader_joe: {
    contract: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
    abi: config.JOE_V2_FAC_ABI,
    node: process.env.AVAX_NODE,
  },
  spiritswap: {
    contract: "0xEF45d134b73241eDa7703fa787148D9C9F4950b0",
    abi: config.SPIRIT_FAC_ABI,
    node: process.env.FANTOM_NODE,
  },
  spookyswap: {
    contract: "0x152eE697f2E276fA89E96742e9bB9aB1F2E61bE3",
    abi: config.SPOOKY_FAC_ABI,
    node: process.env.FANTOM_NODE,
  },
};

const connections = [];

initListeners();
console.log(`Server started on port ${PORT}`);

server.on("connection", (socket) => {
  console.log("Client connected!");
  connections.push(socket);
  console.log(`${connections.length} connections`);


  socket.on("message", (msg) => {
    const parsed = msg.toString();
    console.log(`message received ${parsed}`);
    if (parsed === "token") {
      testListing(socket);
    } else if (parsed === "err") {
      throw new Error("Custom throw!");
    }
  });
});

function listingListener(dexId) {
  const dexData = DEX[dexId];
  const provider = new ethers.providers.WebSocketProvider(dexData.node);
  const v2FactoryAddress = dexData.contract;
  const abi = dexData.abi;
  const listingText = `${dexId} LISTING: `;

  const contract = new ethers.Contract(v2FactoryAddress, abi, provider);

  contract.on(
    "PairCreated",
    async (tokenAddress0, tokenAddress1, pair, listingNumber) => {
      const tokenContract0 = new ethers.Contract(
        tokenAddress0,
        config.GENERIC_ERC20_ABI,
        provider
      );
      const tokenContract1 = new ethers.Contract(
        tokenAddress1,
        config.GENERIC_ERC20_ABI,
        provider
      );

      let name0, name1;
      try {
        [name0, name1] = await Promise.all([
          tokenContract0.name(),
          tokenContract1.name(),
        ]);
      } catch (err) {
        console.log("Failed to get token names");
      }

      const date = new Date().toISOString().split(".")[0];
      console.log(
        date,
        listingText,
        tokenAddress0,
        tokenAddress1,
        pair,
        "(" + name0 + " - " + name1 + ")"
      );
      console.log("\n");

      const listing = {
        timestamp: Date.now(),
        dexId,
        token0: {
          contract: tokenAddress0,
          name: name0,
        },
        token1: {
          contract: tokenAddress1,
          name: name1,
        },
        pair,
      };

      connections.forEach((socket) => socket.send(JSON.stringify(listing)));
    }
  );
}

function initListeners() {
  console.log("Scanning for token listings...");
  listingListener("uniswap");
  listingListener("sushiswap_eth");
  listingListener("pancake");
  listingListener("quickswap");
  listingListener("trader_joe");
  listingListener("apeswap");
  listingListener("spookyswap");
  listingListener("spiritswap");
}

function testListing(socket) {
  console.log("Test listing triggered");
  const dexId = "test_dex";
  const listing = {
    timestamp: Date.now(),
    dexId,
    token0: {
      contract: "0xtester1",
      name: "token1",
    },
    token1: {
      contract: "0xtester2",
      name: "token2",
    },
    pair: "0xpair",
  };

  connections.forEach((socket) => socket.send(JSON.stringify(listing)));
}
