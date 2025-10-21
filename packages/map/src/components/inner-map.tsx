import { GeolocateControlDeliver } from "./maps/geometory-controle-deliver";
import { PinsDeliver } from "./maps/pins-deliver";

export function InnerMap({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <GeolocateControlDeliver />
      {/* ここにPinが来る */}
      <PinsDeliver />
      {/* ここに、ドロワーもしくはサイドバーが来る */}
      {children}
    </>
  );
}
