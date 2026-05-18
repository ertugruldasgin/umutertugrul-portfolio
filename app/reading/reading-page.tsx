"use client";

import { PageHeader } from "@/components/page-header";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import Link from "next/link";
import Image from "next/image";
import { SectionDivider } from "@/components/section-divider";

interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  cover_url: string | null;
  status: "reading" | "finished" | "dropped" | "queued";
  started_at: string | null;
  finished_at: string | null;
  rating: number | null;
  tags: string[];
  total_pages: number | null;
  current_page: number;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const STATUS_ORDER: Book["status"][] = [
  "reading",
  "finished",
  "queued",
  "dropped",
];

const STATUS_LABELS: Record<Book["status"], string> = {
  reading: "currently reading",
  finished: "finished",
  queued: "up next",
  dropped: "dropped",
};

const STATUS_STYLES: Record<
  Book["status"],
  { text: string; bg: string; hoverText: string }
> = {
  reading: {
    text: "text-warning",
    bg: "bg-warning",
    hoverText: "group-hover:text-warning",
  },
  finished: {
    text: "text-primary",
    bg: "bg-primary",
    hoverText: "group-hover:text-primary",
  },
  queued: {
    text: "text-info",
    bg: "bg-info",
    hoverText: "group-hover:text-info",
  },
  dropped: {
    text: "text-subtle",
    bg: "bg-subtle",
    hoverText: "group-hover:text-subtle",
  },
};

export default function ReadingPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("books")
        .select("*")
        .order("updated_at", { ascending: false });

      if (data) setBooks(data as Book[]);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setIsOwner(true);
    };
    init();
  }, []);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newAuthor.trim()) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const slug = slugify(newTitle.trim()) || "untitled";

    const { data } = await supabase
      .from("books")
      .insert({
        title: newTitle.trim(),
        author: newAuthor.trim(),
        status: "queued",
        user_id: user.id,
        slug,
      })
      .select()
      .single();

    if (data) {
      setBooks((prev) => [data as Book, ...prev]);
      setNewTitle("");
      setNewAuthor("");
      setAddOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("books").delete().eq("id", deleteTarget);
    setBooks((prev) => prev.filter((b) => b.id !== deleteTarget));
    setDeleteTarget(null);
  };

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    books: books.filter((b) => b.status === status),
  })).filter((g) => g.books.length > 0);

  return (
    <div className="flex flex-col gap-6 md:gap-12 flex-1 w-full max-w-3xl mx-auto">
      <div className="flex items-start justify-between">
        <PageHeader title="reading" description="digital bookshelf" />
        {isOwner && (
          <Button
            size="sm"
            onClick={() => setAddOpen(!addOpen)}
            className="hover:cursor-pointer rounded-lg hover:bg-primary-hover px-1.5 sm:px-2.5"
          >
            <PlusIcon className="size-4" />
            <span className="hidden sm:block ml-1">Add</span>
          </Button>
        )}
      </div>

      {/* add form */}
      {addOpen && (
        <div className="flex flex-col gap-3 p-4 border border-border rounded-lg">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="title"
            className="bg-transparent border border-border rounded-md px-2 py-1.5 text-sm font-mono text-foreground placeholder:text-subtle/50"
            autoFocus
          />
          <input
            type="text"
            value={newAuthor}
            onChange={(e) => setNewAuthor(e.target.value)}
            placeholder="author"
            className="bg-transparent border border-border rounded-md px-2 py-1.5 text-sm font-mono text-foreground placeholder:text-subtle/50"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAddOpen(false);
                setNewTitle("");
                setNewAuthor("");
              }}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleAdd()}
              disabled={!newTitle.trim() || !newAuthor.trim()}
              className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* book list grouped by status */}
      {grouped.map((group) => (
        <div key={group.status} className="flex flex-col gap-1">
          <SectionDivider
            title={group.label}
            titleClassName={STATUS_STYLES[group.status].text}
            lineClassName={STATUS_STYLES[group.status].bg}
            className="mb-2"
          />
          {group.books.map((book) => (
            <Link
              key={book.slug}
              href={`/reading/${book.slug}`}
              className="group flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-surface transition-colors"
            >
              {book.cover_url ? (
                <Image
                  width={32}
                  height={48}
                  src={book.cover_url}
                  alt={book.title}
                  className="w-8 h-12 object-cover rounded-sm shrink-0"
                />
              ) : (
                <div className="w-8 h-12 bg-surface rounded-sm shrink-0 flex items-center justify-center">
                  <span className="text-xs text-subtle/40 font-mono">
                    {book.title[0]}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span
                  className={`font-mono text-sm sm:text-base text-foreground ${STATUS_STYLES[book.status].hoverText} transition-colors truncate`}
                >
                  {book.title}
                </span>
                <span className="text-xs text-subtle/60 font-mono truncate">
                  {book.author}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {book.status === "reading" &&
                  book.total_pages &&
                  book.current_page > 0 && (
                    <span className="text-xs text-subtle/40 font-mono">
                      {Math.round((book.current_page / book.total_pages) * 100)}
                      %
                    </span>
                  )}
                {book.rating && (
                  <span className="text-xs text-subtle/40 font-mono">
                    {"★".repeat(book.rating)}
                    {"☆".repeat(5 - book.rating)}
                  </span>
                )}
                {isOwner && (
                  <Trash2
                    className="size-4 text-subtle/40 hover:text-danger transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTarget(book.id);
                      setConfirmOpen(true);
                    }}
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      ))}

      {books.length === 0 && (
        <p className="text-subtle font-mono text-sm sm:text-base py-8 text-center">
          {isOwner ? "no books yet. add one." : "nothing here yet."}
        </p>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="$ rm -rf"
        description="delete this book and all its notes?"
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
