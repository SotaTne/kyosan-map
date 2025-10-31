import { Button } from "@kyosan-map/ui/components/button";
import { FcGoogle } from "react-icons/fc";

export function SignIn({
  googleLoginAction,
}: {
  googleLoginAction: (fd: FormData) => Promise<void>;
}) {
  return (
    <form action={googleLoginAction}>
      <Button
        type="submit"
        className="mx-auto flex items-center justify-center gap-2"
      >
        <FcGoogle size={20} />
        <span>Sign in with Google</span>
      </Button>
    </form>
  );
}
