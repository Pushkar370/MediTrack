-- SQLite to PostgreSQL Migration Schema

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  patient_id VARCHAR(255),
  doctor_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  dob DATE,
  gender VARCHAR(50),
  address TEXT,
  blood_group VARCHAR(10),
  height VARCHAR(50),
  weight VARCHAR(50),
  allergies JSONB DEFAULT '[]',
  chronic_conditions JSONB DEFAULT '[]',
  current_medications JSONB DEFAULT '[]',
  emergency_contact JSONB,
  insurance JSONB,
  status VARCHAR(50) DEFAULT 'active',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS doctors (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  specialty VARCHAR(100),
  experience INTEGER,
  availability VARCHAR(50) DEFAULT 'Available',
  bio TEXT,
  status VARCHAR(50) DEFAULT 'active',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) REFERENCES patients(id),
  patient_name VARCHAR(255),
  doctor_id VARCHAR(255) REFERENCES doctors(id),
  doctor_name VARCHAR(255),
  specialty VARCHAR(100),
  date DATE,
  time VARCHAR(50),
  type VARCHAR(50),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consultations (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(255) REFERENCES patients(id),
  doctor_id VARCHAR(255) REFERENCES doctors(id),
  reason TEXT,
  symptoms TEXT,
  vitals JSONB,
  diagnosis TEXT,
  diagnosis_code VARCHAR(100),
  observations TEXT,
  lab_results VARCHAR(50),
  treatment_plan TEXT,
  follow_up_date DATE,
  follow_up_instructions TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(255) REFERENCES patients(id),
  patient_name VARCHAR(255),
  doctor_id VARCHAR(255) REFERENCES doctors(id),
  doctor_name VARCHAR(255),
  medications JSONB,
  additional_instructions TEXT,
  status VARCHAR(50) DEFAULT 'active',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_records (
  id VARCHAR(255) PRIMARY KEY,
  patient_id VARCHAR(255) REFERENCES patients(id),
  type VARCHAR(100),
  description TEXT,
  doctor VARCHAR(255),
  details JSONB,
  date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'final'
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  role VARCHAR(50),
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
