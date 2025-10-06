export type KycStatus = "Pending" | "Approved" | "Rejected"

export type User = {
  id: number
  name: string
  email: string
  kyc_status: KycStatus
  balance: number
  last_login: string
  country: string
  joined_at: string
  suspended?: boolean
}

export type Transaction = {
  id: number
  user_id: number
  date: string
  type: "Deposit" | "Withdraw"
  asset: "BTC" | "ETH" | "USDT"
  amount: number
  status: "Completed" | "Pending" | "Failed"
}

export type UserListResponse = {
  items: User[]
  total: number
  page: number
  pageSize: number
}

export type UserDetailResponse = {
  user: User
  balances: { asset: "BTC" | "ETH" | "USDT"; amount: number }[]
  transactions: Transaction[]
}
