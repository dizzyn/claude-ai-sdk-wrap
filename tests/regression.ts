import { agentTextStream } from "@laws/shared";

interface TestCase {
  prompt: string;
  expectContains: string[];
}

const testCases: TestCase[] = [
  {
    prompt: "Jaký je název zákona č. 283/2021 Sb.?",
    expectContains: ["stavební"],
  },
  {
    prompt: "Existuje v workspace složka laws?",
    expectContains: ["laws"],
  },
];

async function runTest(tc: TestCase, index: number): Promise<boolean> {
  console.log(`\n[${index + 1}/${testCases.length}] ${tc.prompt}`);

  let result = "";
  for await (const chunk of agentTextStream({ prompt: tc.prompt })) {
    result += chunk;
  }

  const lower = result.toLowerCase();
  const missing = tc.expectContains.filter(
    (kw) => !lower.includes(kw.toLowerCase()),
  );

  if (missing.length === 0) {
    console.log(`  ✓ PASS`);
    return true;
  } else {
    console.log(`  ✗ FAIL — missing: ${missing.join(", ")}`);
    console.log(`  Response (first 200 chars): ${result.slice(0, 200)}`);
    return false;
  }
}

let passed = 0;
let failed = 0;

for (let i = 0; i < testCases.length; i++) {
  const ok = await runTest(testCases[i], i);
  if (ok) passed++;
  else failed++;
}

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
process.exit(failed > 0 ? 1 : 0);
