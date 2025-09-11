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
      guestbook: {
        Row: {
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          is_anonymous: boolean
          message: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          display_name: string
          id?: string
          is_anonymous?: boolean
          message: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          id?: string
          is_anonymous?: boolean
          message?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      guestbook_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string | null
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
          is_anonymous: boolean
          message: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_anonymous?: boolean
          message: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_anonymous?: boolean
          message?: string
          post_id?: string | null
          user_id?: string
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
          post_id: string | null
          reason: string | null
          reporter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reason?: string | null
          reporter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reason?: string | null
          reporter_id?: string
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
          category: string
          created_at: string
          description: string
          difficulty_level: string
          hint_text: string
          id: number
          is_active: boolean
          points: number
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty_level: string
          hint_text: string
          id?: never
          is_active?: boolean
          points?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty_level?: string
          hint_text?: string
          id?: never
          is_active?: boolean
          points?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hunt_progress: {
        Row: {
          created_at: string
          found_at: string
          hint_id: number
          hunt_run_id: string
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          created_at?: string
          found_at?: string
          hint_id: number
          hunt_run_id: string
          id?: string
          points_earned?: number
          user_id: string
        }
        Update: {
          created_at?: string
          found_at?: string
          hint_id?: number
          hunt_run_id?: string
          id?: string
          points_earned?: number
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
          created_at: string
          description: string | null
          earned_at: string
          hunt_run_id: string
          id: string
          reward_name: string
          reward_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          earned_at?: string
          hunt_run_id: string
          id?: string
          reward_name: string
          reward_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          earned_at?: string
          hunt_run_id?: string
          id?: string
          reward_name?: string
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
          created_at: string
          id: string
          started_at: string
          status: string
          total_points: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          total_points?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          status?: string
          total_points?: number
          user_id?: string
        }
        Relationships: []
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
          reaction_type: string
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
          file_size: number | null
          filename: string
          id: string
          is_approved: boolean
          is_featured: boolean
          likes_count: number
          mime_type: string | null
          storage_path: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          file_size?: number | null
          filename: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          likes_count?: number
          mime_type?: string | null
          storage_path: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          file_size?: number | null
          filename?: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          likes_count?: number
          mime_type?: string | null
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
          id: string
          item_name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          contributions: string | null
          costume_idea: string | null
          created_at: string
          dietary_restrictions: string | null
          email_sent_at: string | null
          idempotency_token: string | null
          num_guests: number
          rsvp_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contributions?: string | null
          costume_idea?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          email_sent_at?: string | null
          idempotency_token?: string | null
          num_guests?: number
          rsvp_id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contributions?: string | null
          costume_idea?: string | null
          created_at?: string
          dietary_restrictions?: string | null
          email_sent_at?: string | null
          idempotency_token?: string | null
          num_guests?: number
          rsvp_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tournament_matches: {
        Row: {
          created_at: string
          id: string
          match_date: string | null
          score: string | null
          status: string
          team1_id: string | null
          team2_id: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_date?: string | null
          score?: string | null
          status?: string
          team1_id?: string | null
          team2_id?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_date?: string | null
          score?: string | null
          status?: string
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
          status: string
          team_name: string | null
          tournament_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          id?: string
          special_requirements?: string | null
          status?: string
          team_name?: string | null
          tournament_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          id?: string
          special_requirements?: string | null
          status?: string
          team_name?: string | null
          tournament_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tournament_teams: {
        Row: {
          captain_id: string | null
          created_at: string
          id: string
          members: string[] | null
          status: string
          team_name: string
        }
        Insert: {
          captain_id?: string | null
          created_at?: string
          id?: string
          members?: string[] | null
          status?: string
          team_name: string
        }
        Update: {
          captain_id?: string | null
          created_at?: string
          id?: string
          members?: string[] | null
          status?: string
          team_name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_provider_id: string | null
          created_at: string
          email: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_provider_id?: string | null
          created_at?: string
          email: string
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          auth_provider_id?: string | null
          created_at?: string
          email?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vignettes: {
        Row: {
          author: string | null
          content: string
          created_at: string
          event_year: number | null
          id: string
          is_featured: boolean
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          event_year?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          event_year?: number | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      guestbook_insert_message: {
        Args: {
          p_display_name: string
          p_is_anonymous?: boolean
          p_message: string
        }
        Returns: {
          created_at: string
          deleted_at: string | null
          display_name: string
          id: string
          is_anonymous: boolean
          message: string
          updated_at: string | null
          user_id: string
        }
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      submit_rsvp: {
        Args: {
          p_contributions: string
          p_costume_idea: string
          p_dietary: string
          p_email: string
          p_idempotency?: string
          p_name: string
          p_num_guests: number
        }
        Returns: {
          rsvp_id: string
          updated: boolean
        }[]
      }
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
