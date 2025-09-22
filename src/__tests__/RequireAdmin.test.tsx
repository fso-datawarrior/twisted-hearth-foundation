import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import RequireAdmin from '@/components/RequireAdmin';

// Mock useAuth to control user state
vi.mock('@/lib/auth', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'u@example.com' }, loading: false })
}));

// Mock supabase client and RPC
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: false, error: null })
  }
}));

describe('RequireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('blocks non-admin users and shows Access Denied', async () => {
    render(
      <RequireAdmin>
        <div>secret admin content</div>
      </RequireAdmin>
    );

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  it('renders children when user is admin', async () => {
    // Update mock to return true
    const client = await import('@/integrations/supabase/client');
    (client as any).supabase.rpc.mockResolvedValueOnce({ data: true, error: null });

    render(
      <RequireAdmin>
        <div>secret admin content</div>
      </RequireAdmin>
    );

    await waitFor(() => {
      expect(screen.getByText('secret admin content')).toBeInTheDocument();
    });
  });
});
