import { agentTextStream } from "@laws/shared";

const prompt = process.argv.slice(2).join(" ");

if (!prompt) {
  console.error("Usage: npx tsx tests/run-query.ts <prompt>");
  process.exit(1);
}

console.log(`\n--- Query: ${prompt} ---\n`);

const start = performance.now();

for await (const chunk of agentTextStream({ prompt })) {
  process.stdout.write(chunk);
}

const elapsed = ((performance.now() - start) / 1000).toFixed(1);
console.log(`\n\n--- Done (${elapsed}s) ---`);
