import type { KycStatus, Transaction, User } from "./types";

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

const USERS: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    kyc_status: "Approved",
    balance: 15230.45,
    last_login: "2025-10-03T08:24:00Z",
    country: "US",
    joined_at: "2024-01-12T10:00:00Z",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    kyc_status: "Pending",
    balance: 340.22,
    last_login: "2025-10-04T14:40:00Z",
    country: "India",
    joined_at: "2024-03-21T15:20:00Z",
  },
];

const countries = ["US", "India", "UK", "Germany", "Brazil", "Japan", "Canada"];
const names = [
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Hank",
  "Ivy",
  "Jack",
  "Karen",
  "Leo",
  "Mona",
  "Nate",
  "Olivia",
];
for (let i = 3; i <= 50; i++) {
  const name = `${names[i % names.length]} ${
    ["Lee", "Chen", "Garcia", "Patel", "Khan", "Brown", "O'Neil"][i % 7]
  }`;
  USERS.push({
    id: i,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
    kyc_status: (["Pending", "Approved", "Rejected"] as KycStatus[])[i % 3],
    balance: Math.round((Math.random() * 50000 + i * 37) * 100) / 100,
    last_login: new Date(
      Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30
    ).toISOString(),
    country: countries[i % countries.length],
    joined_at: new Date(
      Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365
    ).toISOString(),
  });
}

const txTypes = ["Deposit", "Withdraw"] as const;
const assets = ["USDT", "BTC", "ETH"] as const;
const TRANSACTIONS: Transaction[] = [];
let txId = 100;
for (const u of USERS) {
  const count = 5 + (u.id % 6);
  for (let j = 0; j < count; j++) {
    TRANSACTIONS.push({
      id: txId++,
      user_id: u.id,
      date: new Date(
        Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 14
      ).toISOString(),
      type: txTypes[j % txTypes.length],
      asset: assets[j % assets.length],
      amount: Number((Math.random() * (u.balance / 10)).toFixed(2)),
      status: (["Completed", "Pending", "Failed"] as const)[j % 3],
    });
  }
}

export async function listUsers(opts: {
  q?: string;
  kyc?: KycStatus;
  sortBy?: "balance" | "last_login";
  sortDir?: "asc" | "desc";
  page: number;
  pageSize: number;
}) {
  await delay(400 + Math.random() * 400);
  let filtered = USERS.filter((u) => !u.suspended);
  if (opts.q) {
    const q = opts.q.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }
  if (opts.kyc) {
    filtered = filtered.filter((u) => u.kyc_status === opts.kyc);
  }
  if (opts.sortBy) {
    filtered = filtered.slice().sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (opts.sortBy === "balance") {
        av = a.balance;
        bv = b.balance;
      }
      if (opts.sortBy === "last_login") {
        av = a.last_login;
        bv = b.last_login;
      }
      if (opts.sortBy === "last_login") {
        const ad = new Date(String(av)).getTime();
        const bd = new Date(String(bv)).getTime();
        return opts.sortDir === "asc" ? ad - bd : bd - ad;
      }
      return opts.sortDir === "asc"
        ? Number(av) - Number(bv)
        : Number(bv) - Number(av);
    });
  }
  const total = filtered.length;
  const start = (opts.page - 1) * opts.pageSize;
  const items = filtered.slice(start, start + opts.pageSize);
  return { items, total };
}

export async function getUser(id: number) {
  await delay(300 + Math.random() * 300);
  const user = USERS.find((u) => u.id === id);
  if (!user) return null;
  return user;
}

export async function updateUserKyc(id: number, kyc: KycStatus) {
  await delay(350 + Math.random() * 350);
  const user = USERS.find((u) => u.id === id);
  if (!user) throw new Error("not found");
  user.kyc_status = kyc;
  return user;
}

export async function suspendUser(id: number) {
  await delay(500 + Math.random() * 500);
  const user = USERS.find((u) => u.id === id);
  if (!user) throw new Error("not found");
  user.suspended = true;
}

export async function getUserTransactions(id: number) {
  await delay(350 + Math.random() * 450);
  return TRANSACTIONS.filter((t) => t.user_id === id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function computeBalances(user: User) {
  const btc = Number((user.balance / 60000).toFixed(4));
  const eth = Number((user.balance / 3000).toFixed(3));
  const usdt = Number((user.balance * 0.1).toFixed(2));
  return [
    { asset: "BTC" as const, amount: btc },
    { asset: "ETH" as const, amount: eth },
    { asset: "USDT" as const, amount: usdt },
  ];
}
