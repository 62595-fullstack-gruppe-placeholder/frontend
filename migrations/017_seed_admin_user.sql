-- Seed admin user: admin@admin.com / 1234567890
-- Uses pgcrypto (enabled in migration 003) to hash the password with bcrypt.
INSERT INTO users (email, password_hash, email_confirmed, tier, is_admin)
VALUES (
  'admin@admin.com',
  crypt('1234567890', gen_salt('bf')),
  true,
  'pro',
  true
)
ON CONFLICT (email) DO NOTHING;
