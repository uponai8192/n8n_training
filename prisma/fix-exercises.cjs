const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const path = require("path");

const adapter = new PrismaBetterSqlite3({ url: "file:" + path.join(__dirname, "..", "dev.db") });
const prisma = new PrismaClient({ adapter });

// New ordering: Beginner 1-6, Intermediate 7-12, Advanced 13-17, Expert 18
const EXERCISE_ORDER = [
  // BEGINNER
  { slug: "01-your-first-webhook",          newOrder: 1,  newTitle: "Exercise 1: Your First Webhook" },
  { slug: "02-uponai-call-events",          newOrder: 2,  newTitle: "Exercise 2: Receiving UponAI Call Events" },
  { slug: "03-conditional-routing",         newOrder: 3,  newTitle: "Exercise 3: Conditional Routing with IF Nodes" },
  { slug: "11-expressions-and-variables",   newOrder: 4,  newTitle: "Exercise 4: Mastering n8n Expressions" },
  { slug: "12-code-node-transformations",   newOrder: 5,  newTitle: "Exercise 5: The Code Node — JavaScript in n8n" },
  { slug: "13-debugging-and-testing",       newOrder: 6,  newTitle: "Exercise 6: Debugging, Testing & Execution History" },
  // INTERMEDIATE
  { slug: "04-sending-notifications",       newOrder: 7,  newTitle: "Exercise 7: Sending Notifications After Calls" },
  { slug: "05-logging-to-google-sheets",    newOrder: 8,  newTitle: "Exercise 8: Logging Call Data to Google Sheets" },
  { slug: "06-http-request-crm",            newOrder: 9,  newTitle: "Exercise 9: Calling External APIs & CRM Updates" },
  { slug: "14-scheduled-reports",           newOrder: 10, newTitle: "Exercise 10: Scheduled Reports & Digest Emails" },
  { slug: "15-split-in-batches",            newOrder: 11, newTitle: "Exercise 11: Processing Lists with Split in Batches" },
  { slug: "16-form-trigger-intake",         newOrder: 12, newTitle: "Exercise 12: Lead Capture with the Form Trigger" },
  // ADVANCED
  { slug: "07-ai-transcript-analysis",      newOrder: 13, newTitle: "Exercise 13: AI-Powered Transcript Analysis" },
  { slug: "08-error-handling-retries",      newOrder: 14, newTitle: "Exercise 14: Error Handling & Retry Logic" },
  { slug: "09-dynamic-agent-updates",       newOrder: 15, newTitle: "Exercise 15: Dynamic UponAI Agent Updates" },
  { slug: "17-outbound-campaign-engine",    newOrder: 16, newTitle: "Exercise 16: Outbound Call Campaign Engine" },
  { slug: "18-live-call-monitoring",        newOrder: 17, newTitle: "Exercise 17: Live Call Monitoring & Alerts" },
  // EXPERT
  { slug: "10-production-ready-platform",   newOrder: 18, newTitle: "Exercise 18: Production-Ready UponAI Platform" },
];

async function main() {
  // Delete any stale old-named exercises (RetellAI slugs)
  const stale = await prisma.exercise.findMany({
    where: { slug: { contains: "retellai" } },
  });
  if (stale.length > 0) {
    console.log(`Deleting ${stale.length} stale exercise(s) with old slugs...`);
    await prisma.exercise.deleteMany({ where: { slug: { contains: "retellai" } } });
  }

  // Reorder and retitle all exercises
  for (const { slug, newOrder, newTitle } of EXERCISE_ORDER) {
    const ex = await prisma.exercise.findUnique({ where: { slug } });
    if (!ex) {
      console.warn(`  SKIP (not found): ${slug}`);
      continue;
    }
    await prisma.exercise.update({
      where: { slug },
      data: { order: newOrder, title: newTitle },
    });
    console.log(`  [${newOrder}] ${newTitle}`);
  }

  console.log("\nAll exercises reordered.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
