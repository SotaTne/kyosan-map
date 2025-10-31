import Link from "next/link";
import { FOOTER_HEIGHT } from "../../config";

export function Footer() {
  return (
    <footer
      style={{
        height: `${FOOTER_HEIGHT}px`,
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
      className="bg-background border-t shadow"
    >
      <ul className="flex justify-around items-center h-full">
        <li>
          <Link href="/">マップ</Link>
        </li>
        <li>
          <Link href="/camera">カメラ</Link>
        </li>
        <li>
          <Link href="/contents">コレクション</Link>
        </li>
        <li>
          <Link href="/settings">設定</Link>
        </li>
      </ul>
    </footer>
  );
}
