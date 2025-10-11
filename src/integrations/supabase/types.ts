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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaign_recipients: {
        Row: {
          campaign_id: string
          delivered_at: string | null
          email: string
          error_message: string | null
          id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          delivered_at?: string | null
          email: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          campaign_id?: string
          delivered_at?: string | null
          email?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          custom_recipients: string[] | null
          id: string
          recipient_list: string
          scheduled_at: string | null
          sent_at: string | null
          stats: Json | null
          status: string
          subject: string
          template_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          custom_recipients?: string[] | null
          id?: string
          recipient_list: string
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string
          subject: string
          template_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          custom_recipients?: string[] | null
          id?: string
          recipient_list?: string
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json | null
          status?: string
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string
          created_by: string | null
          html_content: string
          id: string
          is_active: boolean
          name: string
          preview_text: string | null
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          html_content: string
          id?: string
          is_active?: boolean
          name: string
          preview_text?: string | null
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          html_content?: string
          id?: string
          is_active?: boolean
          name?: string
          preview_text?: string | null
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      guestbook: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          is_anonymous: boolean | null
          message: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_name: string
          id?: string
          is_anonymous?: boolean | null
          message: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      guestbook_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "guestbook"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook_replies: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_anonymous: boolean | null
          message: string
          post_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_anonymous?: boolean | null
          message: string
          post_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string
          post_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "guestbook"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook_reports: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "guestbook"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_hints: {
        Row: {
          created_at: string
          hint_text: string
          id: number
          is_active: boolean | null
          location: string | null
          points: number | null
          rune_id: string
        }
        Insert: {
          created_at?: string
          hint_text: string
          id?: number
          is_active?: boolean | null
          location?: string | null
          points?: number | null
          rune_id: string
        }
        Update: {
          created_at?: string
          hint_text?: string
          id?: number
          is_active?: boolean | null
          location?: string | null
          points?: number | null
          rune_id?: string
        }
        Relationships: []
      }
      hunt_progress: {
        Row: {
          found_at: string
          hint_id: number
          hunt_run_id: string
          id: string
          points_earned: number | null
          user_id: string
        }
        Insert: {
          found_at?: string
          hint_id: number
          hunt_run_id: string
          id?: string
          points_earned?: number | null
          user_id: string
        }
        Update: {
          found_at?: string
          hint_id?: number
          hunt_run_id?: string
          id?: string
          points_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_progress_hint_id_fkey"
            columns: ["hint_id"]
            isOneToOne: false
            referencedRelation: "hunt_hints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunt_progress_hunt_run_id_fkey"
            columns: ["hunt_run_id"]
            isOneToOne: false
            referencedRelation: "hunt_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_rewards: {
        Row: {
          claimed_at: string
          hunt_run_id: string
          id: string
          reward_data: Json | null
          reward_type: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          hunt_run_id: string
          id?: string
          reward_data?: Json | null
          reward_type: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          hunt_run_id?: string
          id?: string
          reward_data?: Json | null
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunt_rewards_hunt_run_id_fkey"
            columns: ["hunt_run_id"]
            isOneToOne: false
            referencedRelation: "hunt_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_runs: {
        Row: {
          completed_at: string | null
          id: string
          started_at: string
          total_points: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          started_at?: string
          total_points?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          started_at?: string
          total_points?: number | null
          user_id?: string
        }
        Relationships: []
      }
      past_vignettes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          is_active: boolean | null
          photo_ids: string[] | null
          sort_order: number | null
          teaser_url: string | null
          theme_tag: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          updated_by: string | null
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          photo_ids?: string[] | null
          sort_order?: number | null
          teaser_url?: string | null
          theme_tag: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          photo_ids?: string[] | null
          sort_order?: number | null
          teaser_url?: string | null
          theme_tag?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          year?: number
        }
        Relationships: []
      }
      photo_emoji_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_emoji_reactions_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_reactions: {
        Row: {
          created_at: string
          id: string
          photo_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id: string
          reaction_type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_reactions_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          filename: string
          id: string
          is_approved: boolean | null
          is_favorite: boolean | null
          is_featured: boolean | null
          is_vignette_selected: boolean | null
          likes_count: number | null
          storage_path: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          filename: string
          id?: string
          is_approved?: boolean | null
          is_favorite?: boolean | null
          is_featured?: boolean | null
          is_vignette_selected?: boolean | null
          likes_count?: number | null
          storage_path: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          filename?: string
          id?: string
          is_approved?: boolean | null
          is_favorite?: boolean | null
          is_featured?: boolean | null
          is_vignette_selected?: boolean | null
          likes_count?: number | null
          storage_path?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      potluck_items: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_name: string | null
          id: string
          is_gluten_free: boolean | null
          is_vegan: boolean | null
          item_name: string
          notes: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          id?: string
          is_gluten_free?: boolean | null
          is_vegan?: boolean | null
          item_name: string
          notes?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string | null
          id?: string
          is_gluten_free?: boolean | null
          is_vegan?: boolean | null
          item_name?: string
          notes?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          additional_guests: Json | null
          created_at: string
          dietary_restrictions: string | null
          email: string
          email_sent_at: string | null
          id: string
          is_approved: boolean | null
          name: string
          num_guests: number
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          additional_guests?: Json | null
          created_at?: string
          dietary_restrictions?: string | null
          email: string
          email_sent_at?: string | null
          id?: string
          is_approved?: boolean | null
          name: string
          num_guests?: number
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          additional_guests?: Json | null
          created_at?: string
          dietary_restrictions?: string | null
          email?: string
          email_sent_at?: string | null
          id?: string
          is_approved?: boolean | null
          name?: string
          num_guests?: number
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      signature_libations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          image_url: string | null
          ingredients: string[]
          is_active: boolean
          libation_type: string
          name: string
          prep_notes: string | null
          prep_time: string | null
          serving_size: string | null
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          image_url?: string | null
          ingredients?: string[]
          is_active?: boolean
          libation_type?: string
          name: string
          prep_notes?: string | null
          prep_time?: string | null
          serving_size?: string | null
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_url?: string | null
          ingredients?: string[]
          is_active?: boolean
          libation_type?: string
          name?: string
          prep_notes?: string | null
          prep_time?: string | null
          serving_size?: string | null
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      tournament_matches: {
        Row: {
          created_at: string
          id: string
          match_time: string | null
          round: number | null
          status: string | null
          team1_id: string | null
          team2_id: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_time?: string | null
          round?: number | null
          status?: string | null
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_time?: string | null
          round?: number | null
          status?: string | null
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_team1_id_fkey"
            columns: ["team1_id"]
            isOneToOne: false
            referencedRelation: "tournament_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_team2_id_fkey"
            columns: ["team2_id"]
            isOneToOne: false
            referencedRelation: "tournament_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "tournament_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          contact_info: string | null
          created_at: string
          id: string
          special_requirements: string | null
          team_name: string
          tournament_name: string
          user_id: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          id?: string
          special_requirements?: string | null
          team_name: string
          tournament_name: string
          user_id: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          id?: string
          special_requirements?: string | null
          team_name?: string
          tournament_name?: string
          user_id?: string
        }
        Relationships: []
      }
      tournament_teams: {
        Row: {
          captain_id: string | null
          created_at: string
          id: string
          losses: number | null
          members: Json | null
          team_name: string
          wins: number | null
        }
        Insert: {
          captain_id?: string | null
          created_at?: string
          id?: string
          losses?: number | null
          members?: Json | null
          team_name: string
          wins?: number | null
        }
        Update: {
          captain_id?: string | null
          created_at?: string
          id?: string
          losses?: number | null
          members?: Json | null
          team_name?: string
          wins?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_rsvp_status: {
        Args: { p_is_approved?: boolean; p_rsvp_id: string; p_status: string }
        Returns: undefined
      }
      check_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      ensure_admins_seeded: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_active_vignettes: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          created_by: string
          description: string
          id: string
          is_active: boolean
          photo_ids: string[]
          sort_order: number
          theme_tag: string
          title: string
          updated_at: string
          updated_by: string
          year: number
        }[]
      }
      get_hunt_stats: {
        Args: { p_user_id?: string }
        Returns: {
          completed_runs: number
          total_hints_found: number
          total_points: number
        }[]
      }
      guestbook_insert_message: {
        Args: {
          p_display_name: string
          p_is_anonymous?: boolean
          p_message: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      manage_vignette: {
        Args: {
          p_action: string
          p_description?: string
          p_is_active?: boolean
          p_photo_ids?: string[]
          p_sort_order?: number
          p_theme_tag?: string
          p_title?: string
          p_vignette_id?: string
          p_year?: number
        }
        Returns: Json
      }
      mark_hint_found: {
        Args: { p_hint_id: number; p_hunt_run_id?: string }
        Returns: Json
      }
      moderate_photo: {
        Args: { p_approved: boolean; p_featured?: boolean; p_photo_id: string }
        Returns: undefined
      }
      register_team: {
        Args: {
          p_contact_info?: string
          p_special_requirements?: string
          p_team_name: string
          p_tournament_name: string
        }
        Returns: string
      }
      soft_delete_potluck_item: {
        Args: { p_item_id: string }
        Returns: undefined
      }
      submit_rsvp: {
        Args: {
          p_contributions?: string
          p_costume_idea?: string
          p_dietary?: string
          p_email: string
          p_idempotency?: string
          p_name: string
          p_num_guests: number
        }
        Returns: string
      }
      toggle_photo_reaction: {
        Args: { p_photo_id: string; p_reaction_type?: string }
        Returns: boolean
      }
      toggle_vignette_selection: {
        Args: { p_photo_id: string; p_selected: boolean }
        Returns: Json
      }
      upload_photo: {
        Args: {
          p_caption?: string
          p_category?: string
          p_filename: string
          p_storage_path: string
          p_tags?: string[]
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
