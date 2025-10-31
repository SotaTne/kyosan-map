// apps/web/src/app/login/login-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@kyosan-map/ui/components/dialog";
import { FOOTER_HEIGHT } from "../../../config";
import { SignIn } from "./login-button";

type Props = {
  open: boolean;
  googleLoginAction: (fd: FormData) => Promise<void>; // Server Action を受け取る
};

export function LoginDialog({ open, googleLoginAction }: Props) {
  return (
    <>
      {/* bodyのpointer-eventsをCSSで強制的に上書き */}
      {open && (
        <style jsx global>{`
          body {
            pointer-events: auto !important;
          }
        `}</style>
      )}
      <Dialog open={open}>
        <DialogContent
          className="pointer-events-auto"
          style={{
            zIndex: 10000,
          }}
          showCloseButton={false}
          overlay={
            <DialogOverlay
              className="fixed inset-x-0 top-0 bg-black/50 pointer-events-none"
              style={{
                position: "fixed",
                bottom: FOOTER_HEIGHT,
                zIndex: 9998,
              }}
            />
          }
        >
          <DialogHeader>
            <DialogTitle>ログイン</DialogTitle>
            <DialogDescription>
              ログインすることによって、すべての機能へアクセスできます
            </DialogDescription>
          </DialogHeader>

          <SignIn googleLoginAction={googleLoginAction} />
        </DialogContent>
      </Dialog>
    </>
  );
}
