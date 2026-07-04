import { xdr } from 'stellar-sdk';

try {
  let value = BigInt(100);
  const lo = value & 0xffffffffffffffffn;
  const hi = (value >> 64n) & 0xffffffffffffffffn;
  console.log('lo:', lo.toString(), 'hi:', hi.toString());
  
  const val = xdr.ScVal.scvI128(
    new xdr.Int128Parts({
      lo: xdr.Uint64.fromString(lo.toString()),
      hi: xdr.Int64.fromString(hi.toString()),
    })
  );
  console.log('Construction succeeded!', val);
} catch (err) {
  console.error('Construction failed:', err);
}
