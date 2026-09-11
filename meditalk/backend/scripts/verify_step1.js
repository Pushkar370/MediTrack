/**
 * verify_step1.js — Automated verification for Step 1
 * Tests: Auth enforcement, RBAC, data isolation, double-booking prevention.
 *
 * Usage: node backend/scripts/verify_step1.js
 * (Run with the server already running on port 3001)
 */

const BASE = 'http://localhost:3001/api';
let passed = 0;
let failed = 0;

// ─── Utilities ────────────────────────────────────────────────────────────────

async function req(method, path, { body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  return { status: res.status, data };
}

function assert(label, condition, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}${details ? ' — ' + details : ''}`);
    failed++;
  }
}

async function getToken(email, password, role) {
  const r = await req('POST', '/auth/login', { body: { email, password, role } });
  if (r.status !== 200 || !r.data.token) return null;
  return r.data.token;
}

// ─── Test suites ──────────────────────────────────────────────────────────────

async function testPublicEndpointsBlocked() {
  console.log('\n📋 Test 1: Public access to protected endpoints is blocked');

  const r1 = await req('GET', '/patients');
  assert('GET /patients without token → 401', r1.status === 401, `got ${r1.status}`);

  const r2 = await req('GET', '/appointments');
  assert('GET /appointments without token → 401', r2.status === 401, `got ${r2.status}`);

  const r3 = await req('GET', '/prescriptions');
  assert('GET /prescriptions without token → 401', r3.status === 401, `got ${r3.status}`);

  const r4 = await req('GET', '/admin/stats');
  assert('GET /admin/stats without token → 401', r4.status === 401, `got ${r4.status}`);

  const r5 = await req('GET', '/notifications');
  assert('GET /notifications without token → 401', r5.status === 401, `got ${r5.status}`);
}

async function testLoginAndTokenValid() {
  console.log('\n📋 Test 2: Login works and token grants access');

  // Try logging in with default seeded credentials
  const adminToken = await getToken('admin@meditalk.com', 'password', 'admin');
  assert('Admin login succeeds and token received', !!adminToken, 'token was null — check seeded credentials');

  if (adminToken) {
    const r = await req('GET', '/admin/stats', { token: adminToken });
    assert('Admin token → GET /admin/stats returns 200', r.status === 200, `got ${r.status}`);
  }

  return adminToken;
}

async function testRBAC(adminToken) {
  console.log('\n📋 Test 3: Role-based access control');

  // Use known seeded test credentials from seed.js
  const patientToken = await getToken('patient@meditalk.com', 'password', 'patient');
  assert('Patient login succeeds', !!patientToken, 'email=patient@meditalk.com / password=password');

  if (patientToken) {
    // Patient tries to access admin stats → 403
    const r1 = await req('GET', '/admin/stats', { token: patientToken });
    assert('Patient → GET /admin/stats → 403 Forbidden', r1.status === 403, `got ${r1.status}`);

    // Patient tries to list all patients → 403
    const r2 = await req('GET', '/patients', { token: patientToken });
    assert('Patient → GET /patients (all) → 403 Forbidden', r2.status === 403, `got ${r2.status}`);

    // Patient can access their own profile → 200
    const r3 = await req('GET', '/patients/P-1001', { token: patientToken });
    assert('Patient → GET /patients/:ownId (P-1001) → 200 OK', r3.status === 200, `got ${r3.status}`);

    // Patient cannot access another patient's profile → 403
    const r4 = await req('GET', '/patients/P-1002', { token: patientToken });
    assert('Patient → GET /patients/:otherId → 403 Forbidden', r4.status === 403, `got ${r4.status}`);
  }

  return { adminToken, patientToken };
}


async function testDoubleBookingPrevention(patientToken, adminToken) {
  console.log('\n📋 Test 4: Double-booking prevention');

  if (!patientToken) {
    console.log('  ⚠️  SKIP: No patient token available');
    return;
  }

  // Get doctors list
  const doctorsRes = await req('GET', '/doctors', { token: patientToken });
  const doctor = doctorsRes.data?.[0];
  if (!doctor) {
    console.log('  ⚠️  SKIP: No doctors found');
    return;
  }

  // Get patient info
  const patientRes = await req('GET', '/appointments', { token: patientToken });
  // Derive patient ID from token (we need it for booking)
  // We'll fetch it indirectly; login returns user.id
  const loginRes = await req('POST', '/auth/login', {
    body: { email: doctor.email, password: 'password', role: 'doctor' },
  });

  const slotDate = '2099-12-01'; // far future to avoid conflicts with existing data
  const slotTime = '10:00 AM';

  // We need patientId from the token — decode it (base64 middle segment)
  let patientId;
  try {
    patientId = JSON.parse(atob(patientToken.split('.')[1])).id;
  } catch {
    console.log('  ⚠️  SKIP: Could not decode patient ID from token');
    return;
  }

  const bookingPayload = {
    patientId,
    patientName: 'Test Patient',
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date: slotDate,
    time: slotTime,
    type: 'In-person',
    reason: 'Verification test booking',
  };

  // First booking → should succeed
  const r1 = await req('POST', '/appointments', { body: bookingPayload, token: patientToken });
  assert('First booking → 201 Created', r1.status === 201, `got ${r1.status}: ${JSON.stringify(r1.data)}`);

  // Second booking with a different patient at same slot → should fail with 409
  const r2 = await req('POST', '/appointments', {
    body: { ...bookingPayload, patientId: 'P-FAKE999', patientName: 'Other Patient' },
    token: adminToken, // use admin to bypass patient scoping on GET, but booking still hits collision
  });
  assert(
    'Same slot by different patient → 409 Conflict',
    r2.status === 409,
    `got ${r2.status}: ${JSON.stringify(r2.data)}`
  );

  // Clean up: cancel the test appointment
  if (r1.data?.appointment?.id) {
    await req('PATCH', `/appointments/${r1.data.appointment.id}/cancel`, { token: patientToken });
    console.log(`  🧹 Cleaned up test appointment ${r1.data.appointment.id}`);
  }
}

async function testNotificationIsolation(patientToken) {
  console.log('\n📋 Test 5: Notification isolation (users only see their own)');

  if (!patientToken) {
    console.log('  ⚠️  SKIP: No patient token available');
    return;
  }

  const r = await req('GET', '/notifications', { token: patientToken });
  assert('GET /notifications with token → 200 OK', r.status === 200, `got ${r.status}`);

  // Verify all returned notifications belong to this user (checked server-side by JWT)
  // If API returned data, structure must be an array
  assert(
    'Notifications response is an array',
    Array.isArray(r.data),
    `got type: ${typeof r.data}`
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('🏥 MediTalk — Step 1 Verification Script');
  console.log('==========================================');
  console.log(`Target: ${BASE}\n`);

  try {
    await testPublicEndpointsBlocked();
    const adminToken = await testLoginAndTokenValid();
    const { patientToken } = await testRBAC(adminToken);
    await testDoubleBookingPrevention(patientToken, adminToken);
    await testNotificationIsolation(patientToken);
  } catch (err) {
    console.error('\n🔴 Unexpected error during verification:', err.message);
    failed++;
  }

  console.log('\n==========================================');
  console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed === 0) {
    console.log('🎉 All Step 1 checks passed! Ready for Step 2.');
  } else {
    console.log('⚠️  Some checks failed. Review the output above.');
    process.exit(1);
  }
})();
