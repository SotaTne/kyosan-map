"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@kyosan-map/ui/components/dialog";

export function PopupContainer({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(false);
      setTimeout(onClose, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-[95vw] max-h-[90vh] p-0 overflow-hidden"
        showCloseButton={true}
      >
        <div className="overflow-auto max-h-[90vh] p-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
