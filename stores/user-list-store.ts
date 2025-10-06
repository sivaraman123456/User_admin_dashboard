"use client"

import { create } from "zustand"
import type { KycStatus } from "@/lib/types"

type SortBy = "balance" | "last_login" | ""
type SortDir = "asc" | "desc"

type State = {
  q: string
  kyc: KycStatus | "All"
  sortBy: SortBy
  sortDir: SortDir
  page: number
  pageSize: number
  selected: Set<number>
}

type Actions = {
  setQuery: (q: string) => void
  setKyc: (k: KycStatus | "All") => void
  setSort: (by: "balance" | "last_login") => void
  setPage: (p: number) => void
  setPageSize: (ps: number) => void
  toggleSelect: (id: number) => void
  toggleSelectAllVisible: (ids: number[]) => void
  clearSelection: () => void
}

export const useUserListStore = create<State & Actions>((set, get) => ({
  q: "",
  kyc: "All",
  sortBy: "",
  sortDir: "asc",
  page: 1,
  pageSize: 10,
  selected: new Set<number>(),
  setQuery: (q) => set({ q }),
  setKyc: (kyc) => set({ kyc }),
  setSort: (by) => {
    const { sortBy, sortDir } = get()
    if (sortBy === by) {
      set({ sortDir: sortDir === "asc" ? "desc" : "asc" })
    } else {
      set({ sortBy: by, sortDir: "desc" }) 
    }
  },
  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
  toggleSelect: (id) => {
    const next = new Set(get().selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ selected: next })
  },
  toggleSelectAllVisible: (ids) => {
    const { selected } = get()
    const allSelected = ids.every((id) => selected.has(id))
    const next = new Set(selected)
    if (allSelected) {
      ids.forEach((id) => next.delete(id))
    } else {
      ids.forEach((id) => next.add(id))
    }
    set({ selected: next })
  },
  clearSelection: () => set({ selected: new Set() }),
}))
