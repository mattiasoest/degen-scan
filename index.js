require("dotenv").config();
const WebSocket = require("ws");
const abis = require("./abis");
const ethers = require("ethers");
const { dex } = require("./config");
const PORT = 4000;
const server = new WebSocket.Server({ port: PORT });

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
  const dexData = dex[dexId];
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
        abis.GENERIC_ERC20_ABI,
        provider
      );
      const tokenContract1 = new ethers.Contract(
        tokenAddress1,
        abis.GENERIC_ERC20_ABI,
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
  listingListener("sushiswap_arb");
  listingListener("sushiswap_poly");
  listingListener("sushiswap_ftm");
  listingListener("sushiswap_bsc");
  listingListener("pancake");
  listingListener("quickswap");
  listingListener("trader_joe");
  listingListener("apeswap");
  listingListener("spookyswap");
  listingListener("spiritswap");
}

function testListing() {
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
