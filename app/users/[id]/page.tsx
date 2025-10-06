import UserDetail from "@/components/users/user-detail";
export default function UserDetailPage({ params }: { params: { id: string } }) {
  return <UserDetail id={Number(params.id)} />;
}
