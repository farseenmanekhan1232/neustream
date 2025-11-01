-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(10) DEFAULT 'normal',
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  responded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT
);

-- Create contact submission responses table
CREATE TABLE IF NOT EXISTS contact_submission_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES contact_submissions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  response TEXT NOT NULL,
  response_type VARCHAR(20) DEFAULT 'email',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON contact_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_submission_responses_submission_id ON contact_submission_responses(submission_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at_trigger ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at_trigger
  BEFORE UPDATE ON contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_submissions_updated_at();

-- Insert default priority values if needed
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from users';
COMMENT ON TABLE contact_submission_responses IS 'Stores responses to contact submissions';
COMMENT ON COLUMN contact_submissions.status IS 'pending, responded, resolved, spam';
COMMENT ON COLUMN contact_submissions.priority IS 'low, normal, high, urgent';
COMMENT ON COLUMN contact_submission_responses.response_type IS 'email, note, internal';