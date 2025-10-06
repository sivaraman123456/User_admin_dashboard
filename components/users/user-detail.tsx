"use client";

import useSWR from "swr";
import { useState } from "react";
import { fetcher } from "@/lib/fetcher";
import type { UserDetailResponse, KycStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function UserDetail({ id }: { id: number }) {
  const { toast } = useToast();
  const { data, isLoading, mutate, error } = useSWR<UserDetailResponse>(
    `/api/users/${id}`,
    fetcher
  );
  const {
    data: txs,
    isLoading: txLoading,
    error: txError,
  } = useSWR<{ items: UserDetailResponse["transactions"] }>(
    `/api/users/${id}/transactions`,
    fetcher
  );
  const [saving, setSaving] = useState(false);

  async function updateKyc(status: KycStatus) {
    try {
      setSaving(true);
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kyc_status: status }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "KYC updated", description: `KYC set to ${status}.` });
      mutate();
    } catch {
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-[1000px] rounded bg-muted animate-pulse" />
        <div className="grid md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded bg-muted animate-pulse" />
      </div>
    );
  }
  if (error || !data) {
    return <div className="text-muted-foreground">Failed to load user.</div>;
  }

  return (
    <div className="space-y-6 p-6 flex flex-1 flex-col">
      <div className="flex items-center justify-between flex-1">
        <h1 className="text-xl font-semibold text-pretty">
          User Detail: {data.user.name}
        </h1>
        <Link href="/users">
          <Button variant="secondary">Back to Users</Button>
        </Link>
      </div>
      <div className=" lg:flex lg:gap-[100px] lg:W-[1000px] lg:justify-between  ">
        <Card className="flex-1 ">
          <CardHeader className="pb-2">
            <CardTitle className="text-pretty">User Info</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div>{data.user.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div>{data.user.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Country</div>
              <div>{data.user.country}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Joined</div>
              <div>{new Date(data.user.joined_at).toLocaleDateString()}</div>
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <div className="text-sm text-muted-foreground">KYC Status</div>
              <Badge
                variant={
                  data.user.kyc_status === "Approved"
                    ? "default"
                    : data.user.kyc_status === "Pending"
                    ? "secondary"
                    : "destructive"
                }
              >
                {data.user.kyc_status}
              </Badge>
              <Select
                value={data.user.kyc_status}
                onValueChange={(val) => updateKyc(val as KycStatus)}
                disabled={saving}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-3 flex-1 items-center">
          {data.balances.map((b) => (
            <Card key={b.asset}>
              <CardHeader className="pb-2">
                <CardTitle className="text-pretty">{b.asset}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">
                  {b.amount}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-pretty">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading && <div className="h-40 rounded bg-muted animate-pulse" />}
          {txError && (
            <div className="text-muted-foreground">
              Failed to load transactions.
            </div>
          )}
          {!txLoading && !txError && (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Type</th>
                      <th className="px-3 py-2 font-medium">Asset</th>
                      <th className="px-3 py-2 font-medium">Amount</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txs?.items.map((t) => (
                      <tr key={t.id} className="border-t">
                        <td className="px-3 py-2">
                          {new Date(t.date).toLocaleString()}
                        </td>
                        <td className="px-3 py-2">{t.type}</td>
                        <td className="px-3 py-2">{t.asset}</td>
                        <td className="px-3 py-2 tabular-nums">{t.amount}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={
                              t.status === "Pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className={`${
                              t.status === "Completed" ? "bg-green-500" : ""
                            }`}
                          >
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
