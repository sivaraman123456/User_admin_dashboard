import { NextResponse } from "next/server"
import { listUsers } from "@/lib/mock-db"
import type { KycStatus } from "@/lib/types"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || undefined
  const kycParam = searchParams.get("kyc") as KycStatus | null
  const kyc = kycParam && ["Pending", "Approved", "Rejected"].includes(kycParam) ? (kycParam as KycStatus) : undefined
  const sortBy = (searchParams.get("sortBy") || "") as "balance" | "last_login" | ""
  const sortDir = (searchParams.get("sortDir") || "desc") as "asc" | "desc"
  const page = Number(searchParams.get("page") || "1")
  const pageSize = Number(searchParams.get("pageSize") || "10")

  try {
    const { items, total } = await listUsers({
      q,
      kyc,
      sortBy: sortBy || undefined,
      sortDir,
      page,
      pageSize,
    })
    return NextResponse.json({ items, total, page, pageSize })
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
