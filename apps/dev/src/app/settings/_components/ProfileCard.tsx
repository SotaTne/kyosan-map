// app/settings/_components/ProfileCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaUser } from "react-icons/fa";

export function ProfileCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaUser />
          プロフィール設定
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          アカウント情報を編集できます
        </p>
      </CardContent>
    </Card>
  );
}
