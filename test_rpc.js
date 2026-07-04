import { rpc } from 'stellar-sdk';

const rpcServer = new rpc.Server('https://soroban-testnet.stellar.org');

async function main() {
  const hash = 'ea2eb01d3ccf8e4cd8ae280dd9ba293c1c5836884506dfbe0cc47b7771ba6b5d';
  try {
    const txStatus = await rpcServer.getTransaction(hash);
    console.log('Keys of txStatus:', Object.keys(txStatus));
    console.log('txStatus.status:', txStatus.status);
    console.log('txStatus.returnValue:', txStatus.returnValue);
    if (txStatus.resultMetaXdr) {
      console.log('resultMetaXdr exists');
    }
    if (txStatus.resultXdr) {
      console.log('resultXdr exists');
    }
  } catch (err) {
    console.error('Error fetching tx status:', err);
  }
}

main();
