import { NextResponse } from "next/server"
import { getUserTransactions } from "@/lib/mock-db"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  try {
    const items = await getUserTransactions(id)
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
