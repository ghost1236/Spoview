"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  getPostDetail,
  toggleLike,
  createComment,
  type PostDetail,
} from "@/lib/api";
import { CATEGORY_LABELS, relativeTime } from "@/lib/constants";

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { data: session } = useSession();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const token = (session as any)?.accessToken;

  useEffect(() => {
    if (postId) {
      getPostDetail(Number(postId)).then(setPost).catch(console.error);
    }
  }, [postId]);

  const handleLike = async () => {
    if (!token || !post) return;
    const res = await toggleLike(token, post.id);
    setPost({
      ...post,
      isLiked: res.liked,
      likeCount: res.liked ? post.likeCount + 1 : post.likeCount - 1,
    });
  };

  const handleComment = async () => {
    if (!token || !commentText.trim() || !post) return;
    await createComment(token, post.id, commentText);
    setCommentText("");
    getPostDetail(post.id).then(setPost);
  };

  const handleReply = async () => {
    if (!token || !replyText.trim() || replyTo === null || !post) return;
    await createComment(token, post.id, replyText, replyTo);
    setReplyText("");
    setReplyTo(null);
    getPostDetail(post.id).then(setPost);
  };

  if (!post) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "var(--brand-primary)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 게시글 */}
      <article className="sv-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
          >
            {CATEGORY_LABELS[post.category] || post.category}
          </span>
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>{post.title}</h1>
        <div className="flex items-center gap-3 text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          <span className="flex items-center gap-1">
            {post.authorNickname}
            {post.authorFanLevel > 1 && <LevelBadge level={post.authorFanLevel} />}
          </span>
          <span>{relativeTime(post.createdAt)}</span>
          <span>조회 {post.viewCount}</span>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text)" }}>
          {post.content}
        </div>
        {post.images && post.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {post.images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt={img.fileName}
                className="rounded-lg w-full object-cover max-h-80 cursor-pointer hover:opacity-90"
                onClick={() => window.open(img.url, "_blank")}
              />
            ))}
          </div>
        )}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg"
            style={{
              border: post.isLiked ? "1px solid #FCA5A5" : "1px solid var(--border)",
              color: post.isLiked ? "#EF4444" : "var(--text-secondary)",
              background: post.isLiked ? "rgba(239,68,68,0.08)" : "transparent",
            }}
          >
            {post.isLiked ? "♥" : "♡"} {post.likeCount}
          </button>
        </div>
      </article>

      {/* 댓글 */}
      <section className="sv-card p-6">
        <h3 className="font-semibold mb-4" style={{ color: "var(--text)" }}>댓글 {post.comments.length}</h3>

        {token && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1 px-3 py-2 rounded-lg text-sm"
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
            />
            <button onClick={handleComment} className="sv-btn-primary px-4 py-2 rounded-lg text-sm">
              등록
            </button>
          </div>
        )}

        <div className="space-y-4">
          {post.comments.map((c) => (
            <div key={c.id}>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--text)" }}>
                      {c.authorNickname}
                      {c.authorFanLevel > 1 && <LevelBadge level={c.authorFanLevel} />}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{relativeTime(c.createdAt)}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.content}</p>
                  {token && (
                    <button
                      onClick={() => {
                        if (replyTo === c.id) {
                          setReplyTo(null);
                          setReplyText("");
                        } else {
                          setReplyTo(c.id);
                          setReplyText("");
                        }
                      }}
                      className="mt-1 text-xs"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {replyTo === c.id ? "취소" : "답글"}
                    </button>
                  )}
                </div>
              </div>

              {replyTo === c.id && (
                <div className="ml-8 mt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`${c.authorNickname}님에게 답글 달기`}
                    className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1"
                    style={{
                      border: "1px solid var(--brand-primary)",
                      background: "var(--surface-2)",
                      color: "var(--text)",
                      "--tw-ring-color": "var(--brand-primary)",
                    } as React.CSSProperties}
                    onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    autoFocus
                  />
                  <button onClick={handleReply} className="sv-btn-primary px-4 py-2 rounded-lg text-sm whitespace-nowrap">
                    등록
                  </button>
                </div>
              )}

              {c.replies.length > 0 && (
                <div className="ml-8 mt-2 space-y-2 pl-4" style={{ borderLeft: "2px solid var(--border)" }}>
                  {c.replies.map((r) => (
                    <div key={r.id}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>↳</span>
                        <span className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--text)" }}>
                          {r.authorNickname}
                          {r.authorFanLevel > 1 && <LevelBadge level={r.authorFanLevel} />}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{relativeTime(r.createdAt)}</span>
                      </div>
                      <p className="text-sm ml-4" style={{ color: "var(--text-secondary)" }}>{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function LevelBadge({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[10px] font-bold text-white">
      {level}
    </span>
  );
}
