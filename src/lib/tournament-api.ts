import { supabase } from '@/integrations/supabase/client';

// ================================================================
// TOURNAMENT SYSTEM DATABASE API
// ================================================================

export interface TournamentRegistration {
  id: string;
  user_id: string;
  tournament_name: string;
  team_name: string;
  contact_info?: string;
  special_requirements?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TournamentTeam {
  id: string;
  team_name: string;
  captain_id?: string;
  members: string[];
  status: 'active' | 'eliminated' | 'winner';
  created_at: string;
}

export interface TournamentMatch {
  id: string;
  team1_id?: string;
  team2_id?: string;
  match_date?: string;
  winner_id?: string;
  score?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

// ================================================================
// API FUNCTIONS
// ================================================================

/**
 * Register for a tournament
 */
export const registerForTournament = async (
  tournamentName: string,
  teamName: string,
  contactInfo?: string,
  specialRequirements?: string
): Promise<{ data: TournamentRegistration | null; error: any }> => {
  const { data, error } = await (supabase.rpc as any)('register_team', {
    p_tournament_name: tournamentName,
    p_team_name: teamName,
    p_contact_info: contactInfo || null,
    p_special_requirements: specialRequirements || null
  });

  return { data: data as any, error };
};

/**
 * Get all tournament registrations (public - safe fields only)
 */
export const getTournamentRegistrations = async (): Promise<{ data: Omit<TournamentRegistration, 'contact_info' | 'special_requirements'>[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('tournament_registrations' as any)
    .select('id, user_id, tournament_name, team_name, status, created_at, updated_at')
    .order('created_at', { ascending: false });

  return { data: data as any, error };
};

/**
 * Get all tournament registrations with sensitive data (admin only)
 */
export const getTournamentRegistrationsAdmin = async (): Promise<{ data: TournamentRegistration[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('tournament_registrations' as any)
    .select(`
      id,
      user_id,
      tournament_name,
      team_name,
      contact_info,
      special_requirements,
      status,
      created_at,
      updated_at
    `)
    .order('created_at', { ascending: false });

  return { data: data as any, error };
};

/**
 * Get tournament teams
 */
export const getTournamentTeams = async (): Promise<{ data: TournamentTeam[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('tournament_teams' as any)
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data as any, error };
};

/**
 * Get tournament matches
 */
export const getTournamentMatches = async (): Promise<{ data: TournamentMatch[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('tournament_matches')
    .select(`
      *,
      team1:team1_id(team_name),
      team2:team2_id(team_name),
      winner:winner_id(team_name)
    `)
    .order('match_date', { ascending: true });

  return { data: data as any, error }; // Complex join, cast as any
};

/**
 * Get user's tournament registrations
 */
export const getUserTournamentRegistrations = async (): Promise<{ data: TournamentRegistration[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('tournament_registrations' as any)
    .select('*')
    .order('created_at', { ascending: false });

  return { data: data as any, error };
};

/**
 * Subscribe to tournament registration changes
 */
export const subscribeToTournamentRegistrations = (callback: (payload: any) => void) => {
  return supabase
    .channel('tournament_registrations_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tournament_registrations'
      },
      callback
    )
    .subscribe();
};

/**
 * Subscribe to tournament team changes
 */
export const subscribeToTournamentTeams = (callback: (payload: any) => void) => {
  return supabase
    .channel('tournament_teams_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tournament_teams'
      },
      callback
    )
    .subscribe();
};

/**
 * Subscribe to tournament match changes
 */
export const subscribeToTournamentMatches = (callback: (payload: any) => void) => {
  return supabase
    .channel('tournament_matches_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tournament_matches'
      },
      callback
    )
    .subscribe();
};