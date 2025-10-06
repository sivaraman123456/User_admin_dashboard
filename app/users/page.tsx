import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import UsersTable from "@/components/users/users-table"

export const metadata = {
  title: "Users",
}

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-pretty">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable />
        </CardContent>
      </Card>
    </div>
  )
}
