// import useSWR from "swr";
import { auth } from "../../auth";
import { googleLoginAction } from "../login/actions";
import { LoginDialog } from "../login/login-dialog";
import { ContentsViewer } from "./_components/contents-viewr";
import { UserViewFlag } from "./type";

export default async function Page() {
  // //const { data } = useSWR<ViewItem[]>("/api/collection", fetcher);
  // const [previewImg, setPreviewImg] = useState<string | null>(null);
  // const [previewModel, setPreviewModel] = useState<string | null>(null);
  // const [track, setTrack] = useState<{ url: string; title: string } | null>(
  //   null
  // );

  // // if (!data) return <div className="p-4">Loading...</div>;
  // // const images = data.filter((x) => x.kind === "image");
  // // const musics = data.filter((x) => x.kind === "audio");
  // // const models = data.filter((x) => x.kind === "model");
  const result = await auth();
  const user = result?.user;

  // const flags = user && user.id ? await getCollectionForUser(user.id) : [];

  // mock flags (テスト用：ログインしている場合のみ一部コンテンツを解放)
  const flags: UserViewFlag[] =
    user && user.id
      ? [
          { contentsId: "ohituziza", unlocked: true },
          { contentsId: "maturi", unlocked: true },
          { contentsId: "hutagoza", unlocked: true },
        ]
      : [];

  return (
    <main>
      <LoginDialog
        open={!user || !user.id}
        googleLoginAction={googleLoginAction}
      />
      <ContentsViewer flags={flags} />
    </main>
  );
}
