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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      email_preferences: {
        Row: {
          created_at: string
          email: string
          feature_announcements: boolean
          id: string
          last_usage_alert_at: string | null
          marketing: boolean
          updated_at: string
          usage_alerts: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          feature_announcements?: boolean
          id?: string
          last_usage_alert_at?: string | null
          marketing?: boolean
          updated_at?: string
          usage_alerts?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          feature_announcements?: boolean
          id?: string
          last_usage_alert_at?: string | null
          marketing?: boolean
          updated_at?: string
          usage_alerts?: boolean
          user_id?: string
        }
        Relationships: []
      }
      feature_announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          sent_at: string | null
          target_plans: string[]
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sent_at?: string | null
          target_plans?: string[]
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sent_at?: string | null
          target_plans?: string[]
          title?: string
        }
        Relationships: []
      }
      lifetime_spots: {
        Row: {
          id: string
          sold_count: number
          total_spots: number
          updated_at: string
        }
        Insert: {
          id?: string
          sold_count?: number
          total_spots?: number
          updated_at?: string
        }
        Update: {
          id?: string
          sold_count?: number
          total_spots?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          dodo_customer_id: string | null
          dodo_payment_id: string | null
          dodo_subscription_id: string | null
          event_type: string
          id: string
          plan_name: string | null
          raw_payload: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          dodo_customer_id?: string | null
          dodo_payment_id?: string | null
          dodo_subscription_id?: string | null
          event_type: string
          id?: string
          plan_name?: string | null
          raw_payload?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          dodo_customer_id?: string | null
          dodo_payment_id?: string | null
          dodo_subscription_id?: string | null
          event_type?: string
          id?: string
          plan_name?: string | null
          raw_payload?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          daily_page_limit: number | null
          display_name: string
          dodo_product_id: string | null
          id: string
          is_recurring: boolean
          monthly_page_limit: number | null
          name: Database["public"]["Enums"]["plan_type"]
          pii_masking: Database["public"]["Enums"]["pii_masking_level"]
          price_cents: number
        }
        Insert: {
          created_at?: string
          daily_page_limit?: number | null
          display_name: string
          dodo_product_id?: string | null
          id?: string
          is_recurring?: boolean
          monthly_page_limit?: number | null
          name: Database["public"]["Enums"]["plan_type"]
          pii_masking?: Database["public"]["Enums"]["pii_masking_level"]
          price_cents?: number
        }
        Update: {
          created_at?: string
          daily_page_limit?: number | null
          display_name?: string
          dodo_product_id?: string | null
          id?: string
          is_recurring?: boolean
          monthly_page_limit?: number | null
          name?: Database["public"]["Enums"]["plan_type"]
          pii_masking?: Database["public"]["Enums"]["pii_masking_level"]
          price_cents?: number
        }
        Relationships: []
      }
      processing_history: {
        Row: {
          completed_at: string | null
          created_at: string
          export_type: string | null
          file_name: string
          file_size_bytes: number | null
          id: string
          pages_processed: number
          status: string
          transactions_extracted: number | null
          user_id: string
          validation_errors: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          export_type?: string | null
          file_name: string
          file_size_bytes?: number | null
          id?: string
          pages_processed?: number
          status?: string
          transactions_extracted?: number | null
          user_id: string
          validation_errors?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          export_type?: string | null
          file_name?: string
          file_size_bytes?: number | null
          id?: string
          pages_processed?: number
          status?: string
          transactions_extracted?: number | null
          user_id?: string
          validation_errors?: number | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          created_at: string
          id: string
          pages_processed: number
          session_fingerprint: string | null
          updated_at: string
          usage_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          pages_processed?: number
          session_fingerprint?: string | null
          updated_at?: string
          usage_date?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          pages_processed?: number
          session_fingerprint?: string | null
          updated_at?: string
          usage_date?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string
          dodo_customer_id: string | null
          dodo_payment_id: string | null
          dodo_subscription_id: string | null
          expires_at: string | null
          id: string
          plan_id: string
          started_at: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          dodo_customer_id?: string | null
          dodo_payment_id?: string | null
          dodo_subscription_id?: string | null
          expires_at?: string | null
          id?: string
          plan_id: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          dodo_customer_id?: string | null
          dodo_payment_id?: string | null
          dodo_subscription_id?: string | null
          expires_at?: string | null
          id?: string
          plan_id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_subscriptions_public: {
        Row: {
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          plan_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_lifetime_members_for_announcement: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
      get_lifetime_spots_remaining: { Args: never; Returns: number }
      get_remaining_pages: {
        Args: { p_session_fingerprint?: string; p_user_id?: string }
        Returns: number
      }
      get_user_plan: {
        Args: { p_user_id?: string }
        Returns: {
          daily_limit: number
          display_name: string
          monthly_limit: number
          pii_masking: Database["public"]["Enums"]["pii_masking_level"]
          plan_name: Database["public"]["Enums"]["plan_type"]
        }[]
      }
      get_user_stats: {
        Args: { p_user_id: string }
        Returns: {
          files_this_month: number
          pages_this_month: number
          total_files_processed: number
          total_pages_processed: number
          total_transactions_extracted: number
        }[]
      }
      get_users_needing_usage_alert: {
        Args: never
        Returns: {
          daily_limit: number
          email: string
          pages_used: number
          percent_used: number
          user_id: string
        }[]
      }
    }
    Enums: {
      pii_masking_level: "none" | "optional" | "enforced"
      plan_type:
        | "anonymous"
        | "registered_free"
        | "starter"
        | "pro"
        | "business"
        | "lifetime"
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
      pii_masking_level: ["none", "optional", "enforced"],
      plan_type: [
        "anonymous",
        "registered_free",
        "starter",
        "pro",
        "business",
        "lifetime",
      ],
    },
  },
} as const
