import { rpc, Operation, TransactionBuilder, Address, xdr, Account } from 'stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const ESCROW_CONTRACT_ID = 'CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27';

const rpcServer = new rpc.Server(RPC_URL);

async function main() {
  const senderAddress = 'GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP';
  try {
    const accountResponse = await fetch(`https://horizon-testnet.stellar.org/accounts/${senderAddress}`);
    const accountData = await accountResponse.json();
    const account = new Account(senderAddress, accountData.sequence);

    // Convert args manually
    let value = BigInt(100);
    const lo = value & 0xffffffffffffffffn;
    const hi = (value >> 64n) & 0xffffffffffffffffn;
    const totalEscrowScVal = xdr.ScVal.scvI128(
      new xdr.Int128Parts({
        lo: xdr.Uint64.fromString(lo.toString()),
        hi: xdr.Int64.fromString(hi.toString()),
      })
    );

    const args = [
      Address.fromString(senderAddress).toScVal(),
      Address.fromString(senderAddress).toScVal(),
      xdr.ScVal.scvString('Test Project'),
      xdr.ScVal.scvString('Test Description'),
      totalEscrowScVal,
      xdr.ScVal.scvU32(1)
    ];

    const operation = Operation.invokeContractFunction({
      contract: ESCROW_CONTRACT_ID,
      function: 'create_project',
      args: args,
    });

    const transaction = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
    .addOperation(operation)
    .setTimeout(300)
    .build();

    console.log('Simulating transaction...');
    const preparedTx = await rpcServer.prepareTransaction(transaction);
    console.log('Simulation success! Prepared TX fee:', preparedTx.fee);
  } catch (err) {
    console.error('Simulation failed with error:', err);
  }
}

main();
