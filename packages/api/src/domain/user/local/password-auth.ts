import crypto from 'node:crypto'

export function comparePasswords(
  storedPasswordHash: string,
  inputPasswordHash: string,
) {
  const storedBuffer = Buffer.from(storedPasswordHash, 'hex')
  const inputBuffer = Buffer.from(inputPasswordHash, 'hex')

  try {
    return crypto.timingSafeEqual(storedBuffer, inputBuffer)
  } catch {
    return false
  }
}

export function hashPassword(password: string, salt: string) {
  const keyLength = 64
  const costFactor = 16384
  const blockSizeFactor = 8
  const parallelizationFactor = 1

  const saltBuffer = Buffer.from(salt, 'utf8')

  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(
      password,
      saltBuffer,
      keyLength,
      { N: costFactor, p: parallelizationFactor, r: blockSizeFactor },
      (err, derivedKey) => {
        if (err) {
          reject(err)
        } else {
          resolve(derivedKey.toString('hex'))
        }
      },
    )
  })
}
