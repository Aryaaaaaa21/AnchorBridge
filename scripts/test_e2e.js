import { rpc, Operation, TransactionBuilder, Address, xdr, Account, Keypair, scValToNative } from 'stellar-sdk';

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';
const ESCROW_CONTRACT_ID = 'CCLPZ52ADXP4WJXP37Y7EQVMROX7HMFLF7AMIVEEMIVOPRBFEYGBBA27';

// Developer key (admin/client) details
// Address: GCQK2KUE6UAYMTVZ334WMTLDY3XP3JAQ24NE2I6W5WXXQFVZF4EAN5YP
// Secret key: we need to look it up or generate a new keypair and fund it.
// Wait, we can get developer's secret key from stellar-cli identity!
// Let's read it or check if stellar-cli has it.

import { execSync } from 'child_process';

function getDeveloperSecret() {
  try {
    const output = execSync('stellar keys show developer', { encoding: 'utf8' });
    return output.trim();
  } catch (err) {
    console.error('Failed to get developer secret:', err.message);
    return null;
  }
}

const developerSecret = getDeveloperSecret();
if (!developerSecret) {
  console.error('Could not retrieve developer secret. Exiting.');
  process.exit(1);
}

const clientKeypair = Keypair.fromSecret(developerSecret);
const clientAddress = clientKeypair.publicKey();
console.log('Client Address:', clientAddress);

// Let's generate a temporary freelancer keypair so client and freelancer are different!
const freelancerKeypair = Keypair.random();
const freelancerAddress = freelancerKeypair.publicKey();
console.log('Freelancer Address:', freelancerAddress);

const rpcServer = new rpc.Server(RPC_URL);

// Helper to serialize ScVal arguments (copied from stellar.ts)
function serializeArgs(functionName, args) {
  const paramLayouts = {
    create_project: ['address', 'address', 'string', 'string', 'i128', 'u32'],
    create_milestone: ['address', 'u64', 'u32', 'string', 'i128', 'u64'],
    fund_project: ['address', 'u64'],
    submit_milestone: ['address', 'u64', 'u32', 'string'],
    approve_milestone: ['address', 'u64', 'u32'],
    reject_milestone: ['address', 'u64', 'u32'],
    dispute_milestone: ['address', 'u64', 'u32', 'string'],
    refund_client: ['address', 'u64'],
    cancel_project: ['address', 'u64']
  };

  const layout = paramLayouts[functionName];
  return args.map((arg, idx) => {
    const expectedType = layout ? layout[idx] : undefined;

    if (expectedType === 'address') {
      return Address.fromString(arg.toString()).toScVal();
    }
    if (expectedType === 'u32') {
      return xdr.ScVal.scvU32(Number(arg));
    }
    if (expectedType === 'u64') {
      return xdr.ScVal.scvU64(xdr.Uint64.fromString(arg.toString()));
    }
    if (expectedType === 'i128') {
      let value = BigInt(arg);
      if (value < 0n) value = value + (1n << 128n);
      const lo = value & 0xffffffffffffffffn;
      const hi = (value >> 64n) & 0xffffffffffffffffn;
      return xdr.ScVal.scvI128(
        new xdr.Int128Parts({
          lo: xdr.Uint64.fromString(lo.toString()),
          hi: xdr.Int64.fromString(hi.toString()),
        })
      );
    }
    if (expectedType === 'bool') {
      return xdr.ScVal.scvBool(!!arg);
    }
    if (expectedType === 'string') {
      return xdr.ScVal.scvString(arg.toString());
    }
    return xdr.ScVal.scvString(arg.toString());
  });
}

async function invokeContract(keypair, functionName, args) {
  console.log(`\n--- Invoking ${functionName} ---`);
  const senderAddress = keypair.publicKey();
  
  // Load account to get sequence number
  const accountResponse = await fetch(`https://horizon-testnet.stellar.org/accounts/${senderAddress}`);
  if (!accountResponse.ok) {
    throw new Error(`Failed to load account details for ${senderAddress}`);
  }
  const accountData = await accountResponse.json();
  const account = new Account(senderAddress, accountData.sequence);

  const scValArgs = serializeArgs(functionName, args);

  const operation = Operation.invokeContractFunction({
    contract: ESCROW_CONTRACT_ID,
    function: functionName,
    args: scValArgs,
  });

  const transaction = new TransactionBuilder(account, {
    fee: '100000',
    networkPassphrase: NETWORK_PASSPHRASE,
  })
  .addOperation(operation)
  .setTimeout(300)
  .build();

  const preparedTx = await rpcServer.prepareTransaction(transaction);
  preparedTx.sign(keypair);
  
  console.log('Sending transaction...');
  const submitResult = await rpcServer.sendTransaction(preparedTx);
  if (submitResult.status === 'ERROR') {
    throw new Error(`RPC submit error: ${JSON.stringify(submitResult)}`);
  }

  console.log(`Transaction sent. Hash: ${submitResult.hash}. Polling status...`);
  let txStatus = await rpcServer.getTransaction(submitResult.hash);
  let checkCount = 0;
  while ((txStatus.status === 'PENDING' || txStatus.status === 'NOT_FOUND') && checkCount < 30) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    txStatus = await rpcServer.getTransaction(submitResult.hash);
    checkCount++;
  }

  if (txStatus.status === 'SUCCESS') {
    console.log('Success!');
    let returnValue = undefined;
    if (txStatus.returnValue) {
      returnValue = scValToNative(txStatus.returnValue);
      console.log('Returned value:', returnValue);
    }
    return { txHash: submitResult.hash, returnValue };
  } else {
    throw new Error(`Transaction failed with status: ${txStatus.status}`);
  }
}

async function main() {
  try {
    // 1. Create Project
    const createRes = await invokeContract(clientKeypair, 'create_project', [
      clientAddress,
      freelancerAddress,
      'E2E Web App Dev',
      'Full-stack escrow app',
      100n, // total_escrow (100 stroops or whatever unit)
      1     // milestone_count
    ]);
    const projectId = createRes.returnValue;

    // 2. Create Milestone
    await invokeContract(clientKeypair, 'create_milestone', [
      clientAddress,
      projectId,
      0,
      'Milestone 1: Prototype',
      100n,
      BigInt(Math.floor(Date.now() / 1000) + 3600)
    ]);

    // 3. Fund Project
    await invokeContract(clientKeypair, 'fund_project', [
      clientAddress,
      projectId
    ]);

    // Need to fund freelancer account slightly so it can submit transaction
    console.log('\nFunding freelancer account so it can pay transaction fees...');
    const fundUrl = `https://friendbot.stellar.org?addr=${freelancerAddress}`;
    const fundResponse = await fetch(fundUrl);
    if (fundResponse.ok) {
      console.log('Freelancer account funded via Friendbot.');
    } else {
      console.log('Friendbot funding failed. Freelancer might not be able to submit transaction.');
    }

    // Wait for friendbot to propagate
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // 4. Submit Milestone (called by freelancer)
    await invokeContract(freelancerKeypair, 'submit_milestone', [
      freelancerAddress,
      projectId,
      0,
      'Prototype completed. Repository URL: https://github.com/test'
    ]);

    // 5. Approve Milestone (called by client)
    await invokeContract(clientKeypair, 'approve_milestone', [
      clientAddress,
      projectId,
      0
    ]);

    console.log('\n======================================');
    console.log('E2E CONTRACT LIFE CYCLE WORKFLOW SUCCESSFUL!');
    console.log('======================================');
  } catch (err) {
    console.error('E2E Workflow failed:', err);
  }
}

main();
