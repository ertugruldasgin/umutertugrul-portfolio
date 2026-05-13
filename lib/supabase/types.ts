export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  portfolio: {
    Tables: {
      now_updates: {
        Row: {
          id: string;
          content: string;
          location: string | null;
          published_at: string;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          content: Json;
          location?: string | null;
          published_at?: string;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          content?: string;
          location?: string | null;
          published_at?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["portfolio"]["Tables"]> =
  Database["portfolio"]["Tables"][T]["Row"];

export type InsertTables<T extends keyof Database["portfolio"]["Tables"]> =
  Database["portfolio"]["Tables"][T]["Insert"];

export type UpdateTables<T extends keyof Database["portfolio"]["Tables"]> =
  Database["portfolio"]["Tables"][T]["Update"];
