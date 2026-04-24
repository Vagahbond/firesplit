
export class FiresplitError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(JSON.stringify({ service: "Firesplit", error: message, time: new Date().toISOString() }));
    this.status = status;
  }
}
