import { Database } from "bun:sqlite";
import { DATA_DIR } from "./config";


export interface LocalDbUser {
  token: string;
  email: string;
  createdAt: string;
}


const db = new Database(`${DATA_DIR}/users.sqlite`, { create: true });

db.query("CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, token TEXT NOT NULL, createdAt TEXT NOT NULL)").run();


export function getLocalUsers(): LocalDbUser[] {

  const users = db.query("SELECT * FROM users").all() as LocalDbUser[];
  return users;
}

export function addOrUpdateLocalUser(email: string, token: string) {
  const users = getLocalUsers();
  const user = users.find(u => u.email === email);

  if (user) {
    db.query("UPDATE users SET token = ? WHERE email = ?").run(token, email);
    return;
  }

  db.query("INSERT INTO users (email, token, createdAt) VALUES (?, ?, ?)")
    .run(email, token, new Date().toISOString());
}
