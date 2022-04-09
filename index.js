require('dotenv').config()
const config = require('./config');
const ethers = require('ethers');

function listingListener(dex) {
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
  contract.on('PairCreated', async (token0, token1, pair, listingNumber) => {
    const tokenContract0 =
        new ethers.Contract(token0, config.GENERIC_ERC20_ABI, provider);
    const tokenContract1 =
        new ethers.Contract(token1, config.GENERIC_ERC20_ABI, provider);
    tokenContract0.n
    const [name0, name1] =
        await Promise.all([tokenContract0.name(), tokenContract1.name()]);
    console.log(
        new Date().toISOString().split('.')[0], listingText, token0, token1,
        pair, '(' + name0 + ' - ' + name1 + ')');
    console.log('\n');

    // TODO stream this data
  });
}

function init() {
  console.log('Started listening for listings...');
  listingListener('uniswap');
  listingListener('pancake');
  listingListener('quickswap');
}

init();