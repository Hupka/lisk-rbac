/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import { getNetworkIdentifier, hexToBuffer } from "@liskhq/lisk-cryptography";
import { signTransaction } from "@liskhq/lisk-transactions";
import { createRoleAssetPropsSchema } from "../../src/schemas";

const newRole = {
  name: "NFT-Artist",
  description: "A registered NFT artist.",
  inheritance: []
}

const networkIdentifier = getNetworkIdentifier(
  hexToBuffer("23ce0366ef0a14a91e5fd4b1591fc880ffbef9d988ff8bebf8f3666b0c09597d"),
  "Lisk",
);

const passphrase = "peanut hundred pen hawk invite exclude brain chunk gadget wait wrong ready"

const signedTransaction = signTransaction(createRoleAssetPropsSchema,newRole,networkIdentifier,passphrase)

console.log(signedTransaction);
