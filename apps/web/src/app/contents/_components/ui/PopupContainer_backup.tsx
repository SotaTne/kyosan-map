"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@kyosan-map/ui/components/drawer";
import { Button } from "@kyosan-map/ui/components/button";

export function PopupContainer({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // マウント時に開く
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
    // アニメーション完了後にonCloseを呼ぶ
    setTimeout(onClose, 300);
  };

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="relative">
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 rounded-full"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">閉じる</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4">{children}</div>

        <DrawerFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose} className="w-full">
            閉じる
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
