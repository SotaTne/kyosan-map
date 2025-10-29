// app/settings/_components/HelpCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AiOutlineQuestionCircle } from "react-icons/ai";

export function HelpCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AiOutlineQuestionCircle />
          ヘルプ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          お困りの際はこちらからサポートにお問い合わせください
        </p>
      </CardContent>
    </Card>
  );
}
