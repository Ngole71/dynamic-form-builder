-- PostgreSQL Database Schema for Dynamic Form Builder

-- 1. Master Questions Table
CREATE TABLE master_questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'number', 'date', 'radio', 'multiselect', 'checkbox', 'textarea')),
    options JSONB,
    max_selections INTEGER,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Forms Table
CREATE TABLE forms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(100) NOT NULL,
    tags TEXT[],
    form_structure JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    UNIQUE(tenant_id, name)
);

-- 3. Form Responses Table
CREATE TABLE form_responses (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    session_id VARCHAR(100),
    responses JSONB NOT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- 4. Form Analytics Table
CREATE TABLE form_analytics (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
    tenant_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    question_id VARCHAR(100),
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id VARCHAR(100),
    session_id VARCHAR(100)
);

-- Indexes for better performance
CREATE INDEX idx_forms_tenant_id ON forms(tenant_id);
CREATE INDEX idx_forms_tags ON forms USING GIN(tags);
CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_tenant_id ON form_responses(tenant_id);
CREATE INDEX idx_master_questions_tags ON master_questions USING GIN(tags);
CREATE INDEX idx_master_questions_type ON master_questions(type);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update timestamps
CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_questions_updated_at BEFORE UPDATE ON master_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_responses_updated_at BEFORE UPDATE ON form_responses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for master_questions
INSERT INTO master_questions (text, type, options, max_selections, tags) VALUES
('Please input your Name', 'text', NULL, NULL, ARRAY['basic', 'personal']),
('Please input your DOB', 'date', NULL, NULL, ARRAY['basic', 'personal']),
('Please enter your health goals', 'multiselect', '["Weight Loss", "Muscle Gain", "Better Sleep", "Stress Management", "Quit Smoking", "Improve Fitness"]'::jsonb, 3, ARRAY['health', 'goals']),
('Do you smoke?', 'radio', '["Yes", "No"]'::jsonb, NULL, ARRAY['health', 'habits']),
('How many cigarettes do you smoke?', 'radio', '["<5 per day", "5-10 per day", "10-20 per day", ">20 per day"]'::jsonb, NULL, ARRAY['health', 'smoking']),
('Do you drink alcohol?', 'radio', '["Yes", "No"]'::jsonb, NULL, ARRAY['health', 'habits']),
('How many drinks per week?', 'radio', '["<5", "5-10", "10-20", ">20"]'::jsonb, NULL, ARRAY['health', 'drinking']),
('What types of alcohol do you drink?', 'multiselect', '["Beer", "Wine", "Hard Liquor", "Mixed Drinks"]'::jsonb, NULL, ARRAY['health', 'drinking']),
('How would you rate your current health?', 'radio', '["Excellent", "Good", "Fair", "Poor"]'::jsonb, NULL, ARRAY['health', 'self-assessment']),
('What is your current weight (kg)?', 'number', NULL, NULL, ARRAY['health', 'physical']);
