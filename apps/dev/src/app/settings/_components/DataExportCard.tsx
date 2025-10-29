// app/settings/_components/DataExportCard.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HiDownload } from "react-icons/hi";

export function DataExportCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HiDownload />
          データのエクスポート
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          あなたのデータをダウンロードできます
        </p>
        <Button>データをダウンロード</Button>
      </CardContent>
    </Card>
  );
}
