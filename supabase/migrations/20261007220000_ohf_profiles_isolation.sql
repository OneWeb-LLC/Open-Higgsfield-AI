-- Open Higgsfield AI satellite (app_id=open-higgsfield-ai) on shared One OS
-- Local profile projection only: id = auth.users.id, self-only RLS (no ao_org_members helpers).

-- Remove unused draft helper if a prior apply created it (never referenced by ohf_profiles policy).
DROP FUNCTION IF EXISTS public.ohf_is_workspace_member(UUID);

CREATE TABLE IF NOT EXISTS public.ohf_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  one_id TEXT,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ohf_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ohf_profiles FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.ohf_profiles FROM PUBLIC;
REVOKE ALL ON TABLE public.ohf_profiles FROM anon;
REVOKE ALL ON TABLE public.ohf_profiles FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.ohf_profiles TO authenticated;
GRANT ALL ON TABLE public.ohf_profiles TO service_role;

DROP POLICY IF EXISTS ohf_profiles_self ON public.ohf_profiles;
CREATE POLICY ohf_profiles_self ON public.ohf_profiles
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
