/**
 * MediTrack PostgreSQL Seed Script
 * Run with: npm run seed
 */

import { getDb } from './db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  const pool = await getDb();
  console.log('🌱 Seeding MediTrack database...');

  try {
    // ------ CLEAR EXISTING DATA ------
    await pool.query(`
      TRUNCATE audit_logs, notifications, prescriptions, consultations, medical_records, appointments, users, doctors, patients RESTART IDENTITY CASCADE;
    `);

    // ------ PATIENTS ------
    const patients = [
      {
        id: 'P-1001', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', phone: '+91 98765 43210',
        dob: '1992-04-12', gender: 'Male', address: '12 Rosewood Lane, Bengaluru, Karnataka', blood_group: 'O+',
        height: '175 cm', weight: '72 kg',
        allergies: JSON.stringify(['Penicillin', 'Dust']),
        chronic_conditions: JSON.stringify(['Mild Asthma']),
        current_medications: JSON.stringify(['Salbutamol Inhaler']),
        emergency_contact: JSON.stringify({ name: 'Meera Sharma', relationship: 'Spouse', phone: '+91 98765 43211' }),
        insurance: JSON.stringify({ provider: 'CareHealth Insurance', policyNumber: 'CH-55892341', validity: '2026-12-31' }),
        status: 'active', registered_at: '2024-01-15',
      },
      {
        id: 'P-1002', name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91 98200 12345',
        dob: '1988-09-23', gender: 'Female', address: '44 Lake View Road, Kochi, Kerala', blood_group: 'B+',
        height: '162 cm', weight: '58 kg',
        allergies: JSON.stringify(['Peanuts']),
        chronic_conditions: JSON.stringify([]),
        current_medications: JSON.stringify(['Vitamin D3']),
        emergency_contact: JSON.stringify({ name: 'Rahul Nair', relationship: 'Brother', phone: '+91 98200 12346' }),
        insurance: JSON.stringify({ provider: 'MediShield Plus', policyNumber: 'MS-77812390', validity: '2026-08-30' }),
        status: 'active', registered_at: '2024-03-02',
      },
    ];

    for (const p of patients) {
      await pool.query(`
        INSERT INTO patients (id, name, email, phone, dob, gender, address, blood_group, height, weight,
          allergies, chronic_conditions, current_medications, emergency_contact, insurance, status, registered_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [p.id, p.name, p.email, p.phone, p.dob, p.gender, p.address, p.blood_group, p.height, p.weight, p.allergies, p.chronic_conditions, p.current_medications, p.emergency_contact, p.insurance, p.status, p.registered_at]);
    }

    // ------ DOCTORS ------
    const doctors = [
      { id: 'D-201', name: 'Dr. Sneha Menon', email: 'sneha.menon@meditrack.com', phone: '+91 97000 11223', specialty: 'General Medicine', experience: 12, rating: 4.8, availability: 'Available', status: 'active', bio: 'Experienced physician focused on preventive care.' },
      { id: 'D-202', name: 'Dr. Arjun Patel', email: 'arjun.patel@meditrack.com', phone: '+91 97000 11224', specialty: 'Cardiology', experience: 15, rating: 4.9, availability: 'Busy', status: 'active', bio: 'Interventional cardiologist.' },
    ];

    for (const d of doctors) {
      await pool.query(`
        INSERT INTO doctors (id, name, email, phone, specialty, experience, availability, status, bio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [d.id, d.name, d.email, d.phone, d.specialty, d.experience, d.availability, d.status, d.bio]);
    }

    // ------ USERS (auth accounts) ------
    const passwordHash = bcrypt.hashSync('password', 10);
    const users = [
      { id: 'U-P-1001', name: 'Aarav Sharma', email: 'patient@meditrack.com', password_hash: passwordHash, role: 'patient', patient_id: 'P-1001', doctor_id: null },
      { id: 'U-D-201', name: 'Dr. Sneha Menon', email: 'doctor@meditrack.com', password_hash: passwordHash, role: 'doctor', patient_id: null, doctor_id: 'D-201' },
      { id: 'U-ADM-1', name: 'Admin User', email: 'admin@meditrack.com', password_hash: passwordHash, role: 'admin', patient_id: null, doctor_id: null },
    ];

    for (const u of users) {
      await pool.query(`
        INSERT INTO users (id, name, email, password, role, patient_id, doctor_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [u.id, u.name, u.email, u.password_hash, u.role, u.patient_id, u.doctor_id]);
    }

    // ------ APPOINTMENTS ------
    const appointments = [
      { id: 'A-5001', patient_id: 'P-1001', patient_name: 'Aarav Sharma', doctor_id: 'D-201', doctor_name: 'Dr. Sneha Menon', specialty: 'General Medicine', date: '2026-08-30', time: '09:30 AM', type: 'In-person', status: 'upcoming', reason: 'Routine health check-up' },
    ];

    for (const a of appointments) {
      await pool.query(`
        INSERT INTO appointments (id, patient_id, patient_name, doctor_id, doctor_name, specialty, date, time, type, status, reason)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [a.id, a.patient_id, a.patient_name, a.doctor_id, a.doctor_name, a.specialty, a.date, a.time, a.type, a.status, a.reason]);
    }

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed database:', err);
    process.exit(1);
  }
}

seed();
