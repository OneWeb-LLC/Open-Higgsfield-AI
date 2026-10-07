-- Open Higgsfield AI satellite (app_id=open-higgsfield-ai) on shared One OS
-- Local profile projection + RLS isolation for ohf_* tables only.

CREATE TABLE IF NOT EXISTS public.ohf_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  one_id TEXT,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ohf_profiles IS
  'Open Higgsfield AI (app_id=open-higgsfield-ai) — local profile projection; id = auth.users.id';

CREATE OR REPLACE FUNCTION public.ohf_is_workspace_member(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ao_org_members
    WHERE org_id = p_org_id
      AND user_id = auth.uid()
      AND left_at IS NULL
  );
$$;

REVOKE ALL ON FUNCTION public.ohf_is_workspace_member(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ohf_is_workspace_member(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ohf_is_workspace_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ohf_is_workspace_member(UUID) TO service_role;

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
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
