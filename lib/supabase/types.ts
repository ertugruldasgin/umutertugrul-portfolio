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
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          content: Json;
          location?: string | null;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          content?: string;
          location?: string | null;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      diagrams: {
        Row: {
          id: string;
          title: string;
          elements: Json;
          app_state: Json | null;
          files: Json | null;
          user_id: string | null;
          created_at: string;
          updated_at: string;
          parent_id: string | null;
          is_folder: boolean;
        };
        Insert: {
          id?: string;
          title?: string;
          elements?: Json;
          app_state?: Json | null;
          files?: Json | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
          is_folder?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          elements?: Json;
          app_state?: Json | null;
          files?: Json | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
          is_folder?: boolean;
        };
        Relationships: [];
      };
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          user_id: string | null;
          created_at: string;
          updated_at: string;
          parent_id: string | null;
          is_folder: boolean;
        };
        Insert: {
          id?: string;
          title?: string;
          content?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
          is_folder?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
          parent_id?: string | null;
          is_folder?: boolean;
        };
        Relationships: [];
      };
      blogs: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          tags: string[];
          published: boolean;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title?: string;
          slug: string;
          content?: string;
          tags?: string[];
          published?: boolean;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          tags?: string[];
          published?: boolean;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
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
