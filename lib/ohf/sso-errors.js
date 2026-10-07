export function formatSsoError(raw) {
  if (raw.includes('sso_misconfigured') || raw.includes('SUPABASE_SERVICE_ROLE_KEY')) {
    return 'Server SSO is not configured (missing service role). Contact the platform operator.';
  }
  if (raw.includes('launch_token_consumed')) {
    return 'This launch link was already used. Start again from OWeb.';
  }
  if (raw.includes('launch_token_expired')) {
    return 'This launch link expired. Start again from OWeb.';
  }
  if (raw.includes('launch_token_wrong_app')) {
    return 'This launch link is for a different app.';
  }
  if (raw.includes('invalid_launch_token') || raw.includes('missing_launch_token')) {
    return 'Invalid or missing launch token. Open Open Higgsfield AI from the OWeb App Store.';
  }
  return raw;
}
