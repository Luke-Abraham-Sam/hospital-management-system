const assert = require('assert');
const { getDayName, timeToMinutes, minutesToTime } = require('../services/slotService');
const { sortQueueAppointments } = require('../services/queueService');

console.log('\n==================================================');
console.log(' RUNNING BACKEND UNIT & LOGIC TESTS');
console.log('==================================================\n');

try {
  // Test 1: Time conversion helpers
  console.log('[Test 1] Testing time conversion utilities...');
  assert.strictEqual(timeToMinutes('09:00'), 540, '09:00 should equal 540 minutes');
  assert.strictEqual(timeToMinutes('14:30'), 870, '14:30 should equal 870 minutes');
  assert.strictEqual(minutesToTime(540), '09:00', '540 minutes should format as 09:00');
  assert.strictEqual(minutesToTime(870), '14:30', '870 minutes should format as 14:30');
  console.log('✅ Time conversion tests passed.');

  // Test 2: Day Name Helper
  console.log('[Test 2] Testing day name calculation...');
  assert.strictEqual(getDayName('2026-09-28'), 'Monday', '2026-09-28 should be Monday');
  assert.strictEqual(getDayName('2026-09-29'), 'Tuesday', '2026-09-29 should be Tuesday');
  console.log('✅ Day name tests passed.');

  // Test 3: Priority Queue Sorting
  console.log('[Test 3] Testing priority queue sorting...');
  const sampleAppointments = [
    { _id: '1', priority: 'NORMAL', startTime: '09:00', queueNumber: 'N-001' },
    { _id: '2', priority: 'URGENT', startTime: '10:00', queueNumber: 'U-001' },
    { _id: '3', priority: 'NORMAL', startTime: '09:30', queueNumber: 'N-002' },
  ];

  const sorted = sortQueueAppointments([...sampleAppointments]);
  assert.strictEqual(sorted[0].priority, 'URGENT', 'Top item in queue must be URGENT');
  assert.strictEqual(sorted[0].queueNumber, 'U-001', 'Urgent item should be U-001');
  assert.strictEqual(sorted[1].startTime, '09:00', 'Second item should be 09:00 NORMAL');
  assert.strictEqual(sorted[2].startTime, '09:30', 'Third item should be 09:30 NORMAL');
  console.log('✅ Queue priority sorting tests passed.');

  console.log('\n==================================================');
  console.log(' ALL BACKEND TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('==================================================\n');

  process.exit(0);
} catch (error) {
  console.error('❌ Test Failure:', error.message);
  process.exit(1);
}
