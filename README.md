# Firesplit

## Why ? 
I wanted to have a way to manage my personal finances, however my partner and I are sharing some expenses and would like to keep track of the balance between us.
Firesplit Looks at the transactions created in Firefly III and counts who owes what to who



User stories: 

Init:
In the UI, you give an API token and Firesplit figures out the rest

Create shared transaction:
All users taking part in a transaction are added with a "shared" prefix un tags. 
Example: "shared:vagahbond@pm.me"
This will be picked up by Firesplit

Check how much I owe someone
Hop on "debt.vagahbond.com" and give your token.
The homepage shows you all your balances.

Settle a debt
In firefly, make a payment to an account that bears the e-mail of the person you want to break debt with.
The other person has to add as an "income" form an account that bears your e-mail address as the name so that their firefly account does not get messed up.
Debt will be taking this payment in account, and conveniently Firefly will also count this money going out of your wallet.



Interface information:
List of available E-mail you can put in your tags. 
List of errors that occured last run (URL to the transaction so you can fix that).
Small guide on how to do share transaction
List of people that have shared transaction with you, and a balance of how much you owe each one.
