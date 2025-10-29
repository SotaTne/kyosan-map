// app/settings/_components/LocationToggleCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export function LocationToggleCard() {
  const [locationEnabled, setLocationEnabled] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>位置情報</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Switch
            id="location"
            checked={locationEnabled}
            onCheckedChange={setLocationEnabled}
          />
          <Label htmlFor="location">位置情報を有効にする</Label>
        </div>
      </CardContent>
    </Card>
  );
}
