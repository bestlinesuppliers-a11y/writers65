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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          due_at: string
          id: string
          notes: string | null
          order_id: string
          status: string | null
          writer_id: string
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          due_at: string
          id?: string
          notes?: string | null
          order_id: string
          status?: string | null
          writer_id: string
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          due_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string | null
          writer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_writer_id_fkey"
            columns: ["writer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          cover_letter: string | null
          created_at: string | null
          id: string
          order_id: string
          price_per_page: number | null
          proposed_rate: number | null
          reviewed_at: string | null
          status: string
          time_needed_days: number | null
          time_needed_hours: number | null
          updated_at: string | null
          writer_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          price_per_page?: number | null
          proposed_rate?: number | null
          reviewed_at?: string | null
          status?: string
          time_needed_days?: number | null
          time_needed_hours?: number | null
          updated_at?: string | null
          writer_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          price_per_page?: number | null
          proposed_rate?: number | null
          reviewed_at?: string | null
          status?: string
          time_needed_days?: number | null
          time_needed_hours?: number | null
          updated_at?: string | null
          writer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          closed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          opened_by_id: string
          order_id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by_id: string | null
          status: Database["public"]["Enums"]["dispute_status"] | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          opened_by_id: string
          order_id: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by_id?: string | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          opened_by_id?: string
          order_id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by_id?: string | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_opened_by_id_fkey"
            columns: ["opened_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_id_fkey"
            columns: ["resolved_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_usd: number
          client_id: string
          confirmations: number | null
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          order_id: string
          paid_at: string | null
          payment_address: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          tx_hash: string | null
        }
        Insert: {
          amount_usd: number
          client_id: string
          confirmations?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          order_id: string
          paid_at?: string | null
          payment_address?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tx_hash?: string | null
        }
        Update: {
          amount_usd?: number
          client_id?: string
          confirmations?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          paid_at?: string | null
          payment_address?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          body: string
          created_at: string | null
          from_user_id: string
          id: string
          is_read: boolean | null
          order_id: string
          read_at: string | null
          subject: string | null
          to_user_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          body: string
          created_at?: string | null
          from_user_id: string
          id?: string
          is_read?: boolean | null
          order_id: string
          read_at?: string | null
          subject?: string | null
          to_user_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          body?: string
          created_at?: string | null
          from_user_id?: string
          id?: string
          is_read?: boolean | null
          order_id?: string
          read_at?: string | null
          subject?: string | null
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          academic_level: Database["public"]["Enums"]["academic_level"]
          assigned_at: string | null
          attachments: string[] | null
          budget_usd: number
          category: string
          client_id: string
          completed_at: string | null
          created_at: string | null
          deadline: string
          description: string
          id: string
          instructions: string | null
          pages: number
          referencing_style: string | null
          sources: number | null
          status: Database["public"]["Enums"]["order_status"] | null
          title: string
          updated_at: string | null
          words: number
        }
        Insert: {
          academic_level: Database["public"]["Enums"]["academic_level"]
          assigned_at?: string | null
          attachments?: string[] | null
          budget_usd: number
          category: string
          client_id: string
          completed_at?: string | null
          created_at?: string | null
          deadline: string
          description: string
          id?: string
          instructions?: string | null
          pages: number
          referencing_style?: string | null
          sources?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          title: string
          updated_at?: string | null
          words: number
        }
        Update: {
          academic_level?: Database["public"]["Enums"]["academic_level"]
          assigned_at?: string | null
          attachments?: string[] | null
          budget_usd?: number
          category?: string
          client_id?: string
          completed_at?: string | null
          created_at?: string | null
          deadline?: string
          description?: string
          id?: string
          instructions?: string | null
          pages?: number
          referencing_style?: string | null
          sources?: number | null
          status?: Database["public"]["Enums"]["order_status"] | null
          title?: string
          updated_at?: string | null
          words?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          feedback: string | null
          files: string[] | null
          id: string
          is_final: boolean | null
          message: string | null
          order_id: string
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
          version: number
          writer_id: string
        }
        Insert: {
          feedback?: string | null
          files?: string[] | null
          id?: string
          is_final?: boolean | null
          message?: string | null
          order_id: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          version?: number
          writer_id: string
        }
        Update: {
          feedback?: string | null
          files?: string[] | null
          id?: string
          is_final?: boolean | null
          message?: string | null
          order_id?: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          version?: number
          writer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_writer_id_fkey"
            columns: ["writer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      writer_profiles: {
        Row: {
          availability: boolean | null
          bio: string | null
          categories: string[] | null
          completed_orders: number | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          payout_details: Json | null
          payout_method: string | null
          per_page_rate: number | null
          portfolio_items: string[] | null
          rating: number | null
          skills: string[] | null
          updated_at: string | null
          user_id: string
          verification_documents: string[] | null
          verification_status: string | null
        }
        Insert: {
          availability?: boolean | null
          bio?: string | null
          categories?: string[] | null
          completed_orders?: number | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          per_page_rate?: number | null
          portfolio_items?: string[] | null
          rating?: number | null
          skills?: string[] | null
          updated_at?: string | null
          user_id: string
          verification_documents?: string[] | null
          verification_status?: string | null
        }
        Update: {
          availability?: boolean | null
          bio?: string | null
          categories?: string[] | null
          completed_orders?: number | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          payout_details?: Json | null
          payout_method?: string | null
          per_page_rate?: number | null
          portfolio_items?: string[] | null
          rating?: number | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
          verification_documents?: string[] | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "writer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_order_owner: {
        Args: { _order_id: string; _user_id: string }
        Returns: boolean
      }
      is_writer_assigned_to_order: {
        Args: { _order_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      academic_level:
        | "high_school"
        | "undergraduate"
        | "masters"
        | "phd"
        | "professional"
      app_role: "client" | "writer" | "admin"
      dispute_status: "open" | "in_review" | "resolved" | "closed"
      invoice_status: "unpaid" | "pending" | "paid" | "refunded"
      order_status:
        | "pending_payment"
        | "available"
        | "assigned"
        | "in_progress"
        | "submitted"
        | "revision_requested"
        | "completed"
        | "disputed"
        | "cancelled"
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
    Enums: {
      academic_level: [
        "high_school",
        "undergraduate",
        "masters",
        "phd",
        "professional",
      ],
      app_role: ["client", "writer", "admin"],
      dispute_status: ["open", "in_review", "resolved", "closed"],
      invoice_status: ["unpaid", "pending", "paid", "refunded"],
      order_status: [
        "pending_payment",
        "available",
        "assigned",
        "in_progress",
        "submitted",
        "revision_requested",
        "completed",
        "disputed",
        "cancelled",
      ],
    },
  },
} as const
