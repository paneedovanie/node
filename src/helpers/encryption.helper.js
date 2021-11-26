const
  {
    createCipheriv,
    createDecipheriv,
    createHash,
    randomBytes,
    randomFillSync,
    scryptSync,
  } = require('crypto'),
  ed = require('@noble/ed25519');

module.exports = class Encryption {
  static hash(algo, data, buff = "hex") {
    return createHash(algo).update(data).digest(buff)
  }

  static hashPassword(password, buff = "hex") {
    const salt = randomBytes(16).toString(buff),
      encrypted = scryptSync(password, salt, 64).toString(buff)

    return salt + ":" + encrypted
  }

  static verifyPassword(password, hash, buff = "hex") {
    const [salt, key] = hash.split(":"),
      encrypted = scryptSync(password, salt, 64).toString(buff)

    return encrypted === key
  }

  static simpleCipher(data, buff = "hex") {
    const algorithm = 'aes-192-cbc',
      salt = randomBytes(16).toString(buff),
      password = "Secret Password",
      key = scryptSync(password, salt, 24),
      iv = Buffer.alloc(16, 0),
      cipher = createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(data, 'utf8', buff);
    encrypted += cipher.final(buff);
    return salt + "/" + encrypted
  }

  static simpleDecipher(hash, buff = "hex") {
    const algorithm = 'aes-192-cbc',
      [salt, encrypted] = hash.split("/"),
      password = "Secret Password",
      key = scryptSync(password, salt, 24),
      iv = Buffer.alloc(16, 0),
      decipher = createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encrypted, buff, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static cipher(data, password, buff = "hex") {
    const algorithm = 'aes-192-cbc',
      salt = randomBytes(16).toString(buff),
      key = scryptSync(password, salt, 24),
      iv = randomFillSync(new Uint8Array(16)),
      cipher = createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(data, 'utf8', buff);
    encrypted += cipher.final(buff);
    return salt + ":" + encrypted + ":" + this.simpleCipher(Buffer.from(iv).toString("hex"))
  }

  static decipher(hash, password, buff = "hex") {
    const algorithm = 'aes-192-cbc',
      [salt, encrypted, encIv] = hash.split(":"),
      key = scryptSync(password, salt, 24),
      iv = Buffer.from(this.simpleDecipher(encIv), buff),
      decipher = createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encrypted, buff, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static async generateKeys() {
    const
      privateKey = ed.utils.randomPrivateKey(),
      publicKey = await ed.getPublicKey(privateKey)

    return { privateKey: Buffer.from(privateKey).toString('hex'), publicKey: Buffer.from(publicKey).toString('hex') }
  }

  static getPublicKey(privateKey) {
    return ed.getPublicKey(privateKey)
  }

  static sign(hash, privateKey) {
    return ed.sign(hash, privateKey)
  }

  static verify(signature, hash, publicKey) {
    return ed.verify(signature, hash, publicKey).then(null, (err) => {
      return false
    });
  }
}