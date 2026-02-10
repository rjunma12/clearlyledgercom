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
      bank_aliases: {
        Row: {
          alias_name: string
          alias_type: string | null
          bank_profile_id: string
          created_at: string
          id: string
        }
        Insert: {
          alias_name: string
          alias_type?: string | null
          bank_profile_id: string
          created_at?: string
          id?: string
        }
        Update: {
          alias_name?: string
          alias_type?: string | null
          bank_profile_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_aliases_bank_profile_id_fkey"
            columns: ["bank_profile_id"]
            isOneToOne: false
            referencedRelation: "bank_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_profile_contributions: {
        Row: {
          bank_name: string
          contact_email: string | null
          country_code: string
          created_at: string
          id: string
          proposed_profile: Json | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sample_pdf_urls: string[] | null
          status: string
          submitted_by: string
        }
        Insert: {
          bank_name: string
          contact_email?: string | null
          country_code: string
          created_at?: string
          id?: string
          proposed_profile?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_pdf_urls?: string[] | null
          status?: string
          submitted_by: string
        }
        Update: {
          bank_name?: string
          contact_email?: string | null
          country_code?: string
          created_at?: string
          id?: string
          proposed_profile?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_pdf_urls?: string[] | null
          status?: string
          submitted_by?: string
        }
        Relationships: []
      }
      bank_profile_templates: {
        Row: {
          banks_using_count: number
          created_at: string
          description: string | null
          id: string
          region: string | null
          template_name: string
          template_patterns: Json | null
          updated_at: string
        }
        Insert: {
          banks_using_count?: number
          created_at?: string
          description?: string | null
          id?: string
          region?: string | null
          template_name: string
          template_patterns?: Json | null
          updated_at?: string
        }
        Update: {
          banks_using_count?: number
          created_at?: string
          description?: string | null
          id?: string
          region?: string | null
          template_name?: string
          template_patterns?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      bank_profile_test_results: {
        Row: {
          accuracy_rate: number | null
          bank_profile_id: string
          created_at: string
          errors: Json | null
          id: string
          test_duration_ms: number | null
          test_file_hash: string | null
          test_file_name: string | null
          tested_by: string | null
          transactions_expected: number | null
          transactions_extracted: number | null
          version: number
        }
        Insert: {
          accuracy_rate?: number | null
          bank_profile_id: string
          created_at?: string
          errors?: Json | null
          id?: string
          test_duration_ms?: number | null
          test_file_hash?: string | null
          test_file_name?: string | null
          tested_by?: string | null
          transactions_expected?: number | null
          transactions_extracted?: number | null
          version: number
        }
        Update: {
          accuracy_rate?: number | null
          bank_profile_id?: string
          created_at?: string
          errors?: Json | null
          id?: string
          test_duration_ms?: number | null
          test_file_hash?: string | null
          test_file_name?: string | null
          tested_by?: string | null
          transactions_expected?: number | null
          transactions_extracted?: number | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "bank_profile_test_results_bank_profile_id_fkey"
            columns: ["bank_profile_id"]
            isOneToOne: false
            referencedRelation: "bank_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_profile_versions: {
        Row: {
          bank_profile_id: string
          change_summary: string | null
          changed_by: string | null
          created_at: string
          id: string
          is_published: boolean
          profile_data: Json | null
          version: number
        }
        Insert: {
          bank_profile_id: string
          change_summary?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          profile_data?: Json | null
          version: number
        }
        Update: {
          bank_profile_id?: string
          change_summary?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          profile_data?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "bank_profile_versions_bank_profile_id_fkey"
            columns: ["bank_profile_id"]
            isOneToOne: false
            referencedRelation: "bank_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_profiles: {
        Row: {
          bank_code: string
          bank_name: string
          column_config: Json | null
          confidence_threshold: number
          country_code: string
          created_at: string
          created_by: string | null
          currency_code: string | null
          detect_patterns: Json | null
          display_name: string
          id: string
          is_active: boolean
          is_verified: boolean
          last_used_at: string | null
          regional_config: Json | null
          source: string | null
          success_rate: number | null
          swift_code: string | null
          transaction_patterns: Json | null
          updated_at: string
          usage_count: number
          validation_rules: Json | null
          version: number
        }
        Insert: {
          bank_code: string
          bank_name: string
          column_config?: Json | null
          confidence_threshold?: number
          country_code: string
          created_at?: string
          created_by?: string | null
          currency_code?: string | null
          detect_patterns?: Json | null
          display_name: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          last_used_at?: string | null
          regional_config?: Json | null
          source?: string | null
          success_rate?: number | null
          swift_code?: string | null
          transaction_patterns?: Json | null
          updated_at?: string
          usage_count?: number
          validation_rules?: Json | null
          version?: number
        }
        Update: {
          bank_code?: string
          bank_name?: string
          column_config?: Json | null
          confidence_threshold?: number
          country_code?: string
          created_at?: string
          created_by?: string | null
          currency_code?: string | null
          detect_patterns?: Json | null
          display_name?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          last_used_at?: string | null
          regional_config?: Json | null
          source?: string | null
          success_rate?: number | null
          swift_code?: string | null
          transaction_patterns?: Json | null
          updated_at?: string
          usage_count?: number
          validation_rules?: Json | null
          version?: number
        }
        Relationships: []
      }
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
      error_logs: {
        Row: {
          action: string | null
          component: string | null
          created_at: string
          error_code: string | null
          error_message: string
          error_type: string
          id: string
          metadata: Json | null
          notes: string | null
          resolved_at: string | null
          session_fingerprint: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          component?: string | null
          created_at?: string
          error_code?: string | null
          error_message: string
          error_type: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          resolved_at?: string | null
          session_fingerprint?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          component?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string
          error_type?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          resolved_at?: string | null
          session_fingerprint?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      export_logs: {
        Row: {
          created_at: string | null
          export_type: string
          filename: string
          format: string
          id: string
          page_count: number | null
          pii_exposed: boolean | null
          transaction_count: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          export_type: string
          filename: string
          format: string
          id?: string
          page_count?: number | null
          pii_exposed?: boolean | null
          transaction_count?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          export_type?: string
          filename?: string
          format?: string
          id?: string
          page_count?: number | null
          pii_exposed?: boolean | null
          transaction_count?: number
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
          event_type: string
          id: string
          plan_name: string | null
          provider_customer_id: string | null
          provider_name: string | null
          provider_payment_id: string | null
          provider_subscription_id: string | null
          raw_payload: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          event_type: string
          id?: string
          plan_name?: string | null
          provider_customer_id?: string | null
          provider_name?: string | null
          provider_payment_id?: string | null
          provider_subscription_id?: string | null
          raw_payload?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          event_type?: string
          id?: string
          plan_name?: string | null
          provider_customer_id?: string | null
          provider_name?: string | null
          provider_payment_id?: string | null
          provider_subscription_id?: string | null
          raw_payload?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          allowed_formats: string[] | null
          created_at: string
          daily_page_limit: number | null
          display_name: string
          id: string
          is_recurring: boolean
          monthly_page_limit: number | null
          name: Database["public"]["Enums"]["plan_type"]
          pii_masking: Database["public"]["Enums"]["pii_masking_level"]
          price_cents: number
          provider_price_id: string | null
          provider_product_id: string | null
        }
        Insert: {
          allowed_formats?: string[] | null
          created_at?: string
          daily_page_limit?: number | null
          display_name: string
          id?: string
          is_recurring?: boolean
          monthly_page_limit?: number | null
          name: Database["public"]["Enums"]["plan_type"]
          pii_masking?: Database["public"]["Enums"]["pii_masking_level"]
          price_cents?: number
          provider_price_id?: string | null
          provider_product_id?: string | null
        }
        Update: {
          allowed_formats?: string[] | null
          created_at?: string
          daily_page_limit?: number | null
          display_name?: string
          id?: string
          is_recurring?: boolean
          monthly_page_limit?: number | null
          name?: Database["public"]["Enums"]["plan_type"]
          pii_masking?: Database["public"]["Enums"]["pii_masking_level"]
          price_cents?: number
          provider_price_id?: string | null
          provider_product_id?: string | null
        }
        Relationships: []
      }
      processing_history: {
        Row: {
          completed_at: string | null
          created_at: string
          error_count: number | null
          export_type: string | null
          file_name: string
          file_size_bytes: number | null
          id: string
          pages_processed: number
          status: string
          transactions_extracted: number | null
          user_id: string
          validation_errors: number | null
          validation_status: string | null
          warning_count: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_count?: number | null
          export_type?: string | null
          file_name: string
          file_size_bytes?: number | null
          id?: string
          pages_processed?: number
          status?: string
          transactions_extracted?: number | null
          user_id: string
          validation_errors?: number | null
          validation_status?: string | null
          warning_count?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_count?: number | null
          export_type?: string | null
          file_name?: string
          file_size_bytes?: number | null
          id?: string
          pages_processed?: number
          status?: string
          transactions_extracted?: number | null
          user_id?: string
          validation_errors?: number | null
          validation_status?: string | null
          warning_count?: number | null
        }
        Relationships: []
      }
      processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          file_size: number | null
          filename: string | null
          id: string
          started_at: string | null
          status: string
          total_transactions: number | null
          transactions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          file_size?: number | null
          filename?: string | null
          id?: string
          started_at?: string | null
          status?: string
          total_transactions?: number | null
          transactions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          file_size?: number | null
          filename?: string | null
          id?: string
          started_at?: string | null
          status?: string
          total_transactions?: number | null
          transactions?: Json | null
          updated_at?: string | null
          user_id?: string
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
          billing_interval: string | null
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan_id: string
          provider_customer_id: string | null
          provider_name: string | null
          provider_payment_id: string | null
          provider_subscription_id: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id: string
          provider_customer_id?: string | null
          provider_name?: string | null
          provider_payment_id?: string | null
          provider_subscription_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan_id?: string
          provider_customer_id?: string | null
          provider_name?: string | null
          provider_payment_id?: string | null
          provider_subscription_id?: string | null
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
          billing_interval: string | null
          cancel_at_period_end: boolean | null
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string | null
          plan_id: string | null
          provider_name: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          plan_id?: string | null
          provider_name?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_interval?: string | null
          cancel_at_period_end?: boolean | null
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string | null
          plan_id?: string | null
          provider_name?: string | null
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
          allowed_formats: string[]
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
      increment_profile_usage: {
        Args: {
          profile_id: string
          transaction_count: number
          was_successful: boolean
        }
        Returns: undefined
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
        | "starter_annual"
        | "pro_annual"
        | "business_annual"
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
        "starter_annual",
        "pro_annual",
        "business_annual",
      ],
    },
  },
} as const
