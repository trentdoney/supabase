import { type ErrorCode } from './types'

const errorCodes: Array<ErrorCode & { service: 'AUTH' }> = [
  {
    code: 'anonymous_provider_disabled',
    message: 'Anonymous sign-ins are disabled.',
    service: 'AUTH',
  },
  {
    code: 'bad_code_verifier',
    message:
      'Returned from the PKCE flow where the provided code verifier does not match the expected one. Indicates a bug in the implementation of the client library.',
    service: 'AUTH',
  },
  {
    code: 'bad_json',
    message: 'Usually used when the HTTP body of the request is not valid JSON.',
    service: 'AUTH',
  },
  {
    code: 'bad_jwt',
    message: 'JWT sent in the `Authorization` header is not valid.',
    service: 'AUTH',
  },
  {
    code: 'bad_oauth_callback',
    message:
      'OAuth callback from provider to Auth does not have all the required attributes (state). Indicates an issue with the OAuth provider or client library implementation.',
    service: 'AUTH',
  },
  {
    code: 'bad_oauth_state',
    message:
      'OAuth state (data echoed back by the OAuth provider to Supabase Auth) is not in the correct format. Indicates an issue with the OAuth provider integration.',
    service: 'AUTH',
  },
  {
    code: 'captcha_failed',
    message:
      'CAPTCHA challenge could not be verified with the CAPTCHA provider. Check your CAPTCHA integration.',
    service: 'AUTH',
  },
  {
    code: 'conflict',
    message:
      'General database conflict, such as concurrent requests on resources that should not be modified concurrently. Can often occur when you have too many session refresh requests firing off at the same time for a user. Check your app for concurrency issues, and if detected, back off exponentially.',
    service: 'AUTH',
  },
  {
    code: 'email_address_invalid',
    message: 'Example and test domains are currently not supported. Use a different email address.',
    service: 'AUTH',
  },
  {
    code: 'email_address_not_authorized',
    message:
      'Email sending is not allowed for this address as your project is using the default SMTP service. Emails can only be sent to members in your Supabase organization. If you want to send emails to others, set up a [custom SMTP provider](https://supabase.com/docs/guides/auth/auth-smtp).',
    service: 'AUTH',
  },
  {
    code: 'email_conflict_identity_not_deletable',
    message:
      "Unlinking this identity causes the user's account to change to an email address which is already used by another user account. Indicates an issue where the user has two different accounts using different primary email addresses. You may need to migrate user data to one of their accounts in this case.",
    service: 'AUTH',
  },
  {
    code: 'email_exists',
    message: 'Email address already exists in the system.',
    service: 'AUTH',
  },
  {
    code: 'email_not_confirmed',
    message: 'Signing in is not allowed for this user as the email address is not confirmed.',
    service: 'AUTH',
  },
  {
    code: 'email_provider_disabled',
    message: 'Signups are disabled for email and password.',
    service: 'AUTH',
  },
  {
    code: 'flow_state_expired',
    message:
      'PKCE flow state to which the API request relates has expired. Ask the user to sign in again.',
    service: 'AUTH',
  },
  {
    code: 'flow_state_not_found',
    message:
      'PKCE flow state to which the API request relates no longer exists. Flow states expire after a while and are progressively cleaned up, which can cause this error. Retried requests can cause this error, as the previous request likely destroyed the flow state. Ask the user to sign in again.',
    service: 'AUTH',
  },
  {
    code: 'hook_payload_invalid_content_type',
    message: 'Payload from Auth does not have a valid Content-Type header.',
    service: 'AUTH',
  },
  {
    code: 'hook_payload_over_size_limit',
    message: 'Payload from Auth exceeds maximum size limit.',
    service: 'AUTH',
  },
  {
    code: 'hook_timeout',
    message: 'Unable to reach hook within maximum time allocated.',
    service: 'AUTH',
  },
  {
    code: 'hook_timeout_after_retry',
    message: 'Unable to reach hook after maximum number of retries.',
    service: 'AUTH',
  },
  {
    code: 'identity_already_exists',
    message: 'The identity to which the API relates is already linked to a user.',
    service: 'AUTH',
  },
  {
    code: 'identity_not_found',
    message:
      'Identity to which the API call relates does not exist, such as when an identity is unlinked or deleted.',
    service: 'AUTH',
  },
  {
    code: 'insufficient_aal',
    message:
      'To call this API, the user must have a higher [Authenticator Assurance Level](https://supabase.com/docs/guides/auth/auth-mfa). To resolve, ask the user to solve an MFA challenge.',
    service: 'AUTH',
  },
  {
    code: 'invite_not_found',
    message: 'Invite is expired or already used.',
    service: 'AUTH',
  },
  {
    code: 'invalid_credentials',
    message: 'Login credentials or grant type not recognized.',
    service: 'AUTH',
  },
  {
    code: 'manual_linking_disabled',
    message:
      'Calling the `supabase.auth.linkUser()` and related APIs is not enabled on the Auth server.',
    service: 'AUTH',
  },
  {
    code: 'mfa_challenge_expired',
    message:
      'Responding to an MFA challenge should happen within a fixed time period. Request a new challenge when encountering this error.',
    service: 'AUTH',
  },
  {
    code: 'mfa_factor_name_conflict',
    message: 'MFA factors for a single user should not have the same friendly name.',
    service: 'AUTH',
  },
  {
    code: 'mfa_factor_not_found',
    message: 'MFA factor no longer exists.',
    service: 'AUTH',
  },
  {
    code: 'mfa_ip_address_mismatch',
    message: 'The enrollment process for MFA factors must begin and end with the same IP address.',
    service: 'AUTH',
  },
  {
    code: 'mfa_phone_enroll_not_enabled',
    message: 'Enrollment of MFA Phone factors is disabled.',
    service: 'AUTH',
  },
  {
    code: 'mfa_phone_verify_not_enabled',
    message: 'Login via Phone factors and verification of new Phone factors is disabled.',
    service: 'AUTH',
  },
  {
    code: 'mfa_totp_enroll_not_enabled',
    message: 'Enrollment of MFA TOTP factors is disabled.',
    service: 'AUTH',
  },
  {
    code: 'mfa_totp_verify_not_enabled',
    message: 'Login via TOTP factors and verification of new TOTP factors is disabled.',
    service: 'AUTH',
  },
  {
    code: 'mfa_verification_failed',
    message: 'MFA challenge could not be verified -- wrong TOTP code.',
    service: 'AUTH',
  },
  {
    code: 'mfa_verification_rejected',
    message:
      'Further MFA verification is rejected. Only returned if the [MFA verification attempt hook](https://supabase.com/docs/guides/auth/auth-hooks#hook-mfa-verification-attempt) returns a reject decision.',
    service: 'AUTH',
  },
  {
    code: 'mfa_verified_factor_exists',
    message:
      'Verified phone factor already exists for a user. Unenroll existing verified phone factor to continue.',
    service: 'AUTH',
  },
  {
    code: 'mfa_web_authn_enroll_not_enabled',
    message: 'Enrollment of MFA Web Authn factors is disabled.',
    service: 'AUTH',
  },
  {
    code: 'mfa_web_authn_verify_not_enabled',
    message: 'Login via WebAuthn factors and verification of new WebAuthn factors is disabled.',
    service: 'AUTH',
  },
  {
    code: 'no_authorization',
    message: 'This HTTP request requires an `Authorization` header, which is not provided.',
    service: 'AUTH',
  },
  {
    code: 'not_admin',
    message:
      'User accessing the API is not admin, i.e. the JWT does not contain a `role` claim that identifies them as an admin of the Auth server.',
    service: 'AUTH',
  },
  {
    code: 'oauth_provider_not_supported',
    message: 'Using an OAuth provider which is disabled on the Auth server.',
    service: 'AUTH',
  },
  {
    code: 'otp_disabled',
    message:
      "Sign in with OTPs (magic link, email OTP) is disabled. Check your server's configuration.",
    service: 'AUTH',
  },
  {
    code: 'otp_expired',
    message: 'OTP code for this sign-in has expired. Ask the user to sign in again.',
    service: 'AUTH',
  },
  {
    code: 'over_email_send_rate_limit',
    message:
      'Too many emails have been sent to this email address. Ask the user to wait a while before trying again.',
    service: 'AUTH',
  },
  {
    code: 'over_request_rate_limit',
    message:
      'Too many requests have been sent by this client (IP address). Ask the user to try again in a few minutes. Sometimes can indicate a bug in your application that mistakenly sends out too many requests (such as a badly written [`useEffect` React hook](https://react.dev/reference/react/useEffect)).',
    service: 'AUTH',
  },
  {
    code: 'over_sms_send_rate_limit',
    message:
      'Too many SMS messages have been sent to this phone number. Ask the user to wait a while before trying again.',
    service: 'AUTH',
  },
  {
    code: 'phone_exists',
    message: 'Phone number already exists in the system.',
    service: 'AUTH',
  },
  {
    code: 'phone_not_confirmed',
    message: 'Signing in is not allowed for this user as the phone number is not confirmed.',
    service: 'AUTH',
  },
  {
    code: 'phone_provider_disabled',
    message: 'Signups are disabled for phone and password.',
    service: 'AUTH',
  },
  {
    code: 'provider_disabled',
    message: "OAuth provider is disabled for use. Check your server's configuration.",
    service: 'AUTH',
  },
  {
    code: 'provider_email_needs_verification',
    message:
      "Not all OAuth providers verify their user's email address. Supabase Auth requires emails to be verified, so this error is sent out when a verification email is sent after completing the OAuth flow.",
    service: 'AUTH',
  },
  {
    code: 'reauthentication_needed',
    message:
      'A user needs to reauthenticate to change their password. Ask the user to reauthenticate by calling the `supabase.auth.reauthenticate()` API.',
    service: 'AUTH',
  },
  {
    code: 'reauthentication_not_valid',
    message:
      'Verifying a reauthentication failed, the code is incorrect. Ask the user to enter a new code.',
    service: 'AUTH',
  },
  {
    code: 'refresh_token_not_found',
    message: 'Session containing the refresh token not found.',
    service: 'AUTH',
  },
  {
    code: 'refresh_token_already_used',
    message:
      'Refresh token has been revoked and falls outside the refresh token reuse interval. See the [documentation on sessions](https://supabase.com/docs/guides/auth/sessions) for further information.',
    service: 'AUTH',
  },
  {
    code: 'request_timeout',
    message: 'Processing the request took too long. Retry the request.',
    service: 'AUTH',
  },
  {
    code: 'same_password',
    message:
      'A user that is updating their password must use a different password than the one currently used.',
    service: 'AUTH',
  },
  {
    code: 'saml_assertion_no_email',
    message:
      "SAML assertion (user information) was received after sign in, but no email address was found in it, which is required. Check the provider's attribute mapping and/or configuration.",
    service: 'AUTH',
  },
  {
    code: 'saml_assertion_no_user_id',
    message:
      "SAML assertion (user information) was received after sign in, but a user ID (called `NameID`) was not found in it, which is required. Check the SAML identity provider's configuration.",
    service: 'AUTH',
  },
  {
    code: 'saml_entity_id_mismatch',
    message:
      '(Admin API.) Updating the SAML metadata for a SAML identity provider is not possible, as the entity ID in the update does not match the entity ID in the database. This is equivalent to creating a new identity provider, and you should do that instead.',
    service: 'AUTH',
  },
  {
    code: 'saml_idp_already_exists',
    message: '(Admin API.) Adding a SAML identity provider that is already added.',
    service: 'AUTH',
  },
  {
    code: 'saml_idp_not_found',
    message:
      'SAML identity provider not found. Most often returned after IdP-initiated sign-in with an unregistered SAML identity provider in Supabase Auth.',
    service: 'AUTH',
  },
  {
    code: 'saml_metadata_fetch_failed',
    message:
      '(Admin API.) Adding or updating a SAML provider failed as its metadata could not be fetched from the provided URL.',
    service: 'AUTH',
  },
  {
    code: 'saml_provider_disabled',
    message:
      'Using [Enterprise SSO with SAML 2.0](https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml) is not enabled on the Auth server.',
    service: 'AUTH',
  },
  {
    code: 'saml_relay_state_expired',
    message:
      'SAML relay state is an object that tracks the progress of a `supabase.auth.signInWithSSO()` request. The SAML identity provider should respond after a fixed amount of time, after which this error is shown. Ask the user to sign in again.',
    service: 'AUTH',
  },
  {
    code: 'saml_relay_state_not_found',
    message:
      'SAML relay states are progressively cleaned up after they expire, which can cause this error. Ask the user to sign in again.',
    service: 'AUTH',
  },
  {
    code: 'session_expired',
    message:
      'Session to which the API request relates has expired. This can occur if an inactivity timeout is configured, or the session entry has exceeded the configured timebox value. See the [documentation on sessions](https://supabase.com/docs/guides/auth/sessions) for more information.',
    service: 'AUTH',
  },
  {
    code: 'session_not_found',
    message:
      'Session to which the API request relates no longer exists. This can occur if the user has signed out, or the session entry in the database was deleted in some other way.',
    service: 'AUTH',
  },
  {
    code: 'signup_disabled',
    message: 'Sign ups (new account creation) are disabled on the server.',
    service: 'AUTH',
  },
  {
    code: 'single_identity_not_deletable',
    message:
      "Every user must have at least one identity attached to it, so deleting (unlinking) an identity is not allowed if it's the only one for the user.",
    service: 'AUTH',
  },
  {
    code: 'sms_send_failed',
    message: 'Sending an SMS message failed. Check your SMS provider configuration.',
    service: 'AUTH',
  },
  {
    code: 'sso_domain_already_exists',
    message: '(Admin API.) Only one SSO domain can be registered per SSO identity provider.',
    service: 'AUTH',
  },
  {
    code: 'sso_provider_not_found',
    message: 'SSO provider not found. Check the arguments in `supabase.auth.signInWithSSO()`.',
    service: 'AUTH',
  },
  {
    code: 'too_many_enrolled_mfa_factors',
    message: 'A user can only have a fixed number of enrolled MFA factors.',
    service: 'AUTH',
  },
  {
    code: 'unexpected_audience',
    message:
      "(Deprecated feature not available via Supabase client libraries.) The request's `X-JWT-AUD` claim does not match the JWT's audience.",
    service: 'AUTH',
  },
  {
    code: 'unexpected_failure',
    message: 'Auth service is degraded or a bug is present, without a specific reason.',
    service: 'AUTH',
  },
  {
    code: 'user_already_exists',
    message:
      'User with this information (email address, phone number) cannot be created again as it already exists.',
    service: 'AUTH',
  },
  {
    code: 'user_banned',
    message:
      'User to which the API request relates has a `banned_until` property which is still active. No further API requests should be attempted until this field is cleared.',
    service: 'AUTH',
  },
  {
    code: 'user_not_found',
    message: 'User to which the API request relates no longer exists.',
    service: 'AUTH',
  },
  {
    code: 'user_sso_managed',
    message:
      'When a user comes from SSO, certain fields of the user cannot be updated (like `email`).',
    service: 'AUTH',
  },
  {
    code: 'validation_failed',
    message: 'Provided parameters are not in the expected format.',
    service: 'AUTH',
  },
  {
    code: 'weak_password',
    message:
      'User is signing up or changing their password without meeting the password strength criteria. Use the `AuthWeakPasswordError` class to access more information about what they need to do to make the password pass.',
    service: 'AUTH',
  },
]
export default errorCodes
