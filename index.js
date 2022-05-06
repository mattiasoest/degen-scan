require("dotenv").config();
const WebSocket = require("ws");
const abis = require("./abis");
const ethers = require("ethers");
const { dex } = require("./config");
const PORT = 4000;
const PING_PONG = 1000;
const PING_INTERVAL = 25000;
const server = new WebSocket.Server({ port: PORT });

const connections = [];

const RECENT_CAP = 18;
const recentListings = [];

initListeners();
console.log(`Server started on port ${PORT}`);

server.on("connection", (socket) => {
  let pong = false;

  connections.push(socket);
  socket.send(JSON.stringify(recentListings));
  console.log(`Client connected! Now ${connections.length} connections`);
  socket.on("message", (msg) => {
    const parsed = msg.toString();
    if (parsed === "pong") {
      console.log(`PONG`);
      pong = true;
      lastMsg = Date.now();
    }
  });

  // Connection handling, cleanup if app is closed
  const intervalID = setInterval(() => {
    socket.send("ping");
    const timeoutID = setTimeout(() => {
      if (!pong) {
        for (let i = 0; i < connections.length; i++) {
          if (connections[i] === socket) {
            connections.splice(i, 1);
            const date = new Date().toISOString().split(".")[0];
            console.log(
              `${date} Removed socket, now ${connections.length} connections`
            );
            // Cleanup
            clearInterval(intervalID);
            clearTimeout(timeoutID);
            socket.close();
          }
        }
      } else {
        // reset
        pong = false;
      }
    }, PING_PONG);
  }, PING_INTERVAL);
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

      const listing = {
        timestamp: Date.now(),
        dexId,
        network: dex[dexId].network,
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

      // TODO STORE IN DB?
      recentListings.unshift(listing);
      if (recentListings.length > RECENT_CAP) {
        recentListings.pop();
      }

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
    network: "eth",
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
