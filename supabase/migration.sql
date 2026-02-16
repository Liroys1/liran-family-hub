-- DepositGuard AI — Supabase Migration
-- Run this in your Supabase SQL Editor

-- 1. Create the claims table
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'analyzing'
    CHECK (status IN ('analyzing', 'unpaid', 'paid', 'error')),
  lease_url TEXT,
  ledger_url TEXT,
  analysis_results JSONB,
  state_jurisdiction TEXT,
  lemon_squeezy_order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_claims_updated
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Enable Row Level Security
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: users can only access their own rows
CREATE POLICY "Users can view their own claims"
  ON public.claims
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own claims"
  ON public.claims
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims"
  ON public.claims
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Create the claim-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('claim-documents', 'claim-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies for claim-documents bucket
CREATE POLICY "Authenticated users can upload claim documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'claim-documents');

CREATE POLICY "Anyone can view claim documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'claim-documents');

-- 7. Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON public.claims(user_id);
