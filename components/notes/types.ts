export interface NoteItem {
  id: string;
  title: string;
  content: string;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  is_folder: boolean;
}

export type HistoryState =
  | { type: "root" }
  | { type: "folder"; id: string }
  | { type: "note"; id: string };
