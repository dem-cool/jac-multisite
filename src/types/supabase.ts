export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      carousel_slides: {
        Row: {
          created_at: string | null
          dealer_id: string
          headline: string | null
          id: string
          image_url: string
          link: string | null
          sort_order: number
        }
        Insert: {
          created_at?: string | null
          dealer_id: string
          headline?: string | null
          id?: string
          image_url: string
          link?: string | null
          sort_order?: number
        }
        Update: {
          created_at?: string | null
          dealer_id?: string
          headline?: string | null
          id?: string
          image_url?: string
          link?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "carousel_slides_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealers: {
        Row: {
          contact_json: Json | null
          created_at: string | null
          footer_json: Json | null
          id: string
          name: string
          slug: string
          tracking_json: Json | null
        }
        Insert: {
          contact_json?: Json | null
          created_at?: string | null
          footer_json?: Json | null
          id?: string
          name: string
          slug: string
          tracking_json?: Json | null
        }
        Update: {
          contact_json?: Json | null
          created_at?: string | null
          footer_json?: Json | null
          id?: string
          name?: string
          slug?: string
          tracking_json?: Json | null
        }
        Relationships: []
      }
      forms: {
        Row: {
          created_at: string | null
          dealer_id: string
          fields_json: Json | null
          id: string
          name: string
          recipient_email: string
        }
        Insert: {
          created_at?: string | null
          dealer_id: string
          fields_json?: Json | null
          id?: string
          name: string
          recipient_email: string
        }
        Update: {
          created_at?: string | null
          dealer_id?: string
          fields_json?: Json | null
          id?: string
          name?: string
          recipient_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string | null
          cover_url: string | null
          created_at: string | null
          dealer_id: string
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
        }
        Insert: {
          body?: string | null
          cover_url?: string | null
          created_at?: string | null
          dealer_id: string
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
        }
        Update: {
          body?: string | null
          cover_url?: string | null
          created_at?: string | null
          dealer_id?: string
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      press_notes: {
        Row: {
          body: string | null
          cover_url: string | null
          created_at: string | null
          id: string
          published_at: string | null
          slug: string
          title: string
        }
        Insert: {
          body?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          slug: string
          title: string
        }
        Update: {
          body?: string | null
          cover_url?: string | null
          created_at?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      promos: {
        Row: {
          active: boolean
          body: string | null
          created_at: string | null
          dealer_id: string
          hero_url: string | null
          id: string
          slug: string
          title: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string | null
          dealer_id: string
          hero_url?: string | null
          id?: string
          slug: string
          title: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string | null
          dealer_id?: string
          hero_url?: string | null
          id?: string
          slug?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "promos_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          created_at: string | null
          data_json: Json | null
          dealer_id: string
          error: string | null
          form_id: string
          id: string
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_json?: Json | null
          dealer_id: string
          error?: string | null
          form_id: string
          id?: string
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_json?: Json | null
          dealer_id?: string
          error?: string | null
          form_id?: string
          id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
