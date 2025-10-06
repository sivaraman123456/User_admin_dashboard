import { NextResponse } from "next/server"
import { computeBalances, getUser, suspendUser, updateUserKyc } from "@/lib/mock-db"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const user = await getUser(id)
  if (!user) return NextResponse.json({ error: "not found" }, { status: 404 })
  const balances = computeBalances(user)
  return NextResponse.json({ user, balances, transactions: [] })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const body = await req.json().catch(() => ({}))
  const kyc = body?.kyc_status
  if (!kyc) return NextResponse.json({ error: "kyc required" }, { status: 400 })
  try {
    const user = await updateUserKyc(id, kyc)
    const balances = computeBalances(user)
    return NextResponse.json({ user, balances, transactions: [] })
  } catch {
    return NextResponse.json({ error: "update failed" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const body = await req.json().catch(() => ({}))
  if (body?.action !== "suspend") return NextResponse.json({ error: "invalid action" }, { status: 400 })
  try {
    await suspendUser(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "suspend failed" }, { status: 500 })
  }
}
