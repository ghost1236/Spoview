"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createPost, uploadImage } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { CATEGORY_LABELS } from "@/lib/constants";

interface UploadedImage {
  id: number;
  url: string;
  fileName: string;
}

export default function WritePostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUserId = useAppStore(s => s.currentUserId);
  const subscriptionsByUser = useAppStore(s => s.subscriptionsByUser);
  const localSubscriptions = subscriptionsByUser[currentUserId || "_guest"] || [];
  const token = (session as any)?.accessToken || (typeof window !== "undefined" ? localStorage.getItem("test-token") : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [teamCode, setTeamCode] = useState(localSubscriptions[0]?.teamCode || "");
  const [category, setCategory] = useState("FREE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !token) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name}: 5MB를 초과합니다`);
          continue;
        }
        const result = await uploadImage(token, file);
        setImages((prev) => [...prev, { id: result.id, url: result.url, fileName: result.fileName }]);
      }
    } catch {
      alert("이미지 업로드에 실패했습니다");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: number) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async () => {
    if (!token || !title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const res = await createPost(token, {
        teamCode,
        title,
        content,
        category,
        imageIds: images.map((img) => img.id),
      });
      router.push(`/community/${res.id}`);
    } catch {
      alert("게시글 작성에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session && typeof window !== "undefined" && !localStorage.getItem("test-user")) {
    return <div className="text-center py-12 text-slate-400">로그인이 필요합니다</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">글쓰기</h1>

      <div className="flex gap-3">
        {/* 팀 선택 드롭다운 — 배경/테두리를 CSS 변수로 지정해 다크모드 지원 */}
        <select
          value={teamCode}
          onChange={(e) => setTeamCode(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          {localSubscriptions.map((t) => (
            <option key={t.teamCode} value={t.teamCode}>{t.nameKo}</option>
          ))}
        </select>
        {/* 카테고리 선택 드롭다운 */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
        >
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* 제목 입력란 — CSS 변수로 다크모드 배경/테두리/텍스트 색상을 처리해요 */}
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border text-sm"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
      />

      {/* 본문 입력란 — resize-none으로 크기 조절 비활성화, 다크모드는 CSS 변수로 처리 */}
      <textarea
        placeholder="내용을 입력하세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={10}
        className="w-full px-4 py-3 rounded-lg border text-sm resize-none"
        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
      />

      {/* 이미지 업로드 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= 5}
            {/* 이미지 첨부 버튼 — 테두리와 배경을 CSS 변수로 지정해요 */}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm disabled:opacity-50"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {uploading ? "업로드 중..." : "이미지 첨부"}
          </button>
          <span className="text-xs text-gray-400">{images.length}/5 (최대 5MB)</span>
        </div>

        {images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img) => (
              {/* 첨부된 이미지 미리보기 썸네일 — 테두리를 CSS 변수로 지정해요 */}
              <div key={img.id} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <img src={`${process.env.NEXT_PUBLIC_API_URL || ""}${img.url}`} alt={img.fileName} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => router.back()}
          {/* 취소 버튼 — 테두리를 CSS 변수로 지정해요 */}
          className="px-4 py-2 rounded-lg border text-sm"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !content.trim()}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "작성 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}
