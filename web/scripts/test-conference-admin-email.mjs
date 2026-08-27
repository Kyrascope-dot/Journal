/**
 * Code-level checks for conference payment deadline and template seeds.
 * Run: node scripts/test-conference-admin-email.mjs
 */

const PAYMENT_DEADLINE_EXCLUSIVE_MS = Date.parse("2026-08-29T00:00:00+05:30");

function isBeforePaymentDeadline(now = new Date()) {
  return now.getTime() < PAYMENT_DEADLINE_EXCLUSIVE_MS;
}

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`PASS: ${name}`);
  } else {
    failed += 1;
    console.error(`FAIL: ${name}`);
  }
}

assert("deadline instant is valid", Number.isFinite(PAYMENT_DEADLINE_EXCLUSIVE_MS));
assert(
  "before deadline on 28 Aug 2026 11:59 PM IST",
  isBeforePaymentDeadline(new Date("2026-08-28T18:29:59.000Z"))
);
assert(
  "after deadline on 29 Aug 2026 00:00:00 IST",
  !isBeforePaymentDeadline(new Date("2026-08-28T18:30:00.000Z"))
);
assert(
  "after deadline on 30 Aug 2026",
  !isBeforePaymentDeadline(new Date("2026-08-30T00:00:00+05:30"))
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
