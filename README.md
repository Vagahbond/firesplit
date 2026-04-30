# Firesplit

A webhook-based companion to the [Firefly III](https://firefly-iii.org) financial accounting software.

## Why ? 
I wanted to have a way to manage my personal finances, however my partner and I are sharing some expenses and would like to keep track of the balance between us.
Firesplit Listens to the transactions created in Firefly III and creates `virtual` accounts to keep track of the amount owed to or by you.

## How ?

### 1. Register your token

Generate a token in Firefly III by going to `Options > Profile > OAuth > Personal Access Tokens`.

Enter your Firefly token via the `user/register` endpoint.

```bash
curl -X POST http://localhost:3000/user/register -H "Content-Type: application/json" -d '{"token": "YOUR_FIREFLY_TOKEN"}'
```

> Note that the token is stored in a local sqlite database. 

> Note: Soon there should be a UI to do that.

After you register your token, your firefly account will have new webhooks created automatically.

### 2. Creating a shared expense 

To create a shared expense, create or update a transaction directly in Firefly III with a tag following this rule: 

`shared:email@example.com`

With `email@example.com` being the email of the person you want to share the expense with.

If that person does not have 1) a Firefly account or 2) a registered token in Firesplit, an error will occur and the transaction will not be processed.

Otherwise, a all of the people tagged this way will get : 
* an dedicated virtual `debt` account in firefly corresponding to their debt with you if it does not already exist
* a transaction in their `debt` account with the amount of the expense divided by the number of people tagged

And for each tagged person, you will get:
* an dedicated virtual `debt` account in firefly corresponding to your debt with them if it does not already exist
* a transaction in your `debt` account for that person with the amount of the expense divided by the number of people tagged

Each expense created in the dedicated `debt` accounts will have a coherent generated description and a reference to the original transaction baked into their tags.

> DO NOT MANUALLY EDIT THESE TRANSACTIONS.

### 3. Modifying transactions
Every time a transaction is modified or deleted, Firesplit will be called with the appropriate webhook, and update its related transactions in `debt` accounts automatically.

### 4. Scared something went wrong ? 

[not implemented yet]
Fire a request to the endpoint `/reconciliate/{your_email}` with the the e-mail you originally registered with.

Firesplit will then go through all of your `debt` account transactions and compare them with the original transactions in order to check for disparities.

It will use the actual, source transactions as source of truth, and will update the `debt` account transactions accordingly.



