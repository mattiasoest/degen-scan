require('dotenv').config();
const WebSocket = require('ws');
const config = require('./config');
const ethers = require('ethers');
const PORT = 8777;
const server = new WebSocket.Server({ port: PORT });

console.log(`Server started on port ${PORT}`);
server.on('connection', socket => {
  console.log(`${socket.id} connected!`);
  socket.send(`Connected!`);

  initListeners(socket);

  socket.on('message', msg => {
    console.log(`message received ${msg}`);
    socket.send(`Echo: ${msg}`);
  });
});

function listingListener(dex, socket) {
  let provider;
  let v2FactoryAddress;
  let abi;
  let listingText;
  switch (dex) {
    case 'uniswap':
      provider = new ethers.providers.WebSocketProvider(process.env.ETH_NODE);
      v2FactoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
      abi = config.UNI_V2_FAC_ABI;
      listingText = 'UNISWAP LISTING: ';
      break;
    case 'pancake':
      provider = new ethers.providers.WebSocketProvider(process.env.BSC_NODE);
      v2FactoryAddress = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';
      abi = config.CAKE_V2_FAC_ABI;
      listingText = 'PANCAKE LISTING: ';
      break;
    case 'quickswap':
      provider =
        new ethers.providers.WebSocketProvider(process.env.POLYGON_NODE);
      v2FactoryAddress = '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32';
      abi = config.QS_V2_FAC_ABI;
      listingText = 'QUICKSWAP LISTING: ';
      break;
    default:
      throw new Error('Unknown dex');
  }

  const contract = new ethers.Contract(v2FactoryAddress, abi, provider);

  contract.on(
    'PairCreated',
    async (tokenAddress0, tokenAddress1, pair, listingNumber) => {
      const tokenContract0 = new ethers.Contract(
        tokenAddress0, config.GENERIC_ERC20_ABI, provider);
      const tokenContract1 = new ethers.Contract(
        tokenAddress1, config.GENERIC_ERC20_ABI, provider);
      const [name0, name1] =
        await Promise.all([tokenContract0.name(), tokenContract1.name()]);

      const date = new Date().toISOString().split('.')[0];
      console.log(
        date, listingText, tokenAddress0, tokenAddress1, pair,
        '(' + name0 + ' - ' + name1 + ')');
      console.log('\n');

      const listing = {
        date,
        dex,
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

      socket.send(JSON.stringify(listing));
    });
}

function initListeners(socket) {
  console.log('Scanning for token listings...');
  listingListener('uniswap', socket);
  listingListener('pancake', socket);
  listingListener('quickswap', socket);
}