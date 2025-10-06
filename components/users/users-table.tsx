"use client"

import useSWR from "swr"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useUserListStore } from "@/stores/user-list-store"
import { fetcher } from "@/lib/fetcher"
import type { UserListResponse, KycStatus } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

const PAGE_SIZE_OPTIONS = [10, 20, 50]

export default function UsersTable() {
  const { toast } = useToast()
  const {
    q,
    kyc,
    sortBy,
    sortDir,
    page,
    pageSize,
    selected,
    setQuery,
    setKyc,
    setSort,
    setPage,
    setPageSize,
    clearSelection,
    toggleSelectAllVisible,
    toggleSelect,
  } = useUserListStore()

  const queryKey = useMemo(() => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (kyc && kyc !== "All") params.set("kyc", kyc)
    if (sortBy) {
      params.set("sortBy", sortBy)
      params.set("sortDir", sortDir)
    }
    params.set("page", String(page))
    params.set("pageSize", String(pageSize))
    return `/api/users?${params.toString()}`
  }, [q, kyc, sortBy, sortDir, page, pageSize])

  const { data, isLoading, error, mutate } = useSWR<UserListResponse>(queryKey, fetcher, {
    keepPreviousData: true,
  })

  useEffect(() => {
    setPage(1)
  }, [q, kyc])

  const allVisibleIds = (data?.items ?? []).map((u) => u.id)
  const allVisibleSelected = allVisibleIds.every((id) => selected.has(id)) && allVisibleIds.length > 0

  async function suspendUser(id: number) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suspend" }),
      })
      if (!res.ok) throw new Error("Failed to suspend")
      toast({ title: "User suspended", description: `User #${id} was suspended.` })
      mutate()
    } catch (e) {
      toast({ title: "Suspend failed", description: "Please try again.", variant: "destructive" })
    }
  }

  async function suspendSelected() {
    if (selected.size === 0) {
      toast({ title: "No users selected", description: "Select at least one user to suspend." })
      return
    }
    try {
      await Promise.all(
        [...selected].map((id) =>
          fetch(`/api/users/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "suspend" }),
          }),
        ),
      )
      toast({ title: "Suspended selected users", description: `${selected.size} users suspended.` })
      clearSelection()
      mutate()
    } catch {
      toast({ title: "Bulk suspend failed", description: "Please try again.", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="w-[220px]"
          />
          <Select value={kyc} onValueChange={(val) => setKyc(val as KycStatus | "All")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="KYC Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All KYC</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={suspendSelected}>
            Suspend Selected
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="w-10 px-3 py-2">
                  <Checkbox
                    checked={allVisibleSelected}
                    onCheckedChange={() => toggleSelectAllVisible(allVisibleIds)}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">KYC</th>
                <th className="px-3 py-2 font-medium">
                  <button
                    type="button"
                    onClick={() => setSort("balance")}
                    className="hover:underline"
                    aria-label="Sort by balance"
                  >
                    Balance (USD){sortBy === "balance" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
                <th className="px-3 py-2 font-medium">
                  <button
                    type="button"
                    onClick={() => setSort("last_login")}
                    className="hover:underline"
                    aria-label="Sort by last login"
                  >
                    Last Login{sortBy === "last_login" ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
                <th className="px-3 py-2 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`s-${i}`} className="border-t">
                    <td className="px-3 py-3">
                      <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-56 rounded bg-muted animate-pulse" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-6 w-20 rounded bg-muted animate-pulse" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="h-8 w-32 rounded bg-muted animate-pulse ml-auto" />
                    </td>
                  </tr>
                ))}

              {error && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    Failed to load users.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                data?.items.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-accent/40">
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={selected.has(u.id)}
                        onCheckedChange={() => toggleSelect(u.id)}
                        aria-label={`Select user ${u.name}`}
                      />
                    </td>
                    <td className="px-3 py-2">{u.name}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          u.kyc_status === "Pending"
                              ? "secondary"
                              : "destructive"
                        }
                        className={`${u.kyc_status === "Approved" ? 'bg-green-500' : ''}`}
                      >
                        {u.kyc_status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      ${u.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2">{new Date(u.last_login).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/users/${u.id}`}>
                          <Button size="sm" variant="secondary">
                            View Details
                          </Button>
                        </Link>
                        <Button size="sm" variant="destructive" onClick={() => suspendUser(u.id)}>
                          Suspend
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && !error && data?.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t bg-card">
          <div className="text-xs text-muted-foreground">
            Page {page} of {data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1} • {data?.total ?? 0} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={(!!data && page >= Math.ceil(data.total / pageSize)) || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
