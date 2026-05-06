export class FireSplitError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "FireSplitError";
    this.status = status;
  }
}

export class MalformedTokenError extends FireSplitError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class CryptographicError extends FireSplitError {
  constructor(message: string) {
    super(message, 401);
  }
}
