import { createClient } from "@/lib/supabase/server";
import { NotesContent } from "@/components/notes/notes-content";

export const metadata = {
  title: "notes",
};

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string; f?: string }>;
}) {
  const { n: noteId, f: folderId } = await searchParams;
  const supabase = await createClient();

  const parentId = folderId ?? null;
  let query = supabase
    .from("notes")
    .select("*")
    .order("is_folder", { ascending: false })
    .order("updated_at", { ascending: false });

  if (parentId === null) {
    query = query.is("parent_id", null);
  } else {
    query = query.eq("parent_id", parentId);
  }

  const { data: items } = await query;

  let initialNote = null;
  if (noteId) {
    const { data: note } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single();
    initialNote = note;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = !!user;

  return (
    <NotesContent
      initialItems={items || []}
      initialNote={initialNote}
      initialFolderId={folderId ?? null}
      isOwner={isOwner}
    />
  );
}
