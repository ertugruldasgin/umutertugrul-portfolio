"use client";

import MinimalTiptapThree from "@/components/ui/minimal-tiptap/components/custom/minimal-tiptap-three";
import { createClient } from "@/lib/supabase/client";
import { Content } from "@tiptap/react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, PlusIcon } from "@radix-ui/react-icons";
import {
  Trash2,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  FileText,
} from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import Link from "next/link";
import { BookAside } from "@/components/book-aside";

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

interface BookNote {
  id: string;
  book_id: string;
  page: number | null;
  chapter: string | null;
  content: string;
  type: "highlight" | "thought" | "question" | "summary";
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

const NOTE_TYPE_ICONS: Record<BookNote["type"], React.ReactNode> = {
  highlight: <Lightbulb className="size-3.5" />,
  thought: <MessageSquare className="size-3.5" />,
  question: <HelpCircle className="size-3.5" />,
  summary: <FileText className="size-3.5" />,
};

const NOTE_TYPES: BookNote["type"][] = [
  "highlight",
  "thought",
  "question",
  "summary",
];

export default function BookDetailPage({ slug }: { slug: string }) {
  const [book, setBook] = useState<Book | null>(null);
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editStatus, setEditStatus] = useState<Book["status"]>("queued");
  const [editRating, setEditRating] = useState<number | null>(null);
  const [editTags, setEditTags] = useState("");
  const [editTotalPages, setEditTotalPages] = useState("");
  const [editCurrentPage, setEditCurrentPage] = useState("");
  const [editStartedAt, setEditStartedAt] = useState("");
  const [editFinishedAt, setEditFinishedAt] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [addingNote, setAddingNote] = useState(false);
  const [newNotePage, setNewNotePage] = useState("");
  const [newNoteChapter, setNewNoteChapter] = useState("");
  const [newNoteType, setNewNoteType] = useState<BookNote["type"]>("highlight");
  const [newNoteContent, setNewNoteContent] = useState<Content>("");
  const newNoteInitialized = useRef(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();

      const { data: bookData } = await supabase
        .from("books")
        .select("*")
        .eq("slug", slug)
        .single();

      if (bookData) {
        const b = bookData as Book;
        setBook(b);
        setEditTitle(b.title);
        setEditAuthor(b.author);
        setEditStatus(b.status);
        setEditRating(b.rating);
        setEditTags(b.tags.join(", "));
        setEditTotalPages(b.total_pages?.toString() || "");
        setEditCurrentPage(b.current_page.toString());
        setEditStartedAt(b.started_at || "");
        setEditFinishedAt(b.finished_at || "");

        const { data: notesData } = await supabase
          .from("book_notes")
          .select("*")
          .eq("book_id", b.id)
          .order("page", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true });

        if (notesData) setNotes(notesData as BookNote[]);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && bookData && user.id === bookData.user_id) {
        setIsOwner(true);
      }
    };
    init();
  }, [slug]);

  const handleSaveBook = async () => {
    if (!book || saving) return;
    setSaving(true);
    const supabase = createClient();

    const updates = {
      title: editTitle,
      author: editAuthor,
      status: editStatus,
      rating: editRating,
      tags: editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      total_pages: editTotalPages ? parseInt(editTotalPages) : null,
      current_page: editCurrentPage ? parseInt(editCurrentPage) : 0,
      started_at: editStartedAt || null,
      finished_at: editFinishedAt || null,
      updated_at: new Date().toISOString(),
    };

    await supabase.from("books").update(updates).eq("id", book.id);
    setBook((prev) => (prev ? { ...prev, ...updates } : null));
    setIsEditing(false);
    setSaving(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !book) return;

    const supabase = createClient();
    const path = `${book.id}/${file.name}`;

    const { error } = await supabase.storage
      .from("book-covers")
      .upload(path, file, { upsert: true });

    if (!error) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("book-covers").getPublicUrl(path);

      await supabase
        .from("books")
        .update({ cover_url: publicUrl })
        .eq("id", book.id);
      setBook((prev) => (prev ? { ...prev, cover_url: publicUrl } : null));
    }
  };

  const handleAddNote = async () => {
    if (!book || !newNoteContent) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("book_notes")
      .insert({
        book_id: book.id,
        page: newNotePage ? parseInt(newNotePage) : null,
        chapter: newNoteChapter || null,
        content: newNoteContent as string,
        type: newNoteType,
        user_id: user.id,
      })
      .select()
      .single();

    if (data) {
      setNotes((prev) =>
        [...prev, data as BookNote].sort((a, b) => {
          if (a.page && b.page) return a.page - b.page;
          if (a.page) return -1;
          if (b.page) return 1;
          return 0;
        }),
      );
      setAddingNote(false);
      setNewNotePage("");
      setNewNoteChapter("");
      setNewNoteContent("");
      newNoteInitialized.current = false;
    }
  };

  const handleDeleteNote = async () => {
    if (!deleteNoteId) return;
    setConfirmOpen(false);
    const supabase = createClient();
    await supabase.from("book_notes").delete().eq("id", deleteNoteId);
    setNotes((prev) => prev.filter((n) => n.id !== deleteNoteId));
    setDeleteNoteId(null);
  };

  const handleNoteContentChange = (content: Content) => {
    if (!newNoteInitialized.current) {
      newNoteInitialized.current = true;
      return;
    }
    setNewNoteContent(content);
  };

  // ctrl+s
  useEffect(() => {
    if (!isEditing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveBook();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  if (!book) {
    return (
      <div className="flex flex-col gap-6 flex-1 w-full max-w-5xl mx-auto">
        <p className="text-subtle font-mono text-sm py-8 text-center">
          loading...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/reading"
          className="text-subtle hover:text-primary transition-colors font-mono text-sm"
        >
          ../
        </Link>
        {isOwner && !isEditing && (
          <Button
            size="sm"
            onClick={() => setIsEditing(true)}
            className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
          >
            Edit
          </Button>
        )}
        {isOwner && isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveBook}
              disabled={saving}
              className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
            >
              <CheckIcon className="size-4 mr-1" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* main layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <BookAside
          book={book}
          isOwner={isOwner}
          isEditing={isEditing}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editAuthor={editAuthor}
          setEditAuthor={setEditAuthor}
          editStatus={editStatus}
          setEditStatus={setEditStatus}
          editRating={editRating}
          setEditRating={setEditRating}
          editTags={editTags}
          setEditTags={setEditTags}
          editTotalPages={editTotalPages}
          setEditTotalPages={setEditTotalPages}
          editCurrentPage={editCurrentPage}
          setEditCurrentPage={setEditCurrentPage}
          editStartedAt={editStartedAt}
          setEditStartedAt={setEditStartedAt}
          editFinishedAt={editFinishedAt}
          setEditFinishedAt={setEditFinishedAt}
          fileInputRef={fileInputRef}
          handleCoverUpload={handleCoverUpload}
        />

        {/* notes */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary font-mono">
              {notes.length > 1
                ? `${notes.length} notes`
                : `${notes.length} note`}
            </span>
            {isOwner && !addingNote && (
              <Button
                size="sm"
                onClick={() => {
                  newNoteInitialized.current = false;
                  setAddingNote(true);
                }}
                className="hover:cursor-pointer rounded-lg hover:bg-primary-hover px-1.5 sm:px-2.5"
              >
                <PlusIcon className="size-4" />
                <span className="hidden sm:block ml-1">Note</span>
              </Button>
            )}
          </div>

          {/* add note form */}
          {addingNote && (
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-2 mb-2">
                <input
                  type="number"
                  value={newNotePage}
                  onChange={(e) => setNewNotePage(e.target.value)}
                  placeholder="page"
                  className="w-20 bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-foreground placeholder:text-subtle/50"
                />
                <input
                  type="text"
                  value={newNoteChapter}
                  onChange={(e) => setNewNoteChapter(e.target.value)}
                  placeholder="chapter"
                  className="flex-1 min-w-32 bg-transparent border border-border rounded-md px-2 py-1 text-sm font-mono text-foreground placeholder:text-subtle/50"
                />
                <div className="flex gap-2">
                  {NOTE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewNoteType(t)}
                      className={`px-2 py-1 rounded-md text-xs font-mono cursor-pointer transition-colors ${
                        newNoteType === t
                          ? "bg-primary text-background"
                          : "bg-surface text-subtle hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <MinimalTiptapThree
                key="note-editor"
                value=""
                onChange={handleNoteContentChange}
                className="w-full"
                editorContentClassName=""
                output="html"
                placeholder="..."
                autofocus={true}
                editable={true}
                editorClassName=""
              />
              <div className="flex gap-2 mt-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setAddingNote(false);
                    setNewNoteContent("");
                    newNoteInitialized.current = false;
                  }}
                  className="hover:cursor-pointer rounded-lg hover:bg-primary-hover/10"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  className="hover:cursor-pointer rounded-lg bg-primary hover:bg-primary-hover px-2.5"
                >
                  Add note
                </Button>
              </div>
            </div>
          )}

          {/* notes list */}
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex gap-3 py-3 border-b border-border/30 last:border-0"
            >
              <div className="pt-0.5 text-subtle/40">
                {NOTE_TYPE_ICONS[note.type]}
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-mono text-subtle/40">
                  {note.page && <span>p.{note.page}</span>}
                  {note.chapter && <span>{note.chapter}</span>}
                  <span>{note.type}</span>
                </div>
                <MinimalTiptapThree
                  value={note.content}
                  className="w-full"
                  editable={false}
                  editorClassName=""
                  editorContentClassName=""
                />
              </div>
              {isOwner && (
                <Trash2
                  className="size-4 text-subtle/40 hover:text-danger transition-colors shrink-0 cursor-pointer mt-0.5"
                  onClick={() => {
                    setDeleteNoteId(note.id);
                    setConfirmOpen(true);
                  }}
                />
              )}
            </div>
          ))}

          {notes.length === 0 && !addingNote && (
            <p className="text-subtle font-mono text-sm py-8 text-center">
              no notes yet.
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="$ rm"
        description="delete this note?"
        onConfirm={handleDeleteNote}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteNoteId(null);
        }}
      />
    </div>
  );
}
