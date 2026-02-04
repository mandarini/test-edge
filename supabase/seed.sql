-- Seed file for local development
-- This runs after migrations when you do: supabase db reset

-- Create a test user for local development
-- Email: test@example.com
-- Password: password123

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'authenticated',
  'authenticated',
  'test@example.com',
  -- This is bcrypt hash for 'password123'
  '$2a$10$PznXR4PLO8Me.9A5gxYi0eB9GXl1Fg4Wj.0rxm.2N8UZQqMvBEKby',
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Test User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create the identity for the user (required for email/password auth)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'test@example.com',
  '{"sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479", "email": "test@example.com", "email_verified": true}',
  'email',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- Add some test todos for the test user
INSERT INTO public.todos (task, is_complete, user_id) VALUES
  ('Test the getClaims function', false, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  ('Explore Edge Functions', false, 'f47ac10b-58cc-4372-a567-0e02b2c3d479'),
  ('Build something awesome', false, 'f47ac10b-58cc-4372-a567-0e02b2c3d479')
ON CONFLICT DO NOTHING;
