"use client";
import { Download, HelpCircle, User } from "lucide-react";
import { useState } from "react";

export function ProfileSettings() {
  // ← export default を export に変更
  const [locationEnabled, setLocationEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      {/* User Profile Section */}
      <div className="mb-4 flex items-center gap-4 rounded-2xl bg-gray-100 p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-200">
          <User className="h-10 w-10 text-purple-600" />
        </div>
        <h2 className="text-3xl font-bold">UserName</h2>
      </div>

      {/* Account Linking Buttons */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => {}}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-4 text-sm font-medium transition-colors hover:bg-gray-200"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>アカウント紐付け</span>
        </button>

        <button
          onClick={() => {}}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 py-4 text-sm font-medium transition-colors hover:bg-gray-200"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span>アカウント紐付け</span>
        </button>
      </div>

      {/* PWA Download Button */}
      <button
        onClick={() => {}}
        className="mb-4 flex w-full items-center justify-between rounded-2xl bg-gray-100 px-6 py-4 text-left transition-colors hover:bg-gray-200"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-800">
            <span className="text-xl font-bold leading-none">!</span>
          </div>
          <span className="font-medium">PWAとしてダウンロード</span>
        </div>
        <Download className="h-6 w-6" />
      </button>

      {/* Settings List */}
      <div className="mb-4 overflow-hidden rounded-2xl bg-gray-100">
        {/* Location Permission Toggle */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <span className="font-medium">位置情報の利用許可</span>
          <button
            onClick={() => setLocationEnabled(!locationEnabled)}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              locationEnabled ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                locationEnabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Tutorial Display */}
        <button
          onClick={() => {}}
          className="flex w-full items-center justify-between border-b border-gray-200 px-6 py-5 text-left transition-colors hover:bg-gray-200"
        >
          <span className="font-medium">チュートリアルの表示</span>
          <HelpCircle className="h-6 w-6" />
        </button>

        {/* Logout */}
        <button
          onClick={() => {}}
          className="w-full border-b border-gray-200 px-6 py-5 text-left font-medium text-red-500 transition-colors hover:bg-gray-200"
        >
          ログアウトする
        </button>

        {/* Delete Account */}
        <button
          onClick={() => {}}
          className="w-full px-6 py-5 text-left font-medium text-red-500 transition-colors hover:bg-gray-200"
        >
          アカウントの削除
        </button>
      </div>

      {/* Survey Card */}
      <div className="rounded-2xl bg-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="mb-2 text-lg font-bold">
              CACアンケートにお答えください
            </h3>
            <p className="text-sm text-gray-600">
              CAC共通の作品アンケートが存在します
              <br />
              よければご回答いただけると幸いです
            </p>
          </div>
          <div className="flex-shrink-0">
            <svg
              className="h-12 w-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
