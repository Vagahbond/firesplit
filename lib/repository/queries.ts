import { sql } from "bun";
import type { User } from "../entities";
import type { Currency } from "./entities";

export const SHARED_TAG_PREFIX = 'shared:';
export const EMAIL_REGEX = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$";


export const GROUPED_PAYEES_QUERY = sql`
    SELECT                                                             
      COUNT(tags.tag) as nb_payees,                                    
      transaction_journals.id as transaction_journal_id                
    FROM tags                                                          
      INNER JOIN tag_transaction_journal ON tag_transaction_journal.   
    tag_id = tags.id                                                   
      INNER JOIN transaction_journals ON transaction_journals.id =     
    tag_transaction_journal.transaction_journal_id                     
    WHERE tags.tag LIKE ${SHARED_TAG_PREFIX + "%"}::text                        
    GROUP BY transaction_journals.id                                   
`;



export function debtQuery(user: User, peerEmail?: string,) {
  let baseQuery = sql`
  WITH currencies AS (
  ${currenciesQuery(user.id)}
  ), grouped_payees AS (
    ${GROUPED_PAYEES_QUERY}
  )
SELECT  
    transactions.id as transaction_id,
    transaction_journals.id as transaction_journal_id,
    transaction_journals.description as description,
    users.email as payer_email,
    accounts.name as source_account,
    tags.tag as tag,
    SUBSTRING(tags.tag, ${SHARED_TAG_PREFIX.length + 1}) as payee_email,
    transaction_journals.date as date,
    grouped_payees.nb_payees as nb_payees,
    transactions.amount as original_amount,
    currencies.to_currency_symbol as currency_symbol,
    currencies.to_currency_code as currency_code,
    currencies.rate as currency_rate,
    CASE 
      WHEN users.email = ${user.email} THEN (transactions.amount / (grouped_payees.nb_payees + 1))
      ELSE 0 - (transactions.amount / (grouped_payees.nb_payees + 1))
    END as amount,
    CASE
      WHEN users.email = ${user.email} THEN (transactions.amount / (grouped_payees.nb_payees + 1)) * (1/currencies.rate)
      ELSE 0 - (transactions.amount / (grouped_payees.nb_payees + 1)) * (1/currencies.rate)
    END as normalized_amount
  FROM transactions
    INNER JOIN transaction_journals ON transaction_journals.id = transactions.transaction_journal_id
    INNER JOIN users ON users.id = transaction_journals.user_id
    INNER JOIN accounts ON accounts.id = transactions.account_id
    INNER JOIN tag_transaction_journal ON tag_transaction_journal.transaction_journal_id = transaction_journals.id
    INNER JOIN tags ON tags.id = tag_transaction_journal.tag_id
    INNER JOIN grouped_payees ON grouped_payees.transaction_journal_id = transaction_journals.id
    INNER JOIN currencies ON currencies.to_currency_id = transaction_journals.transaction_currency_id
  WHERE tags.tag LIKE ${SHARED_TAG_PREFIX + "%"}::text 
    AND transactions.balance_after < transactions.balance_before
`

  if (user.email) {
    baseQuery = sql`${baseQuery} AND (users.email = ${user.email} OR SUBSTRING(tags.tag, ${SHARED_TAG_PREFIX.length + 1}) = ${user.email})`
  }

  if (peerEmail) {
    baseQuery = sql`${baseQuery} AND (users.email = ${peerEmail} OR SUBSTRING(tags.tag, ${SHARED_TAG_PREFIX.length + 1}) = ${peerEmail})`
  }

  return baseQuery
}

export function reimbursementQuery(user: User, peerEmail?: string) {

  let baseQuery = sql` 
  WITH currencies AS (
  ${currenciesQuery(user.id)} 
  ), grouped_payees AS (
    ${GROUPED_PAYEES_QUERY}
  )
  SELECT
    transactions.id as transaction_id,
    transaction_journals.id as transaction_journal_id,
    transaction_journals.description as description,
    transaction_journals.date as date,
    users.email as payer_email,
    accounts.name as account_name,
    currencies.to_currency_symbol as currency_symbol,
    currencies.to_currency_code as currency_code,
    currencies.rate as currency_rate,
    transactions.amount as original_amount,
    CASE 
      WHEN users.email = ${user.email} THEN 0 - transactions.amount 
      ELSE transactions.amount 
    END as amount,
    CASE 
      WHEN users.email = ${user.email} THEN 0 - transactions.amount  * (1/currencies.rate)
      ELSE  transactions.amount * (1/currencies.rate)
    END as normalized_amount
  FROM transactions
    INNER JOIN transaction_journals ON transaction_journals.id = transactions.transaction_journal_id
    INNER JOIN users ON users.id = transaction_journals.user_id
    INNER JOIN accounts ON accounts.id = transactions.account_id
    INNER JOIN currencies ON currencies.to_currency_id = transaction_journals.transaction_currency_id 
 WHERE accounts.name ~ ${EMAIL_REGEX} 
    AND transactions.balance_after > transactions.balance_before
`
  if (user.email) {
    baseQuery = sql`${baseQuery} AND (users.email = ${user.email} OR accounts.name = ${user.email})`
  }

  if (peerEmail) {
    baseQuery = sql`${baseQuery} AND (users.email = ${peerEmail} OR accounts.name = ${peerEmail})`
  }

  return baseQuery
}


export function balancesQuery(currency: Currency, user: User) {
  return sql`
  WITH debts AS (
    ${debtQuery(user)}
), reimbursements AS (
  ${reimbursementQuery(user)}
)
  SELECT
    SUM(balance) as balance,
    email
  FROM (
    SELECT 
      SUM(normalized_amount) as balance,
      CASE
        WHEN debts.payer_email = ${user.email} THEN debts.payee_email
        ELSE debts.payer_email
      END as email
    FROM debts
    GROUP BY email  
  UNION ALL  
    SELECT
      SUM(normalized_amount) as balance,
      CASE
        WHEN reimbursements.payer_email = ${user.email} THEN reimbursements.account_name
        ELSE reimbursements.payer_email
      END as email
    FROM reimbursements
  GROUP BY email) 
GROUP BY email
`
}

export function currenciesQuery(userId: number) {
  return sql`
  SELECT DISTINCT ON (from_currency.id, to_currency.id) 
    from_currency.id as currency_id,
    from_currency.code as currency_code,
    from_currency.name as currency_name,
    from_currency.symbol as currency_symbol,
    to_currency.id as to_currency_id,
    to_currency.code as to_currency_code,
    to_currency.name as to_currency_name,
    to_currency.symbol as to_currency_symbol,
    exchange_rates.rate as rate,
    exchange_rates.id as exchange_rate_id, 
    exchange_rates.user_id as user_id
FROM transaction_currencies AS from_currency  
  INNER JOIN currency_exchange_rates AS exchange_rates ON from_currency.id = from_currency_id
  INNER JOIN transaction_currencies AS to_currency ON to_currency.id = exchange_rates.to_currency_id
WHERE from_currency.code ILIKE 'EUR'
AND exchange_rates.user_id = ${userId}
AND to_currency.enabled IS TRUE
ORDER BY from_currency.id, to_currency.id, exchange_rates.date DESC
`

}
