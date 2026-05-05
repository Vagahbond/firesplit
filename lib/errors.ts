export class MalformedTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MalformedTokenError";
  }
}

export class CryptographicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CryptographicError";
  }
}
