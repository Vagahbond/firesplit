import { SQL } from "bun";
import type { User } from "./entities";

const db = new SQL(process.env.DATABASE_URL ?? "postgres://localhost:5432/firefly-iii");

export async function getUserById(id: number): Promise<User | undefined> {

  const user = await db`SELECT * FROM users WHERE id = ${id}`

  if (!user.length)
    return undefined;

  return user[0];
}

export async function getDebtsForUser(email: string): Promise<void> {
  const debts = await db`
    SELECT  
      transactions.id as transaction_id,
      transaction_journals.id as transaction_journal_id,
      users.email as payer_email,
      accounts.name as source_account,
      tags.tag as tag,
      SUBSTRING(tags.tag, 8) as payee_email,
      transaction_journals.date as date,
      grouped_payees.nb_payees as nb_payees,
      transactions.amount as original_amount,
      CASE 
        WHEN users.email = ${email} THEN 0 - (transactions.amount / (grouped_payees.nb_payees + 1))
        ELSE transactions.amount / (grouped_payees.nb_payees + 1)
      END as amount
    FROM transactions
      INNER JOIN transaction_journals ON transaction_journals.id = transactions.transaction_journal_id
      INNER JOIN users ON users.id = transaction_journals.user_id
      INNER JOIN accounts ON accounts.id = transactions.account_id
      INNER JOIN tag_transaction_journal ON tag_transaction_journal.transaction_journal_id = transaction_journals.id
      INNER JOIN tags ON tags.id = tag_transaction_journal.tag_id
      INNER JOIN (
        SELECT 
          COUNT(tags.tag) as nb_payees,
          transaction_journals.id as transaction_journal_id
        FROM tags 
          INNER JOIN tag_transaction_journal ON tag_transaction_journal.tag_id = tags.id 
          INNER JOIN transaction_journals ON transaction_journals.id = tag_transaction_journal.transaction_journal_id 
        WHERE tags.tag LIKE 'shared:%'
        GROUP BY transaction_journals.id
      ) as grouped_payees ON grouped_payees.transaction_journal_id = transaction_journals.id
    WHERE tags.tag LIKE 'shared:%' 
      AND (
         users.email = ${email} OR SUBSTRING(tags.tag, 8) = ${email} 
       ) 
      AND transactions.balance_after < transactions.balance_before
  `

  const allTransactions = await db`
  SELECT * FROM transaction_journals  
`

  console.log(debts)

}

