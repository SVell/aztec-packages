import { BlockAttestation, BlockProposal, type TxHash } from '@aztec/circuit-types';
import { type Header } from '@aztec/circuits.js';
import { type Fr } from '@aztec/foundation/fields';

import { type ValidatorKeyStore } from '../key_store/interface.js';
import { serializeToBuffer } from '@aztec/foundation/serialize';

export class ValidationService {
  constructor(private keyStore: ValidatorKeyStore) {}

  /**
   * Create a block proposal with the given header, archive, and transactions
   *
   * @param header - The block header
   * @param archive - The archive of the current block
   * @param txs - TxHash[] ordered list of transactions
   *
   * @returns A block proposal signing the above information (not the current implementation!!!)
   */
  async createBlockProposal(header: Header, archive: Fr, txs: TxHash[]): Promise<BlockProposal> {
    // Note: just signing the archive for now
    const payload = serializeToBuffer([archive, txs]);
    const sig = await this.keyStore.sign(payload);

    return new BlockProposal(header, archive, txs, sig);
  }

  /**
   * Attest to the given block proposal constructed by the current sequencer
   *
   * @param proposal - The proposal to attest to
   * @returns attestation
   */
  async attestToProposal(proposal: BlockProposal): Promise<BlockAttestation> {
    // TODO(https://github.com/AztecProtocol/aztec-packages/issues/7961): check that the current validator is correct

    // TODO: in the function before this, check that all of the txns exist in the payload

    const buf = proposal.getPayload();
    const sig = await this.keyStore.sign(buf);
    return new BlockAttestation(proposal.header, proposal.archive, proposal.txs, sig);
  }
}