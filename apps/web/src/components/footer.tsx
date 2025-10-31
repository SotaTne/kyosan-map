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
          <button
            onClick={() => {
              console.log("click");
            }}
          >
            マップ
          </button>
        </li>
        <li>
          <button>カメラ</button>
        </li>
        <li>
          <button>コレクション</button>
        </li>
        <li>
          <button>設定</button>
        </li>
      </ul>
    </footer>
  );
}
