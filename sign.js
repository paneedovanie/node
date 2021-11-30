const
  Encryption = require('./src/helpers/encryption.helper'),
  transaction = require('./src/models/Transaction')

const main = async () => {
  const wallet = await Encryption.generateKeys()

  console.log(wallet)

  // let tx1 = new transaction({
  //   "to": "Him",
  //   "from": wallet.publicKey,
  //   "data": {
  //     "coin": {
  //       "type": "HYP",
  //       "value": 50
  //     }
  //   },
  // })

  // await tx1.sign(wallet.privateKey)

  // console.log(await tx1.isValid())

  // let tx2 = new transaction({ "txId": 0, "to": "Him", "from": "7830288e548544af4f085e5aec0f316a33763967a5234c09de1302b63ecf7693", "data": { "coin": { "type": "HYP", "value": 50 } }, "fee": 0.0002, "timestamp": 1637896605996, "hash": "5b510db2dda1e52ada0fbfe29e8bf078fa78a0910bd15104faf117c82ecf0a51", "signature": "e4e343157fcf4bfe6552e26b42a6be9a200865251ce0212778d145100cc255f246af06a8fcaf11c50e2b667f2f952346646720b25bec29494e120cdb049b2c01" })

  // console.log(await tx2.isValid())
}

main()