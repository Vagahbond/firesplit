import { sql } from "bun";

export const SHARED_TAG_PREFIX = 'shared:';
export const EMAIL_REGEX = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$";


export const GROUPED_PAYEES_CTE = sql`
  WITH grouped_payees AS (                                             
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
  )                                                                    
`;

export function debtQuery(userEmail?: string, peerEmail?: string) {
  let baseQuery = sql`
SELECT  
    transactions.id as transaction_id,
    transaction_journals.id as transaction_journal_id,
    transaction_journals.description as description,
    users.email as payer_email,
    accounts.name as source_account,
    transaction_currencies.name as currency_name,
    transaction_currencies.symbol as currency_symbol,
    transaction_currencies.code as currency_code,
    tags.tag as tag,
    SUBSTRING(tags.tag, ${SHARED_TAG_PREFIX.length + 1}) as payee_email,
    transaction_journals.date as date,
    grouped_payees.nb_payees as nb_payees,
    transactions.amount as original_amount,
    CASE 
      WHEN users.email = ${userEmail} THEN (transactions.amount / (grouped_payees.nb_payees + 1))
      ELSE 0 - (transactions.amount / (grouped_payees.nb_payees + 1))
    END as amount
  FROM transactions
    INNER JOIN transaction_journals ON transaction_journals.id = transactions.transaction_journal_id
    INNER JOIN users ON users.id = transaction_journals.user_id
    INNER JOIN accounts ON accounts.id = transactions.account_id
    INNER JOIN tag_transaction_journal ON tag_transaction_journal.transaction_journal_id = transaction_journals.id
    INNER JOIN tags ON tags.id = tag_transaction_journal.tag_id
    INNER JOIN grouped_payees ON grouped_payees.transaction_journal_id = transaction_journals.id
    INNER JOIN transaction_currencies ON transaction_currencies.id = transaction_journals.transaction_currency_id
    INNER JOIN currency_exchange_rates ON currency_exchange_rates.from_currency_id = transaction_journals.transaction_currency_id
  WHERE tags.tag LIKE ${SHARED_TAG_PREFIX + "%"}::text 
    AND transactions.balance_after < transactions.balance_before
`

  if (userEmail) {
    baseQuery = sql`${baseQuery} AND (users.email = ${userEmail} OR SUBSTRING(tags.tag, ${SHARED_TAG_PREFIX.length + 1}) = ${userEmail})`
  }

  if (peerEmail) {
    baseQuery = sql`${baseQuery} AND (users.email = ${peerEmail} OR SUBSTRING(tags.tag, ${SHARED_TAG_PREFIX.length + 1}) = ${peerEmail})`
  }

  return baseQuery
}

export function reimbursementQuery(userEmail?: string, peerEmail?: string) {

  let baseQuery = sql` 
  SELECT
    transactions.id as transaction_id,
    transaction_journals.id as transaction_journal_id,
    transaction_journals.description as description,
    transaction_journals.date as date,
    users.email as payer_email,
    accounts.name as account_name,
    transaction_currencies.name as currency_name,
    transaction_currencies.symbol as currency_symbol,
    transaction_currencies.code as currency_code,
    transactions.amount as original_amount,
    CASE 
      WHEN users.email = ${userEmail} THEN 0 - transactions.amount 
      ELSE transactions.amount 
    END as amount
  FROM transactions
    INNER JOIN transaction_journals ON transaction_journals.id = transactions.transaction_journal_id
    INNER JOIN users ON users.id = transaction_journals.user_id
    INNER JOIN accounts ON accounts.id = transactions.account_id
    INNER JOIN transaction_currencies ON transaction_currencies.id = transaction_journals.transaction_currency_id
    INNER JOIN currency_exchange_rates ON currency_exchange_rates.from_currency_id = transaction_journals.transaction_currency_id
 WHERE accounts.name ~ ${EMAIL_REGEX} 
    AND transactions.balance_after > transactions.balance_before
`
  if (userEmail) {
    baseQuery = sql`${baseQuery} AND (users.email = ${userEmail} OR accounts.name = ${userEmail})`
  }

  if (peerEmail) {
    baseQuery = sql`${baseQuery} AND (users.email = ${peerEmail} OR accounts.name = ${peerEmail})`
  }

  return baseQuery
}


export function balancesQuery(email: string) {
  return sql`
  SELECT
    SUM(balance) as balance,
    email
  FROM (
    SELECT 
      SUM(amount) as balance,
      CASE
        WHEN debts.payer_email = ${email} THEN debts.payee_email
        ELSE debts.payer_email
      END as email
    FROM (
      ${debtQuery(email)} 
    ) as debts
    GROUP BY email  
  UNION ALL  
    SELECT
      SUM(amount) as balance,
      CASE
        WHEN reimbursements.payer_email = ${email} THEN reimbursements.account_name
        ELSE reimbursements.payer_email
      END as email
    FROM (
      ${reimbursementQuery(email)} 
    ) as reimbursements
  GROUP BY email) 
GROUP BY email
`
}

export function currenciesQuery(referenceCurrency: string, userId: number) {
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
    exchange_rates.user_id as useR_id
FROM transaction_currencies AS from_currency  
  INNER JOIN currency_exchange_rates AS exchange_rates ON from_currency.id = from_currency_id
  INNER JOIN transaction_currencies AS to_currency ON to_currency.id = exchange_rates.to_currency_id
WHERE from_currency.code ILIKE 'EUR'
AND exchange_rates.user_id = ${userId}
AND to_currency.enabled IS TRUE
ORDER BY from_currency.id, to_currency.id, exchange_rates.date DESC
`

}
