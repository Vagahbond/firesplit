import { FiresplitError } from "../errors";


export class NoUsersRegisteredError extends FiresplitError {
  constructor() {
    super("No users registered on the firefly debt tracker.", 404);
  }
}

export class FireflyUserNotFoundError extends FiresplitError {
  constructor(user: { email?: string, id?: number }) {
    if (user.email) {
      super(`Firefly user with email ${user.email} not found.`, 404);
    } else if (user.id) {
      super(`Firefly user with id ${user.id} not found.`, 404);
    }
  }
}


export class LocalUserNotFoundError extends FiresplitError {
  constructor(email: string) {
    super(`User with email ${email} has not registered their token in Firesplit.`, 404);
  }
}

export class DebtAcccountNotCreatedError extends FiresplitError {
  constructor(accountName: string, ownerEmail: string) {
    super(`Debt account ${accountName} for ${ownerEmail} could not been created.`, 404);
  }
}

export class UserPreparationError extends FiresplitError {
  constructor(message: string) {
    super(message);
  }
}




