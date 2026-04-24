export interface PreparedUser {
  email: string;
  token: string;
  id: string;
}


export interface PreparedTransaction {
  id: string;
  amount: number;
  currency_id: string;
  date: Date;
  description: string;
  payee: PreparedUser[]
  payer: PreparedUser;
}
