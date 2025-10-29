// app/settings/page.tsx
import {
  DataExportCard,
  HelpCard,
  LocationToggleCard,
  ProfileCard,
} from "./_components";

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">設定</h1>
      <ProfileCard />
      <LocationToggleCard />
      <DataExportCard />
      <HelpCard />
    </div>
  );
}
