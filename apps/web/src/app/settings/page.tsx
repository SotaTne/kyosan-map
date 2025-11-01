import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@kyosan-map/ui/components/avatar";
import { Button } from "@kyosan-map/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kyosan-map/ui/components/card";
import { Separator } from "@kyosan-map/ui/components/separator";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { auth } from "../../auth";
import { googleLoginAction, logoutAction } from "../login/actions";

export default async function SettingPage() {
  const result = await auth();
  const user = result?.user;
  const isLoggedIn = user && user.id;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">設定</h1>

        <Card>
          <CardHeader>
            <CardTitle>プロフィール</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={user?.image || undefined}
                  alt={user?.name || "ゲスト"}
                />
                <AvatarFallback className="bg-muted">
                  <UserIcon className="w-8 h-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-lg font-semibold">
                  {user?.name || "ゲスト"}
                </p>
                {user?.email && (
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                )}
              </div>
            </div>

            <Separator />

            {isLoggedIn ? (
              <form action={logoutAction}>
                <Button type="submit" variant="outline" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </Button>
              </form>
            ) : (
              <form action={googleLoginAction}>
                <Button type="submit" variant="default" className="w-full">
                  Googleでログイン
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>リンク</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="https://github.com/SotaTne/kyosan-map"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <p className="font-medium">GitHub</p>
              <p className="text-sm text-muted-foreground">
                プロジェクトのソースコード
              </p>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
