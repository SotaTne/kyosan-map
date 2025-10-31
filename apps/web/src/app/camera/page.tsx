import { FOOTER_HEIGHT } from "../../../config";
import { CameraProvider } from "./_components/camera_provider";

export default function CameraPage() {
  return <CameraProvider headerFooterHeight={FOOTER_HEIGHT} />;
}
