"use client";

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@kyosan-map/ui/components/command";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useMapContext } from "../../contexts/map-context";
import { filterFacilitiesAND } from "../../functions/search-filter";
import type { Facility } from "../../types/map-type";

type SearchBarProps = {
  placeholder?: string;
  limit?: number;
};

export function SearchBar({
  placeholder = "施設名・タグで検索（例: 14 情報）",
  limit = 20,
}: SearchBarProps) {
  const { sortedPinIds, idPinMap, setCenterWithPinID } = useMapContext();

  // 全施設一覧（Mapコンテキストから）
  const facilities: Facility[] = useMemo(() => {
    return sortedPinIds.map((id) => {
      const info = idPinMap.get(id);
      if (!info) throw new Error("Facility not found: " + id);
      return { id, ...info };
    });
  }, [sortedPinIds, idPinMap]);

  const [value, setValue] = useState("");

  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    return filterFacilitiesAND(facilities, value).slice(0, limit);
  }, [facilities, value, limit]);

  // キーボードイベント伝播を止める（Mapに奪われるのを防ぐ）
  const stopKeys = (e: React.KeyboardEvent) => e.stopPropagation();

  const handleValueChange = useCallback(
    (v: string) => {
      setValue(v);
      if (!open) setOpen(true);
    },
    [open]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setOpen(false);
        inputRef.current?.blur(); // モバイルではキーボード閉じる
      }
      // Escape キーで検索バーからフォーカスを外す
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        inputRef.current?.blur();
      }
    },
    []
  );

  const handleSelect = useCallback(
    (f: Facility) => {
      console.log("handleSelect called:", f);
      setValue(f.name);
      setCenterWithPinID(f.id);
      setOpen(false);
      inputRef.current?.blur();
    },
    [setCenterWithPinID]
  );

  return (
    <div
      role="search"
      style={{
        position: "absolute",
        top: 5,
        left: 20,
        zIndex: 10,
        width: "300px",
        pointerEvents: "auto",
      }}
      onKeyDownCapture={stopKeys}
      onKeyUpCapture={stopKeys}
    >
      <Command
        className="rounded-lg border shadow-md overflow-visible"
        shouldFilter={false}
      >
        <div className="flex flex-row">
          <CommandInput
            ref={inputRef}
            value={value}
            onValueChange={(v) => {
              handleValueChange(v);
              inputRef.current?.focus();
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
          />
        </div>

        {open && (
          <div className="relative mt-2">
            <CommandList className="absolute left-0 top-0 w-full rounded-md bg-background shadow-lg max-h-[60vh] overflow-auto">
              {results.map((f) => (
                <CommandItem
                  key={f.id}
                  value={f.id}
                  className="flex items-center gap-2"
                  onSelect={() => {
                    handleSelect(f);
                    inputRef.current?.focus();
                  }}
                  onMouseDown={(e) => {
                    // mousedownでのフォーカス移動を抑止（入力欄がblur→閉じる→再オープン等のチラつきを防ぐ）
                    e.preventDefault();
                    inputRef.current?.focus();
                  }}
                  onClick={(e) => {
                    // クリックイベントも明示的にハンドリング
                    handleSelect(f);
                    e.preventDefault();
                    inputRef.current?.focus();
                  }}
                  onTouchEnd={(e) => {
                    // タッチイベントも明示的にハンドリング
                    handleSelect(f);
                    e.preventDefault();
                    inputRef.current?.focus();
                  }}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    {(f.description || (f.tags && f.tags.length > 0)) && (
                      <div className="text-xs text-muted-foreground truncate">
                        {f.description ?? ""}
                        {f.tags && f.tags.length > 0
                          ? (f.description ? " ・ " : "") + f.tags.join(", ")
                          : ""}
                      </div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}
