"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kyosan-map/ui/components/alert-dialog";
import { useEffect, useState } from "react";
import type { OcrAlertDialogProps } from "../types/type";

export function OcrAlertDialog({
  result,
  type,
  onClose,
  handleNavigation,
  open,
  setOpen,
}: OcrAlertDialogProps) {
  const [buildingName, setBuildingName] = useState<string | null>(null);

  // ✅ OCR結果をもとに建物を特定
  useEffect(() => {
    if (type === "findText" && result) {
      const building = result.buildingName;
      if (building) {
        setBuildingName(building);
      } else {
        setBuildingName(null);
      }
    } else {
      setBuildingName(null);
    }
  }, [result, type]);

  const handleYes = () => {
    if (!result?.text || type !== "findText") return;
    const building = result.buildingName;
    if (!building) return;
    setOpen(false);
    handleNavigation?.(result.id);
  };

  const handleNo = () => {
    setOpen(false);
    onClose?.();
  };

  // ✅ ここでreturn nullせず、typeに応じて分岐描画
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {type === "preparation" && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>OCR機能は準備中です</AlertDialogTitle>
            <AlertDialogDescription>
              現在、OCR機能は準備中です。しばらくお待ちください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNo}>閉じる</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}

      {type === "noText" && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>テキストが検出されませんでした</AlertDialogTitle>
            <AlertDialogDescription>
              カメラに建物名がはっきり映るように調整して、
              検出したい文字をタップして再試行してください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNo}>閉じる</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}

      {type === "error" && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>エラーが発生しました</AlertDialogTitle>
            <AlertDialogDescription>
              ページを再読み込みして再度お試しください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNo}>閉じる</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}

      {type === "fail-camera" && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>カメラの起動に失敗しました</AlertDialogTitle>
            <AlertDialogDescription>
              カメラの権限を確認し、再度お試しください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNo}>閉じる</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}

      {type === "findText" && buildingName && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>「{buildingName}」ですか？</AlertDialogTitle>
            <AlertDialogDescription>
              OCR結果「{result?.text}」が検出されました。
              この建物を地図で表示しますか？
              <br />
              ※AIによる文字認識のため誤認識の可能性があります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleNo}>いいえ</AlertDialogCancel>
            <AlertDialogAction onClick={handleYes}>はい</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}

      {type === "textOnly" && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>文字を検出しました</AlertDialogTitle>
            <AlertDialogDescription>
              OCR結果「{result?.text}
              」が検出されましたが、該当する建物は見つかりませんでした。
              <br />
              カメラの角度や距離を変えて再度お試しください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNo}>閉じる</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
