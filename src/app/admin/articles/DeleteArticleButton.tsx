"use client";

import { useTransition } from "react";
import { deleteArticleAction } from "../../../server/actions/article";
import { Trash2 } from "lucide-react";

interface DeleteArticleButtonProps {
  articleId: string;
  articleTitle: string;
}

export function DeleteArticleButton({
  articleId,
  articleTitle,
}: DeleteArticleButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus artikel "${articleTitle}"? Tindakan ini tidak dapat dibatalkan.`)) {
      startTransition(async () => {
        const res = await deleteArticleAction(articleId);
        if (res?.error) {
          alert(res.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 transition-colors"
      title="Hapus Artikel"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
