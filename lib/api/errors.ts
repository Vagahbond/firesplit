import { FiresplitError } from "../errors";

export class ApiError extends FiresplitError {
  constructor(message: string, status: number = 500) {
    super(message, status);
  }
}
