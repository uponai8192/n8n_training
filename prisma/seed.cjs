/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


const EXERCISES = [
  {
    slug: "01-your-first-webhook",
    title: "Exercise 1: Your First Webhook",
    description:
      "Set up your first n8n webhook node and receive a test event from the UponAI admin panel. Learn how webhooks work as the entry point for all UponAI automations.",
    difficulty: "BEGINNER",
    order: 1,
    tags: "webhook,basics,n8n",
    content: {
      overview:
        "Webhooks are the backbone of all UponAI automation. Every time a call starts, ends, or a custom event fires, UponAI sends a POST request to a URL you define. In this exercise, you'll create your first webhook in n8n and learn to capture that incoming data.",
      objectives: [
        "Create and activate a Webhook node in n8n",
        "Understand the difference between test and production webhook URLs",
        "Send a test event from the UponAI admin panel and see the data appear in n8n",
        "Understand the basic n8n canvas and workflow structure",
      ],
      prerequisites: [
        "An n8n account (cloud or self-hosted at n8n.io)",
        "Access to the UponAI admin panel and an agent you can edit",
        "For Exercise 2 onward, you will need a real UponAI agent plus a SIP connection or phone-number route so you can place real calls through the agent",
      ],
      estimatedTime: "20–30 minutes",
      tools: [
        {
          name: "Webhook Node",
          description:
            "The Webhook node is the most fundamental trigger in n8n. It listens for incoming HTTP requests and starts your workflow when one arrives. It supports GET, POST, PUT, PATCH, and DELETE methods.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/",
        },
        {
          name: "n8n Canvas",
          description:
            "The n8n canvas is the visual workflow builder. Nodes are connected left-to-right by drawing connections between output and input ports. You can zoom, pan, and organize your workflow freely.",
        },
      ],
      steps: [
        {
          title: "Log into n8n and create a new workflow",
          content:
            "Open your n8n instance and click **+ New Workflow** in the top-right corner. Give it a name like 'Exercise 1 - First Webhook'. The canvas will open empty and ready for nodes.",
          tip: "Use descriptive workflow names from the start — when you have 50+ workflows, you'll thank yourself.",
        },
        {
          title: "Add a Webhook node",
          content:
            "Click the **+** button in the center of the canvas (or press **Tab**) to open the node panel. Search for **Webhook** and click it to add it. This node will appear on your canvas as the starting point of your workflow.",
        },
        {
          title: "Configure the Webhook node",
          content:
            'Double-click the Webhook node to open its settings panel on the right. Set the **HTTP Method** to **POST**. Leave the **Path** as the default (a random string) or set it to something memorable like `my-first-webhook`. The node will show you two URLs:\n\n- **Test URL** — only works while you\'re in "listening" mode in the editor\n- **Production URL** — works after the workflow is activated',
          tip: "During development, always use the Test URL. The Production URL requires you to activate the workflow with the toggle in the top-right.",
        },
        {
          title: "Start listening for requests",
          content:
            'Click the **Listen for test event** button that appears at the bottom of the Webhook node. The node will now show a spinning indicator — it\'s waiting for an incoming webhook event. You have 120 seconds before it times out.',
          warning:
            "The Webhook node only listens for one request at a time in test mode. After receiving a request, you'll need to click it again to listen for another.",
        },
        {
          title: "Send a test event from the UponAI admin panel",
          content:
            "Copy the **Test URL** from the Webhook node. In the UponAI admin panel, open an agent, paste that URL into the webhook field, and click the **Test** button. UponAI will send a sample webhook event to n8n so you can see the payload without using Postman or curl.",
          code: '{\n  "event": "test_event",\n  "message": "Hello from UponAI test!",\n  "timestamp": "2024-01-01T00:00:00Z",\n  "data": {\n    "call_id": "test-123",\n    "agent_id": "agent-abc"\n  }\n}',
          codeLanguage: "json",
          tip: "For beginner users, stick with the built-in Test button in the UponAI admin panel. It is the simplest way to confirm the webhook is connected correctly.",
        },
        {
          title: "Inspect the received data",
          content:
            "After you click Test in the UponAI admin panel, n8n will display the received data below the Webhook node. Click on the node to see the full data structure. You'll see the webhook body nested under `body`, plus metadata like `headers`, `method`, and `path`.",
          tip: "Notice the structure: `$json.body.event`, `$json.body.data.call_id`. This dot-notation is how you reference data in n8n expressions later.",
        },
        {
          title: "Add a No Op node (optional)",
          content:
            'To complete the workflow, add a **No Operation, do nothing** node connected to the Webhook. This is useful as a placeholder while building. Search for "no op" in the node panel and connect it to the Webhook output.',
        },
        {
          title: "Save your workflow",
          content:
            "Press **Cmd+S** (Mac) or **Ctrl+S** (Windows) to save. Your workflow is now saved in draft mode. When you're ready to use it with real tools, you'll activate it with the toggle switch.",
        },
      ],
      aiTips: [
        "Ask ChatGPT or Claude: 'Explain how n8n webhook URLs work and the difference between test and production mode.'",
        "Use AI to explain what fields matter most in a beginner webhook test: 'What should I look for first in a basic UponAI webhook payload?'",
        "If you're stuck: paste the n8n error message into an AI chat for instant troubleshooting help.",
      ],
      testingGuide:
        "Use the UponAI admin panel Test button at least 3 times while your Webhook node is listening. Verify that the event arrives in n8n each time and that you can identify the main fields in the payload, especially `body.event`, `body.data.call_id`, and the request metadata.",
      nextSteps:
        "Now that you can receive webhook data, Exercise 2 will show you how to receive and parse real UponAI call events. That next lesson requires a real UponAI agent, a SIP-connected way to call it, and post-call analytics fields configured inside the agent first.",
    },
  },
  {
    slug: "02-uponai-call-events",
    title: "Exercise 2: Receiving UponAI Call Events",
    description:
      "Connect UponAI to n8n and capture one real `call_analyzed` event. Learn where the call summary, transcript, and custom answers live in the webhook payload.",
    difficulty: "BEGINNER",
    order: 2,
    tags: "uponai,webhook,call-events",
    content: {
      overview:
        "Most practical UponAI workflows start with one thing: a real `call_analyzed` webhook. That payload only appears after a real call runs through a real UponAI agent. In this exercise, you'll connect an agent to n8n, make one real test call through your SIP or phone route, and inspect the exact data you'll use in the next lessons.",
      objectives: [
        "Understand that this lesson depends on a real UponAI agent and a real call path, not just a mock payload",
        "Configure a UponAI agent webhook URL in the UponAI dashboard",
        "Capture one real `call_analyzed` webhook from a test call",
        "Find the summary, transcript, sentiment, and custom answers in the payload",
        "Use the Set node to extract specific fields",
      ],
      prerequisites: [
        "Completed Exercise 1",
        "A real UponAI agent built inside UponAI",
        "A SIP connection or phone-number route so you can call the agent for a real test call",
        "Post-call analytics configured inside the agent for `first_name`, `last_name`, `company_name`, `reason_call`, and at least one yes/no routing field such as `emergency_call`, `sales_call`, `roofing_inquiry`, or `job_request`",
        "Your n8n webhook URL ready",
      ],
      estimatedTime: "30–45 minutes",
      tools: [
        {
          name: "Set Node",
          description:
            "The Set node lets you create new fields, transform existing values, or restructure your data. It's one of the most-used nodes in n8n. Use it to extract specific fields from the UponAI payload into clean, named variables for the rest of your workflow.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/",
        },
        {
          name: "UponAI Webhook Events",
          description:
            "UponAI can fire multiple events, but `call_analyzed` is the most useful starting point because it contains the transcript, call summary, sentiment, and custom analysis answers your workflow can act on.",
          docUrl: "https://docs.uponai.com/api-references/webhook",
        },
      ],
      steps: [
        {
          title: "Build the agent and analytics setup first",
          content:
            "Before you build the workflow, make sure the agent is actually ready inside UponAI. This course is based on real call data, so you need three things in place first:\n\n- a real UponAI agent built in the UponAI dashboard\n- a SIP connection or phone route so you can place a real call to that agent\n- post-call analytics fields configured in the agent\n\nAt minimum, configure these analytics fields before continuing:\n\n- `first_name`\n- `last_name`\n- `company_name`\n- `reason_call`\n- one or more yes/no routing fields such as `emergency_call`, `sales_call`, `roofing_inquiry`, or `job_request`",
          warning:
            "If you skip this setup, the later n8n expressions and IF logic will not make sense because the webhook will not contain the fields the course expects.",
        },
        {
          title: "Create a new workflow for UponAI events",
          content:
            "Create a new n8n workflow called 'Exercise 2 - UponAI Events'. Add a Webhook node with HTTP Method set to **POST**. This time, set the path to something meaningful like `uponai-events`.",
        },
        {
          title: "Configure the webhook in UponAI",
          content:
            "In your UponAI dashboard, go to **Agents** → select your agent → **Webhooks** tab. Enter your n8n **Production URL** in the webhook field. For this lesson, enable just **`call_analyzed`** if your agent settings allow event selection.\n\nAlso double-check that the same agent already has the post-call analytics fields from the previous step. Activate your n8n workflow by toggling it ON before the next step.",
          warning:
            "UponAI sends webhooks to the Production URL, not the Test URL. Make sure your workflow is **activated** before making a test call.",
        },
        {
          title: "Make a test call to your UponAI agent",
          content:
            "Use UponAI's built-in call testing in the dashboard, or call your agent's SIP-connected phone number directly. Ask questions that make the agent collect the analytics fields you configured, such as the caller's first name, company name, reason for calling, and a yes/no routing answer. After the call ends, wait for the `call_analyzed` webhook to arrive in n8n.",
          tip: "In n8n, go to **Executions** in the left sidebar to see all triggered workflow runs. Click any execution to inspect the data.",
        },
        {
          title: "Inspect the real `call_analyzed` payload",
          content:
            "Open the execution triggered by `call_analyzed`. The parts beginners usually care about are the event name, caller details, summary, transcript, and custom analysis answers. A simplified example looks like this:",
          code: '{\n  "event": "call_analyzed",\n  "call": {\n    "call_id": "call_abc123",\n    "from_number": "+15551234567",\n    "recording_url": "https://example.com/recording",\n    "transcript": "Agent: Thanks for calling...\\nCaller: I have a water leak...",\n    "call_analysis": {\n      "call_summary": "Caller reported a possible emergency water leak and requested a callback.",\n      "user_sentiment": "neutral",\n      "custom_analysis_data": {\n        "first_name": "Jane",\n        "last_name": "Doe",\n        "company_name": "Acme Plumbing",\n        "reason_call": "Water leak in kitchen",\n        "emergency_call": true,\n        "email_address": "jane@example.com"\n      }\n    }\n  }\n}',
          codeLanguage: "json",
        },
        {
          title: "Notice the fields you will use later",
          content:
            "Inside the execution viewer, expand these paths and make sure you can find them:\n\n- `body.event`\n- `body.call.from_number`\n- `body.call.recording_url`\n- `body.call.call_analysis.call_summary`\n- `body.call.call_analysis.user_sentiment`\n- `body.call.call_analysis.custom_analysis_data.first_name`\n- `body.call.call_analysis.custom_analysis_data.last_name`\n- `body.call.call_analysis.custom_analysis_data.company_name`\n- `body.call.call_analysis.custom_analysis_data.reason_call`\n- one yes/no field such as `body.call.call_analysis.custom_analysis_data.emergency_call`",
          tip: "If those fields are missing, fix the agent's post-call analytics configuration first before you keep building in n8n.",
        },
        {
          title: "Add a Set node to extract key fields",
          content:
            "Connect a **Set** node after the Webhook. Create a few clean fields so the rest of your workflow is easier to read:\n\n- **event_type** → `{{ $json.body.event }}`\n- **caller_name** → `{{ $json.body.call.call_analysis.custom_analysis_data.first_name }} {{ $json.body.call.call_analysis.custom_analysis_data.last_name }}`\n- **reason_for_call** → `{{ $json.body.call.call_analysis.custom_analysis_data.reason_call }}`\n- **caller_phone** → `{{ $json.body.call.from_number }}`\n- **call_summary** → `{{ $json.body.call.call_analysis.call_summary }}`\n- **emergency_call** → `{{ $json.body.call.call_analysis.custom_analysis_data.emergency_call }}`",
          tip: "Click the ƒ (function) icon next to any field to switch to Expression mode, which lets you reference data from previous nodes using {{ }} syntax.",
        },
        {
          title: "Pin this real data so you can keep building",
          content:
            "Right-click the Webhook node and choose **Pin Data** after you capture a real `call_analyzed` event. That lets you keep building the workflow without making a new phone call every time you test.",
          tip: "Pinned data is the beginner-friendly replacement for tools like Postman. Capture one real call once, then keep building with it.",
        },
      ],
      aiTips: [
        "Ask AI: 'Explain this UponAI webhook payload to me in plain English and tell me which fields matter most first.'",
        "Ask AI: 'Write an n8n expression that combines first name and last name, even if one of them is blank.'",
        "Ask AI: 'What is the difference between call_summary, transcript, and custom_analysis_data in an UponAI webhook?'",
      ],
      testingGuide:
        "Make one real test call, then confirm your Set node shows the cleaned-up fields correctly. After that, pin the data and re-run the workflow from the editor until the fields look right.",
      nextSteps:
        "In Exercise 3, you'll use one simple IF node to decide what to do with a call based on a real business answer such as `emergency_call`, `sales_call`, or `roofing_inquiry`.",
    },
  },
  {
    slug: "03-conditional-routing",
    title: "Exercise 3: Conditional Routing with IF Nodes",
    description:
      "Use one simple IF node to split calls into two paths based on a real answer from the call, like `emergency_call` or `sales_call`.",
    difficulty: "BEGINNER",
    order: 3,
    tags: "if-node,conditional,routing,call-status",
    content: {
      overview:
        "Most teams do not need a huge routing tree on day one. They just need one business decision: if the call matches a certain condition, do one thing; otherwise do another. In this exercise, you'll take the real `call_analyzed` data from Exercise 2 and use one IF node to split the workflow into two easy-to-understand paths.",
      objectives: [
        "Add and configure one IF node",
        "Create a TRUE branch and a FALSE branch",
        "Route based on a custom analysis field from UponAI",
        "Understand true/false output branches",
      ],
      prerequisites: [
        "Completed Exercises 1 and 2",
        "A real `call_analyzed` payload from an UponAI agent that already captures your yes/no routing fields in post-call analytics",
      ],
      estimatedTime: "30–45 minutes",
      tools: [
        {
          name: "IF Node",
          description:
            "The IF node evaluates one condition and sends the item down either the TRUE branch or the FALSE branch. For beginner workflows, that is often all you need.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/",
        },
        {
          name: "Pinned Data",
          description:
            "Pinned webhook data lets you test both sides of your IF node by editing one field in the sample payload instead of making a new phone call every time.",
        },
      ],
      steps: [
        {
          title: "Duplicate your Exercise 2 workflow",
          content:
            "Open your Exercise 2 workflow and save a copy. Rename it 'Exercise 3 - Conditional Routing'. Keep the Webhook and Set nodes exactly as they are.",
        },
        {
          title: "Choose one business field to route on",
          content:
            "Pick one simple yes/no field from your custom analysis data. Good beginner examples are:\n\n- `emergency_call`\n- `sales_call`\n- `roofing_inquiry`\n- `job_request`\n\nFor this lesson, use whichever one your agent already fills in consistently during post-call analytics.",
          tip: "It is better to route on one reliable yes/no field than to build five branches at once.",
        },
        {
          title: "Add one IF node after the Set node",
          content:
            "After the Set node, add an **IF** node. Configure it to check your chosen field. Example:\n\n- **Value 1**: `{{ $json.emergency_call }}`\n- **Operation**: `is true`\n\nIf your field is text instead of true/false, use `equals` and compare it to the value your agent returns.",
          warning:
            "If the preview says `undefined`, go back to the Set node and make sure you extracted the field correctly first.",
        },
        {
          title: "Label the two outputs clearly",
          content:
            "Add a **No Operation** node to each side of the IF node and rename them to something human-readable, such as:\n\n- TRUE branch: `Emergency`\n- FALSE branch: `Non-Emergency`\n\nThese are just placeholders for now, but they make the workflow much easier to follow.",
        },
        {
          title: "Test the TRUE branch with pinned data",
          content:
            "Use the real webhook data you pinned in Exercise 2. If needed, edit the pinned JSON so your chosen field is set to the TRUE value. Run the workflow and confirm the item goes down the TRUE branch.",
          tip: "You can edit pinned data directly in n8n. This is the fastest beginner-friendly way to test conditions.",
        },
        {
          title: "Test the FALSE branch the same way",
          content:
            "Change the same field in the pinned data to the FALSE value and run the workflow again. Confirm the item goes down the FALSE branch. Once both sides work, you are ready to replace the placeholder nodes with real actions.",
        },
      ],
      aiTips: [
        "Ask AI: 'Help me choose the best yes/no field in this UponAI payload to route on first.'",
        "Ask AI: 'In simple terms, what is the difference between an IF node's TRUE branch and FALSE branch in n8n?'",
        "Ask AI: 'Write an n8n expression that treats blank, false, and missing values safely.'",
      ],
      testingGuide:
        "Test both branches using pinned data before you use real calls again. Your goal is simple: prove that one value goes left and the opposite value goes right every time.",
      nextSteps:
        "Exercise 4 slows down for one essential skill: expressions. Once you can read values cleanly, the later action steps become much easier to build.",
    },
  },
  {
    slug: "04-sending-notifications",
    title: "Exercise 7: Send a Call Summary Email",
    description:
      "Send one clean HTML email after an important call. Use the data from your webhook and IF node to build a message your team can read quickly.",
    difficulty: "BEGINNER",
    order: 7,
    tags: "notifications,email,slack,gmail",
    content: {
      overview:
        "Once a call reaches the right branch, the most common next step is sending an email. Your real workflows already do this: collect the call details, drop them into an HTML template, and send the message to the right people. In this exercise, you'll build one version of that pattern in the simplest possible way.",
      objectives: [
        "Connect n8n to an email provider such as SMTP or Gmail",
        "Send a formatted HTML email with call details",
        "Insert webhook values into the subject and body",
        "Test the email with pinned data before using a real call",
      ],
      prerequisites: [
        "Completed Exercises 1–3",
        "An email account or SMTP credential you can use in n8n",
        "A real UponAI agent with post-call analytics fields already configured so your email template has real values to display",
      ],
      estimatedTime: "45–60 minutes",
      tools: [
        {
          name: "Send Email / SMTP Node",
          description:
            "n8n includes email nodes for Gmail, Outlook, and generic SMTP. For beginner workflows, use whichever one you can connect fastest and send one test email successfully.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.sendemail/",
        },
        {
          name: "HTML Email Body",
          description:
            "HTML lets you format your email so the team can scan the important details quickly. Keep the first version simple: headings, a small table, the summary, and a recording link.",
        },
        {
          name: "Expressions",
          description:
            "Expressions like `{{ $json.caller_name }}` pull values from your webhook into the email subject and body. This is how one template works for every call.",
        },
      ],
      steps: [
        {
          title: "Duplicate your Exercise 3 workflow",
          content:
            "Open the workflow from Exercise 3 and save a copy. Keep the Webhook, Set node, and IF node. Choose one branch to turn into a real action, such as the TRUE branch for `Emergency` or `Sales` calls.",
        },
        {
          title: "Add one Send Email node on that branch",
          content:
            "Add a **Send Email** node to the branch you want. Configure:\n\n- **To**: your team email\n- **From**: your automation mailbox\n- **Subject**: `New UponAI Call: {{ $json.caller_name }}`\n- **Email format**: HTML",
          code: "<h2>Call Summary</h2>\n<table>\n  <tr><td><b>Name:</b></td><td>{{ $json.caller_name }}</td></tr>\n  <tr><td><b>Caller ID:</b></td><td>{{ $json.caller_phone }}</td></tr>\n  <tr><td><b>Reason for Call:</b></td><td>{{ $json.reason_for_call }}</td></tr>\n  <tr><td><b>Emergency:</b></td><td>{{ $json.emergency_call }}</td></tr>\n</table>\n\n<h3>Summary</h3>\n<p>{{ $json.call_summary }}</p>",
          codeLanguage: "html",
        },
        {
          title: "Add a recording link and transcript",
          content:
            "Expand the HTML body so the email is useful without opening n8n. Add the call recording link and transcript from the webhook payload:\n\n- `{{ $json.body.call.recording_url }}`\n- `{{ $json.body.call.transcript }}`\n\nIf you prefer, extract those in the Set node first and then reference the cleaner field names in your email.",
          tip: "Do not use JavaScript inside email templates. Many email clients ignore scripts. Keep the HTML simple and static.",
        },
        {
          title: "Keep the template easy to scan",
          content:
            "Follow the same pattern your production workflows use, but keep version one small:\n\n- Client information at the top\n- One short call summary section\n- One recording link\n- Transcript at the bottom\n\nGet one readable email working before you worry about colors, badges, or advanced formatting.",
        },
        {
          title: "Test with pinned data first",
          content:
            "Run the workflow using your pinned `call_analyzed` data. Send the email to yourself first and confirm the right values appear in the subject and body.",
        },
        {
          title: "Then test with one real call",
          content:
            "After the pinned-data version works, unpin the Webhook node and make one real test call. Wait for `call_analyzed` to arrive and confirm the email still sends with real values.",
        },
      ],
      aiTips: [
        "Ask AI: 'Turn this plain text call summary into a simple HTML email I can paste into n8n.'",
        "Ask AI: 'Shorten this email so a manager can read it in under 20 seconds.'",
        "Ask AI to troubleshoot: 'Why is this n8n email expression showing undefined instead of the expected value?'",
      ],
      testingGuide:
        "Verify that the subject line is correct, the caller name and reason show up, the summary is readable, and the recording link opens. If the email is too long, shorten the transcript section before adding anything else.",
      nextSteps:
        "Once the email works, log the same call data to Google Sheets in Exercise 8 so your team has a searchable call history.",
    },
  },
  {
    slug: "05-logging-to-google-sheets",
    title: "Exercise 8: Logging Call Data to Google Sheets",
    description:
      "Automatically log every UponAI call to a Google Sheet for tracking and analysis. Learn to append rows, handle duplicates, and structure your data for reporting.",
    difficulty: "INTERMEDIATE",
    order: 8,
    tags: "google-sheets,logging,data,reporting",
    content: {
      overview:
        "A spreadsheet log of all calls gives you powerful visibility into your AI agent's performance. You can track call volume, average duration, peak times, and common disconnect reasons — all without a database. In this exercise, you'll build a workflow that logs every call_ended event to a Google Sheet.",
      objectives: [
        "Connect n8n to Google Sheets via OAuth2",
        "Append new rows with call data automatically",
        "Handle the call_analyzed event to update rows with transcript data",
        "Format dates and durations for spreadsheet readability",
      ],
      prerequisites: [
        "Completed Exercises 1–4",
        "A Google account with Sheets access",
        "A real UponAI agent with post-call analytics fields already configured so the logged rows contain the expected business data",
      ],
      estimatedTime: "45–60 minutes",
      tools: [
        {
          name: "Google Sheets Node",
          description:
            "The Google Sheets node supports reading, appending, updating, and deleting rows. Use the 'Append or Update' operation to add new rows or update existing ones by matching a key column (like call_id).",
          docUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/",
        },
        {
          name: "Date & Time Functions",
          description:
            "n8n uses JavaScript's Luxon library for date manipulation. Use $now.toISO() for ISO timestamps, or $now.toFormat('yyyy-MM-dd HH:mm') for readable dates.",
          docUrl: "https://docs.n8n.io/code/cookbook/luxon/",
        },
      ],
      steps: [
        {
          title: "Create your Google Sheet",
          content:
            "Create a new Google Sheet called 'UponAI Call Log'. Add these column headers in Row 1:\n\n`call_id | agent_id | from_number | to_number | direction | call_status | duration_seconds | disconnect_reason | start_time | end_time | date_logged`",
          tip: "Bold the header row and freeze it (View → Freeze → 1 row) so it stays visible when scrolling.",
        },
        {
          title: "Connect Google Sheets to n8n",
          content:
            "In n8n Settings → Credentials → Add Credential → search **Google Sheets OAuth2 API**. Complete the OAuth flow (similar to Gmail setup). Grant access to your spreadsheets.",
        },
        {
          title: "Add a Google Sheets Append node",
          content:
            "On the `call_ended` branch (after your Set node), add a **Google Sheets → Append or Update Row** node:\n\n- **Document**: select your Call Log sheet\n- **Sheet**: Sheet1\n- **Column to Match On**: `call_id` (prevents duplicates if the webhook fires twice)\n- **Mapping**: Map each column to the corresponding expression",
          code: "call_id           -> {{ $json.body.call.call_id }}\nagent_id          -> {{ $json.body.call.agent_id }}\nfrom_number       -> {{ $json.body.call.from_number }}\nto_number         -> {{ $json.body.call.to_number }}\ndirection         -> {{ $json.body.call.direction }}\ncall_status       -> {{ $json.body.call.call_status }}\nduration_seconds  -> {{ Math.round(($json.body.call.duration_ms || 0) / 1000) }}\ndisconnect_reason -> {{ $json.body.call.disconnect_reason || 'N/A' }}\ndate_logged       -> {{ $now.toISO() }}",
          codeLanguage: "text",
        },
        {
          title: "Handle the call_analyzed event to add transcript",
          content:
            "When UponAI sends `call_analyzed`, it includes the call transcript and sentiment data. Add a second Google Sheets node on the `call_analyzed` branch with **Update Row** operation — match on `call_id` and add new columns:\n\n`transcript | sentiment | call_summary`",
          tip: "The transcript is usually at `$json.body.call.transcript` — it's a long string of the full conversation.",
        },
        {
          title: "Add data validation expressions",
          content:
            "Some fields may be null or undefined. Always use fallback expressions to prevent errors:",
          code: "// Safe duration (handles null duration_ms)\n{{ ($json.body.call.duration_ms || 0) / 1000 }}\n\n// Safe phone number (handles missing number)\n{{ $json.body.call.from_number || 'Unknown' }}\n\n// Formatted date (handles missing timestamp)\n{{ $json.body.call.start_timestamp \n   ? new Date($json.body.call.start_timestamp).toLocaleString() \n   : 'N/A' }}",
          codeLanguage: "javascript",
        },
        {
          title: "Test with multiple simulated calls",
          content:
            "Send 5 different simulated call payloads (varying call_status, duration, disconnect_reason). Check your Google Sheet to verify all rows were added correctly and no duplicates exist.",
        },
      ],
      aiTips: [
        "Ask AI: 'What Google Sheets formulas would be useful for analyzing call data? I have columns for duration, status, and disconnect_reason.'",
        "Ask AI: 'Write an n8n expression to convert a Unix timestamp in milliseconds to a readable date string in the format MM/DD/YYYY HH:MM AM/PM'",
        "Use AI to design your sheet: 'Design a Google Sheet structure for tracking AI phone agent calls, including formulas for daily summaries and conversion rates.'",
      ],
      testingGuide:
        "After testing, open your Google Sheet and verify: all columns populated correctly, no empty rows, timestamps are human-readable, and sending the same call_id twice doesn't create a duplicate row.",
      nextSteps:
        "Exercise 9 moves from spreadsheets into CRM workflows by looking up a contact in GoHighLevel and updating or creating the record automatically.",
    },
  },
  {
    slug: "06-http-request-crm",
    title: "Exercise 9: GoHighLevel Contact Lookup & Update",
    description:
      "Use an inbound webhook to look up a contact in GoHighLevel by phone or email, then update the record or create a new one. This is the core CRM pattern behind personalized call flows.",
    difficulty: "INTERMEDIATE",
    order: 9,
    tags: "highlevel,crm,contact-lookup,webhook,http-request",
    content: {
      overview:
        "A very common AI voice pattern is: call comes in, find the contact, personalize the conversation, and then write the results back to the CRM. In this exercise, you will build that pattern at a high level with GoHighLevel. The exact fields can vary by client, but the workflow shape stays the same.",
      objectives: [
        "Receive an inbound webhook with phone or email data",
        "Look up an existing GoHighLevel contact",
        "Branch on contact found vs not found",
        "Update the contact with call or appointment details",
        "Create a new contact when no match exists",
      ],
      prerequisites: [
        "Completed Exercises 1–8",
        "A GoHighLevel location connected in n8n",
        "A real UponAI agent and call route if you want to test this using live inbound calls instead of manual webhook data",
      ],
      estimatedTime: "45–60 minutes",
      tools: [
        {
          name: "GoHighLevel Node",
          description:
            "The GoHighLevel node can search, create, and update contacts without you building every HTTP request manually. Use it first when the built-in actions cover what you need.",
          docUrl: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.highlevel/",
        },
        {
          name: "HTTP Request Node",
          description:
            "When the native HighLevel node does not expose a specific endpoint, fall back to HTTP Request for custom LeadConnector API calls such as notes, free slots, or edge-case updates.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/",
        },
      ],
      steps: [
        {
          title: "Start with an inbound lookup webhook",
          content:
            "Create a new workflow with a Webhook node that receives the inbound payload from your voice platform. For training, keep the payload simple and focus on the identity fields you actually need to search with first:\n\n- caller phone number\n- caller email\n- optional first and last name\n- optional appointment details",
          tip: "Do not start by mapping 30 fields. First prove you can find the right contact using one or two reliable identifiers.",
        },
        {
          title: "Look up the contact by phone or email",
          content:
            "Add a GoHighLevel search step. In many real workflows, phone number is the first lookup key because it is the most available on inbound calls. If the phone is missing or unreliable, fall back to email.",
          code: "Primary lookup:\nphone -> {{ $json.body.args.phone || $json.body.call_inbound.from_number }}\n\nFallback lookup:\nemail -> {{ $json.body.args.email || '' }}",
          codeLanguage: "text",
        },
        {
          title: "Branch on contact found vs not found",
          content:
            "Add an IF node after the lookup result.\n\n- **TRUE branch**: contact exists, so update it\n- **FALSE branch**: no match, so create a new contact\n\nThis one branch point is the heart of the CRM pattern.",
          tip: "If your search can return multiple contacts, keep the training version simple and use the first match only. You can add deduping rules later.",
        },
        {
          title: "Update the contact with the newest details",
          content:
            "On the TRUE branch, update a small, useful set of fields:\n\n- latest phone or email if missing\n- appointment status\n- reason for call\n- short call summary\n- last contacted timestamp\n\nIf you want to track long notes or transcripts, write them as a note activity instead of stuffing everything into one contact field.",
          tip: "A good beginner rule: contact fields for structured facts, notes for narrative detail.",
        },
        {
          title: "Create a new contact when no match exists",
          content:
            "On the FALSE branch, create a contact with the fields your workflow reliably collected. Good starter fields are:\n\n- first name\n- last name\n- phone\n- email\n- source = AI voice workflow\n- a simple tag such as `appointment-request` or `inbound-call`",
          code: "{\n  \"firstName\": \"{{ $json.body.args.first_name || '' }}\",\n  \"lastName\": \"{{ $json.body.args.last_name || '' }}\",\n  \"phone\": \"{{ $json.body.args.phone || $json.body.call_inbound.from_number }}\",\n  \"email\": \"{{ $json.body.args.email || '' }}\"\n}",
          codeLanguage: "json",
        },
        {
          title: "Add one special-case branch only if it matters",
          content:
            "Your production flow has special handling such as an Andrew check or ignoring bad phone values like `N/A`. That is fine, but teach it after the main pattern works:\n\n1. lookup\n2. found vs not found\n3. update vs create\n\nOnly then add special-case filters.",
        },
        {
          title: "Test with a known and unknown contact",
          content:
            "Run the workflow twice:\n\n- once with a phone number already in GoHighLevel\n- once with a brand new number\n\nVerify that the first run updates the right contact and the second run creates one clean new record.",
        },
      ],
      aiTips: [
        "Ask AI: 'Map this inbound call webhook into the minimum fields I should use for a GoHighLevel contact lookup and update flow.'",
        "Ask AI: 'What contact fields should stay structured versus being stored as a note in a CRM?'",
        "Ask AI: 'Help me simplify this CRM workflow so non-technical users can understand the found-vs-create pattern.'",
      ],
      testingGuide:
        "Test with: (1) an existing contact, (2) a new contact, and (3) a payload with a missing or bad phone field. Confirm the workflow still behaves predictably and does not create junk duplicates.",
      nextSteps:
        "Exercise 10 uses another webhook pattern from your real stack: checking calendar availability inside a date range and expanding the search when nothing is available.",
    },
  },
  {
    slug: "07-ai-transcript-analysis",
    title: "Exercise 13: AI-Powered Transcript Analysis",
    description:
      "Use n8n's AI nodes (OpenAI/Anthropic) to analyze call transcripts, extract key information, generate summaries, and identify action items automatically.",
    difficulty: "ADVANCED",
    order: 13,
    tags: "ai,openai,transcript,analysis,llm",
    content: {
      overview:
        "UponAI gives you raw transcripts — AI can turn them into insights. In this exercise, you'll pipe the call_analyzed transcript through an LLM (OpenAI or Anthropic Claude) to extract structured data: customer sentiment, key topics discussed, action items, and a concise summary.",
      objectives: [
        "Set up OpenAI or Anthropic credentials in n8n",
        "Use the AI Message node to send a prompt with call transcript",
        "Extract structured JSON from AI responses using output parsers",
        "Chain AI analysis with downstream actions (email, CRM update)",
      ],
      prerequisites: [
        "Completed Exercises 1–6",
        "An OpenAI API key (platform.openai.com) or Anthropic API key",
      ],
      estimatedTime: "60–90 minutes",
      tools: [
        {
          name: "OpenAI Node / Basic LLM Chain",
          description:
            "n8n has native AI nodes for OpenAI, Anthropic, and others. The 'Basic LLM Chain' node lets you send a prompt and get a text response. The 'AI Agent' node enables multi-step reasoning with tool use.",
          docUrl: "https://docs.n8n.io/advanced-ai/",
        },
        {
          name: "Code Node",
          description:
            "The Code node lets you run JavaScript or Python directly in n8n. Use it for complex data transformations that expressions cannot handle — like parsing multi-line transcripts or complex regex operations.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/",
        },
      ],
      steps: [
        {
          title: "Set up OpenAI credentials",
          content:
            "Go to platform.openai.com → API Keys → Create new secret key. In n8n: Settings → Credentials → Add Credential → **OpenAI**. Paste your API key. Test the connection.",
          warning:
            "OpenAI API calls cost money. Use gpt-4o-mini for testing (much cheaper than gpt-4o) and set usage limits in your OpenAI dashboard.",
        },
        {
          title: "Add a Basic LLM Chain node",
          content:
            "Add a **Basic LLM Chain** node. Connect it to an **OpenAI Chat Model** sub-node. Configure the system prompt and user message:",
          code: "System Prompt:\nYou are an expert call analyst. Analyze the following customer service call transcript and return a JSON object with these exact fields:\n- summary: A 2-3 sentence summary of the call\n- sentiment: positive, neutral, or negative\n- key_topics: An array of main topics discussed (max 5)\n- action_items: An array of follow-up actions required\n- customer_intent: The primary reason the customer called\n- resolved: true or false\n\nReturn ONLY valid JSON, no other text.\n\nUser Message:\nAnalyze this call transcript:\n{{ $json.body.call.transcript }}",
          codeLanguage: "text",
        },
        {
          title: "Parse the AI response",
          content:
            "The AI returns a JSON string. Add a **Code node** to parse it into a JavaScript object:",
          code: "const response = $input.first().json.text;\n\n// Clean up response (AI sometimes adds extra text)\nconst jsonMatch = response.match(/\\{[\\s\\S]*\\}/);\nconst jsonStr = jsonMatch ? jsonMatch[0] : '{}';\n\ntry {\n  const parsed = JSON.parse(jsonStr);\n  return [{ json: parsed }];\n} catch (error) {\n  return [{\n    json: {\n      summary: 'Parse error: ' + error.message,\n      sentiment: 'neutral',\n      key_topics: [],\n      action_items: [],\n      customer_intent: 'Unknown',\n      resolved: false\n    }\n  }];\n}",
          codeLanguage: "javascript",
          tip: "Always wrap JSON.parse in try/catch. AI models occasionally return malformed JSON, especially for complex transcripts.",
        },
        {
          title: "Use the structured data downstream",
          content:
            "After parsing, you have clean structured data. Add nodes to:\n\n1. **Update Google Sheets**: Add sentiment, summary, action_items columns\n2. **Send Slack alert**: If `resolved === false`, alert the team\n3. **Create CRM task**: For each item in `action_items`, create a follow-up task",
          tip: "Use `{{ $json.action_items.join(', ') }}` to convert an array to a comma-separated string for Slack messages.",
        },
        {
          title: "Test with a sample transcript",
          content:
            "Use this test transcript to verify your AI analysis works. Paste it into the Webhook test payload as the transcript field:",
          code: "Agent: Hello, thanks for calling. How can I help you today?\nCustomer: Hi, I am having trouble with my account. I cannot log in.\nAgent: I am sorry to hear that. Can I get your email address?\nCustomer: It is john@example.com\nAgent: Your password was reset 3 days ago. Did you receive the reset email?\nCustomer: Yes I did but I did not set a new password yet.\nAgent: No problem, let me send you a fresh password reset link right now.\nCustomer: Thank you, I really need access for a meeting tomorrow.\nAgent: Done! You should receive the email within 2 minutes. Anything else?\nCustomer: No, that is great. Thank you!\nAgent: My pleasure. Have a great day!",
          codeLanguage: "text",
        },
      ],
      aiTips: [
        "Ask AI: 'Write a better system prompt for analyzing customer service call transcripts to extract CSAT score, talk time ratio, and escalation risk.'",
        "Use AI to refine extraction: 'The AI is sometimes returning malformed JSON. How can I make my prompt more reliable for structured output?'",
        "Ask AI: 'What are the cheapest OpenAI models suitable for call transcript analysis, and what are the quality trade-offs?'",
      ],
      testingGuide:
        "Test with 5 different transcript types: resolved issue, unresolved complaint, appointment booking, sales call, and wrong number. Verify the AI correctly identifies sentiment and resolution status for each.",
      nextSteps:
        "Exercise 14 covers error handling and retry logic — essential for production workflows where API calls can fail.",
    },
  },
  {
    slug: "08-error-handling-retries",
    title: "Exercise 14: Error Handling & Retry Logic",
    description:
      "Build production-grade workflows with proper error handling, automatic retries, and failure notifications. Learn to use n8n's Error Trigger and workflow settings.",
    difficulty: "ADVANCED",
    order: 14,
    tags: "error-handling,retry,production,reliability",
    content: {
      overview:
        "Production workflows fail. APIs go down, rate limits get hit, network timeouts occur. Workflows without error handling silently drop data. In this exercise, you'll add comprehensive error handling to your UponAI workflows so no call data is ever lost, and your team is alerted when something goes wrong.",
      objectives: [
        "Configure node-level error handling and retry settings",
        "Create an Error Trigger workflow to catch all failures",
        "Implement exponential backoff for API retries",
        "Build a dead-letter queue pattern using a fallback spreadsheet",
      ],
      prerequisites: ["Completed Exercises 1–7"],
      estimatedTime: "60–90 minutes",
      tools: [
        {
          name: "Error Trigger Node",
          description:
            "The Error Trigger fires when any other workflow in your n8n instance fails. Create a dedicated 'Error Handler' workflow with this node, and it will catch failures from all your other workflows automatically.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.errortrigger/",
        },
        {
          name: "Wait Node",
          description:
            "The Wait node pauses workflow execution for a specified time. Use it for manual retry delays, rate limit cooldowns, or time-based triggering.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/",
        },
      ],
      steps: [
        {
          title: "Configure retry settings on critical nodes",
          content:
            "Open any node that calls an external API (Gmail, Slack, HTTP Request, Google Sheets). Click the **Settings** tab in the node panel. Set:\n\n- **On Error**: Stop And Error (so the workflow knows it failed)\n- **Retry On Fail**: Enabled\n- **Max Tries**: 3\n- **Wait Between Tries**: 5000ms (5 seconds)\n\nDo this for every node that touches external services.",
          tip: "Do not retry Webhook trigger nodes — only retry nodes that call external APIs. Retrying the trigger would duplicate the incoming data.",
        },
        {
          title: "Create a dedicated Error Handler workflow",
          content:
            "Create a **new workflow** called 'Error Handler'. Add an **Error Trigger** node as the start. This workflow automatically receives error information from any workflow that fails with the workflow name, execution ID, error message, and which node failed.",
        },
        {
          title: "Build the error notification",
          content:
            "In your Error Handler workflow, add a Slack node to send an alert:",
          code: "Workflow Failure Alert!\n\nWorkflow: {{ $json.workflow.name }}\nNode: {{ $json.node.name }}\nError: {{ $json.execution.error.message }}\nTime: {{ $now.toFormat('yyyy-MM-dd HH:mm:ss') }}\nExecution ID: {{ $json.execution.id }}",
          codeLanguage: "text",
          tip: "Include a link to the failed execution in n8n so your team can jump directly to it: https://YOUR_N8N_URL/workflow/{{ $json.workflow.id }}/executions/{{ $json.execution.id }}",
        },
        {
          title: "Enable the Error Trigger for your main workflows",
          content:
            "For the Error Trigger to catch errors from a workflow, that workflow must have 'Error Workflow' set in its Settings. Go to your UponAI workflow → Settings (gear icon) → **Error Workflow** → select your 'Error Handler' workflow.",
          warning:
            "You need to activate both workflows — the main workflow AND the Error Handler — for error catching to work.",
        },
        {
          title: "Implement a dead-letter queue",
          content:
            "For the most critical data (like call logs), add a fallback Google Sheet append on every error path. This ensures call data is never lost even if the primary workflow fails. Create a 'Failed Events' sheet with columns: timestamp, workflow_name, error_message, raw_payload.",
        },
        {
          title: "Test error scenarios",
          content:
            "Intentionally break your workflow to test error handling:\n1. Set an invalid Slack channel name — should trigger error notification\n2. Use an expired API key — should retry 3 times then fail\n3. Delete a Google Sheet it is trying to write to — should catch the error",
        },
      ],
      aiTips: [
        "Ask AI: 'What is the exponential backoff retry pattern and how should I implement it for an API that returns 429 rate limit errors?'",
        "Ask AI: 'Design an error handling strategy for a production n8n workflow that processes 1000+ webhook events per day.'",
        "Use AI to diagnose: Paste the full n8n error message and ask 'What caused this error and how do I prevent it?'",
      ],
      testingGuide:
        "Run through all error scenarios: API timeout, invalid credentials, network error, rate limiting. Verify you receive Slack notifications for each, and that the dead-letter queue captures the raw payload.",
      nextSteps:
        "Exercise 15 covers dynamic UponAI agent updates — changing agent prompts, voices, and behavior in real-time based on business logic using the UponAI API.",
    },
  },
  {
    slug: "09-dynamic-agent-updates",
    title: "Exercise 15: Dynamic UponAI Agent Updates",
    description:
      "Use the UponAI API to dynamically update agent configurations — change prompts, voices, and variables in real-time based on business rules, time of day, or CRM data.",
    difficulty: "ADVANCED",
    order: 15,
    tags: "uponai-api,dynamic,agent-config,outbound",
    content: {
      overview:
        "UponAI isn't just a webhook source — it's also an API you can call. You can programmatically update your agent's prompt, change the voice, inject custom variables into conversations, and even create new agents on the fly. This is where n8n becomes a powerful control plane for your AI agents.",
      objectives: [
        "Authenticate with the UponAI Management API",
        "Update an agent's prompt dynamically via API",
        "Inject custom variables into a call before it connects",
        "Create a scheduled workflow to update agents based on time/business rules",
      ],
      prerequisites: [
        "Completed Exercises 1–8",
        "UponAI API key (from the UponAI dashboard)",
      ],
      estimatedTime: "75–90 minutes",
      tools: [
        {
          name: "UponAI API",
          description:
            "UponAI's REST API lets you create/update/delete agents, initiate calls programmatically, and manage phone numbers. The base URL is https://api.uponai.com. Authenticate with your API key as a Bearer token.",
          docUrl: "https://docs.uponai.com/api-references/agent/get-agent",
        },
        {
          name: "Schedule Trigger Node",
          description:
            "The Schedule Trigger fires your workflow on a cron schedule — every hour, daily at 9am, weekdays only, etc. Use it to build time-aware automations that update agent behavior based on business hours.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/",
        },
      ],
      steps: [
        {
          title: "Get your UponAI API key",
          content:
            "In the UponAI dashboard, go to **API Keys** (usually under your account/settings menu). Create a new API key and copy it. Store it in n8n as a **Header Auth** credential:\n\n- Name: UponAI API\n- Header Name: Authorization\n- Header Value: Bearer YOUR_API_KEY",
        },
        {
          title: "Fetch your current agent configuration",
          content:
            "Add an HTTP Request node to get your agent's current configuration. You'll need your Agent ID from the UponAI dashboard:",
          code: "URL: https://api.uponai.com/get-agent/YOUR_AGENT_ID\nMethod: GET\nAuthentication: UponAI API (Header Auth)",
          codeLanguage: "text",
          tip: "Always fetch the current config before updating — you may only want to change one field and keep everything else the same.",
        },
        {
          title: "Build a business hours prompt switcher",
          content:
            "Create a Schedule Trigger that runs every hour. Add a Code node to determine if it is business hours:",
          code: "const now = new Date();\nconst hour = now.getHours();\nconst day = now.getDay(); // 0=Sunday, 6=Saturday\n\nconst isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 17;\nconst isWeekend = day === 0 || day === 6;\n\nreturn [{\n  json: {\n    mode: isBusinessHours ? 'business_hours' : (isWeekend ? 'weekend' : 'after_hours'),\n    isBusinessHours,\n    currentHour: hour,\n    currentDay: day\n  }\n}];",
          codeLanguage: "javascript",
        },
        {
          title: "Update the agent prompt based on mode",
          content:
            "Add a Switch node on the `mode` field, then an HTTP Request node for each mode to update the agent:",
          code: 'URL: https://api.uponai.com/update-agent/YOUR_AGENT_ID\nMethod: PATCH\nAuthentication: UponAI API\nBody: {\n  "agent_prompt": "{{ $json.prompt }}",\n  "agent_name": "{{ $json.mode === \'business_hours\' ? \'Alex\' : \'After Hours Bot\' }}"\n}',
          codeLanguage: "text",
          tip: "Keep your prompts in a Google Sheet or Airtable so non-technical team members can update them without touching n8n.",
        },
        {
          title: "Inject dynamic variables into outbound calls",
          content:
            "UponAI supports dynamic variables that get injected into the agent's prompt at call time. When initiating an outbound call via API, pass variables:",
          code: 'URL: https://api.uponai.com/create-phone-call\nMethod: POST\nBody: {\n  "from_number": "+15551234567",\n  "to_number": "{{ $json.customer_phone }}",\n  "agent_id": "YOUR_AGENT_ID",\n  "upon_llm_dynamic_variables": {\n    "customer_name": "{{ $json.customer_name }}",\n    "appointment_time": "{{ $json.appointment_time }}",\n    "rep_name": "{{ $json.assigned_rep }}"\n  }\n}',
          codeLanguage: "json",
        },
        {
          title: "Build an outbound call trigger from Google Sheets",
          content:
            "Create a workflow that reads a Google Sheet of outbound call targets and triggers UponAI calls for each row. This enables bulk outbound AI calling campaigns from a spreadsheet.",
          warning:
            "Always follow TCPA regulations for outbound calling. Ensure you have proper consent before making automated outbound calls.",
        },
      ],
      aiTips: [
        "Ask AI: 'Write an optimized UponAI agent prompt for a business hours greeting that is warm and professional, with after-hours instructions.'",
        "Ask AI: 'How should I structure dynamic variables in a UponAI agent prompt so they can be personalized per call?'",
        "Ask AI: 'What are best practices for A/B testing different AI agent prompts to measure which performs better?'",
      ],
      testingGuide:
        "Test the schedule trigger during business hours and outside business hours. Verify the agent prompt changes correctly. Make a test call in each mode to confirm the agent behavior matches the expected prompt.",
      nextSteps:
        "Exercise 16 comes back to operations and reporting by scheduling automated summaries and digest emails for your team.",
    },
  },
  {
    slug: "10-production-ready-platform",
    title: "Exercise 20: Production-Ready UponAI Platform",
    description:
      "Build a complete, production-grade UponAI automation platform combining all patterns: inbound handling, outbound campaigns, AI analysis, CRM sync, notifications, error handling, and monitoring.",
    difficulty: "EXPERT",
    order: 20,
    tags: "production,advanced,architecture,monitoring,complete",
    content: {
      overview:
        "This is the capstone exercise. You'll architect and build a complete UponAI automation system using everything learned across the full curriculum. This is designed to mirror a real production deployment — the kind of system you'd build for a paying client. The focus is on reliability, scalability, and maintainability.",
      objectives: [
        "Design a multi-workflow architecture for a UponAI use case",
        "Implement a complete inbound + outbound call automation system",
        "Build a monitoring dashboard using n8n executions + Google Sheets",
        "Document your workflows for handoff to clients",
        "Implement security best practices (webhook verification, rate limiting)",
      ],
      prerequisites: ["Completed Exercises 1–19"],
      estimatedTime: "3–5 hours (design + build + test)",
      tools: [
        {
          name: "n8n Workflow Architecture",
          description:
            "Production n8n systems use multiple linked workflows: one per concern. A 'Router' workflow receives all webhooks and calls sub-workflows using the 'Execute Workflow' node. This keeps each workflow focused and maintainable.",
          docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/",
        },
        {
          name: "Execute Workflow Node",
          description:
            "Calls another n8n workflow and passes data to it. Use this to modularize complex systems into small, focused workflows. The child workflow can run synchronously (returns data) or asynchronously (fire-and-forget).",
        },
        {
          name: "n8n Environment Variables",
          description:
            "Store configuration values (API keys, webhook secrets, agent IDs) as environment variables in n8n Settings → Variables. Reference them with {{ $env.MY_VARIABLE }} — never hardcode them in nodes.",
        },
      ],
      steps: [
        {
          title: "Design your architecture on paper first",
          content:
            "Before building in n8n, sketch your workflow architecture. A production system has:\n\n- Inbound Webhook → Router Workflow\n  - call_started → Call Started Handler\n  - call_ended → Call Ended Handler (CRM Update, Notifications, Log to Sheet)\n  - call_analyzed → Analysis Handler (AI Analysis, Update CRM, Action Items)\n- Schedule Trigger (Hourly) → Agent Config Updater\n- Schedule Trigger (Daily) → Outbound Campaign Runner\n- Error Trigger → Error Handler",
          tip: "Use a tool like Miro, FigJam, or even a whiteboard to design before you build. Time spent planning saves 10x the time debugging.",
        },
        {
          title: "Implement webhook signature verification",
          content:
            "Add security to your webhook with signature verification. UponAI sends an `x-upon-signature` header. Verify it with a Code node at the very start of your workflow to prevent unauthorized requests.",
          code: "const crypto = require('crypto');\n\nconst payload = JSON.stringify($input.first().json.body);\nconst signature = $input.first().json.headers['x-upon-signature'];\nconst secret = $env.UPONAI_WEBHOOK_SECRET;\n\nconst expectedSig = crypto\n  .createHmac('sha256', secret)\n  .update(payload)\n  .digest('hex');\n\nif (signature !== 'sha256=' + expectedSig) {\n  throw new Error('Invalid webhook signature — potential security breach');\n}\n\nreturn $input.all();",
          codeLanguage: "javascript",
          warning:
            "Never skip signature verification in production. It prevents attackers from sending fake call events to your workflow.",
        },
        {
          title: "Build the Router workflow",
          content:
            "Create a 'UponAI Router' workflow. After signature verification, use a Switch node to route to sub-workflows using the Execute Workflow node. Each event type gets its own dedicated workflow.",
          tip: "The 'Execute Workflow' node in async mode (fire-and-forget) allows your router to respond to UponAI's webhook instantly (within the 5-second timeout), while the actual processing happens asynchronously.",
        },
        {
          title: "Implement idempotency",
          content:
            "UponAI may send the same webhook twice in some edge cases. Add idempotency to prevent duplicate processing. Use Google Sheets or a database to track processed call_ids:\n\n1. Check if call_id is in 'Processed Calls' sheet\n2. If found: skip processing (already done)\n3. If not found: process and then add call_id to the sheet",
        },
        {
          title: "Build a monitoring dashboard",
          content:
            "Create a dedicated Google Sheet for monitoring:\n\n- **Tab 1**: Live Executions (updated by every workflow run)\n- **Tab 2**: Daily Summaries (updated by a nightly aggregation workflow)\n- **Tab 3**: Error Log (updated by your Error Handler)\n\nAdd a daily Schedule Trigger workflow that aggregates the previous day's call data and emails you a summary report.",
        },
        {
          title: "Document your workflows",
          content:
            "Professional workflows are documented. In n8n:\n- Add **Sticky Notes** to every complex section explaining what it does\n- Use descriptive **Node Names** (not 'HTTP Request 3' — use 'Update HubSpot Contact')\n- Add a Sticky Note at the start of every workflow with: Purpose, Author, Last Updated, Dependencies\n- Export each workflow as JSON and store in a Git repository",
          tip: "Ask AI to generate documentation from your workflow description: 'Write technical documentation for an n8n workflow that does X, Y, Z'",
        },
        {
          title: "Go live checklist",
          content:
            "Before activating for production:\n\n- All workflows activated\n- Error Handler workflow active and tested\n- Webhook signature verification enabled\n- UponAI webhook URL updated to production n8n URL\n- All credentials use production API keys\n- Monitoring dashboard working\n- Team notified of Slack channel for alerts\n- Workflow documentation complete\n- All workflows exported and backed up\n- Test call made and all events processed correctly",
        },
      ],
      aiTips: [
        "Use AI as your architecture reviewer: 'Review this n8n workflow architecture for a UponAI integration and identify any reliability or security concerns.'",
        "Ask AI to write your documentation: 'Write technical runbook documentation for this automation system, including troubleshooting guides for common failures.'",
        "Ask AI for optimization: 'How can I reduce the latency of my n8n webhook processing from 3 seconds to under 1 second?'",
      ],
      testingGuide:
        "Full end-to-end test: make 5 real calls through your UponAI agent, verify each event is processed correctly, CRM is updated, notifications sent, Google Sheet logged, and no errors in the Error Handler. Then test failure scenarios.",
      nextSteps:
        "Congratulations! You have completed the full 20-exercise curriculum. You now have a production-grade UponAI + n8n automation platform. Consider exploring: n8n's native AI agent capabilities, building custom n8n nodes, or deploying n8n self-hosted for maximum control.",
    },
  },
];

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@n8nexercises.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123!";
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user: " + admin.email);

  for (const exercise of EXERCISES) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: {
        title: exercise.title,
        description: exercise.description,
        difficulty: exercise.difficulty,
        order: exercise.order,
        tags: exercise.tags,
        content: JSON.stringify(exercise.content),
      },
      create: {
        slug: exercise.slug,
        title: exercise.title,
        description: exercise.description,
        difficulty: exercise.difficulty,
        order: exercise.order,
        tags: exercise.tags,
        content: JSON.stringify(exercise.content),
      },
    });
    console.log("Exercise seeded: " + exercise.title);
  }

  // --- NEW EXERCISES ---
  const NEW_EXERCISES = [
    // ─── BEGINNER ────────────────────────────────────────────────────────────
    {
      slug: "11-expressions-and-variables",
      title: "Exercise 4: Mastering n8n Expressions",
      description:
        "Learn to write n8n expressions to reference data from previous nodes, perform calculations, format strings, and work with dates — the core skill that unlocks every advanced workflow.",
      difficulty: "INTERMEDIATE",
      order: 4,
      tags: "expressions,variables,data,basics",
      content: {
        overview:
          "Expressions are the glue of n8n. They let you take data from one node and use it — transformed, formatted, or calculated — in any other node. Without expressions you can only use static values. With them, every workflow becomes dynamic and intelligent.",
        objectives: [
          "Understand the n8n expression syntax: {{ }}",
          "Reference data from previous nodes using $json and $node",
          "Use built-in JavaScript methods to transform strings and numbers",
          "Format dates with Luxon",
          "Use ternary operators for inline conditional logic",
        ],
        prerequisites: ["Completed Exercises 1–3"],
        estimatedTime: "30–45 minutes",
        tools: [
          {
            name: "Expression Editor",
            description:
              "Click the ƒ icon next to any field to open the expression editor. It shows live data from previous nodes and provides autocomplete for $json, $node, $workflow, and built-in functions.",
          },
          {
            name: "$json",
            description:
              "References the current item's JSON data. If the previous node output `{ name: 'Alice' }`, then `{{ $json.name }}` returns 'Alice'.",
          },
          {
            name: "$node",
            description:
              "References output from a specific named node. Use `{{ $node['Node Name'].json.field }}` to access data from any node upstream, not just the directly connected one.",
          },
          {
            name: "Luxon (Date Library)",
            description:
              "n8n includes Luxon for date manipulation. Use `$now` for the current time, `.toFormat('yyyy-MM-dd')` to format, `.plus({ days: 7 })` to add time.",
            docUrl: "https://docs.n8n.io/code/cookbook/luxon/",
          },
        ],
        steps: [
          {
            title: "Set up a test webhook with sample data",
            content:
              "Create a new workflow with a Webhook node. Listen for a test event and send this payload so you have rich data to work with:",
            code: '{\n  "caller": {\n    "name": "Sarah Johnson",\n    "phone": "+15551234567",\n    "company": "Acme Corp"\n  },\n  "call": {\n    "duration_ms": 187000,\n    "status": "ended",\n    "timestamp": 1704067200000\n  },\n  "score": 87\n}',
            codeLanguage: "json",
          },
          {
            title: "Use basic $json expressions",
            content:
              "Add a Set node. In any field, click the ƒ icon to switch to expression mode. Try these expressions:\n\n- `{{ $json.body.caller.name }}` → Sarah Johnson\n- `{{ $json.body.caller.company }}` → Acme Corp\n- `{{ $json.body.score }}` → 87",
            tip: "The expression editor shows a live preview of the result as you type. If it shows 'undefined', the path is wrong — check the data panel on your Webhook node.",
          },
          {
            title: "String transformations",
            content:
              "Expressions support all standard JavaScript string methods:",
            code: "// Uppercase\n{{ $json.body.caller.name.toUpperCase() }}\n\n// First name only\n{{ $json.body.caller.name.split(' ')[0] }}\n\n// Remove +1 country code from phone\n{{ $json.body.caller.phone.replace('+1', '') }}\n\n// Combine fields\n{{ $json.body.caller.name + ' from ' + $json.body.caller.company }}",
            codeLanguage: "javascript",
          },
          {
            title: "Number and math operations",
            content:
              "Convert and calculate numeric values:",
            code: "// Duration in seconds\n{{ Math.round($json.body.call.duration_ms / 1000) }}\n\n// Duration as MM:SS format\n{{ Math.floor($json.body.call.duration_ms / 60000) + ':' + String(Math.round(($json.body.call.duration_ms % 60000) / 1000)).padStart(2, '0') }}\n\n// Score as letter grade\n{{ $json.body.score >= 90 ? 'A' : $json.body.score >= 80 ? 'B' : $json.body.score >= 70 ? 'C' : 'F' }}",
            codeLanguage: "javascript",
          },
          {
            title: "Date and time with Luxon",
            content:
              "Format and manipulate dates using the built-in Luxon library:",
            code: "// Current date (ISO format)\n{{ $now.toISO() }}\n\n// Current date (human readable)\n{{ $now.toFormat('MMMM d, yyyy') }}\n\n// Convert Unix timestamp (ms) to readable date\n{{ DateTime.fromMillis($json.body.call.timestamp).toFormat('MMM d, yyyy h:mm a') }}\n\n// 7 days from now\n{{ $now.plus({ days: 7 }).toFormat('yyyy-MM-dd') }}\n\n// Day of week\n{{ $now.weekdayLong }}",
            codeLanguage: "javascript",
            tip: "In n8n expressions, `DateTime` is the Luxon class (capital D). `$now` is a shortcut for `DateTime.now()`.",
          },
          {
            title: "Reference a specific node's output",
            content:
              "Use `$node` to access data from any named node, not just the one directly before the current one. Name your nodes clearly — it makes expressions much more readable:\n\n`{{ $node['Webhook'].json.body.caller.name }}`\n\nThis is especially useful when your workflow branches and merges.",
          },
          {
            title: "Null safety with the || operator",
            content:
              "Always protect against missing fields using fallback values:",
            code: "// Safe field access\n{{ $json.body.caller.name || 'Unknown Caller' }}\n\n// Safe number\n{{ $json.body.call.duration_ms || 0 }}\n\n// Safe nested access (use optional chaining)\n{{ $json.body.caller?.company || 'No Company' }}",
            codeLanguage: "javascript",
            warning:
              "Optional chaining (`?.`) works in n8n expressions. Always use it for deeply nested fields that might be missing.",
          },
        ],
        aiTips: [
          "Ask AI: 'I have a phone number in the format +15551234567. Write an n8n expression to format it as (555) 123-4567.'",
          "Ask AI: 'Write an n8n expression to calculate how many business days ago a Unix timestamp was.'",
          "Ask AI: 'What is the difference between $json, $node, and $items in n8n expressions?'",
        ],
        testingGuide:
          "Create a Set node with 10 different expression fields covering: string concat, number math, date formatting, null safety, and a ternary condition. Verify each field shows the expected output in the data panel.",
        nextSteps:
          "Exercise 5 builds on this by using the Code node for transformations that are too complex for single expressions — full JavaScript functions with loops, conditionals, and external data.",
      },
    },
    {
      slug: "12-code-node-transformations",
      title: "Exercise 5: The Code Node — JavaScript in n8n",
      description:
        "Use the Code node to run full JavaScript inside your workflows. Transform complex data structures, loop over arrays, call utility functions, and build logic that expressions can't handle.",
      difficulty: "INTERMEDIATE",
      order: 5,
      tags: "code-node,javascript,data-transformation",
      content: {
        overview:
          "Expressions are great for simple transformations, but sometimes you need real JavaScript — loops, conditionals, helper functions, and multi-step logic. The Code node runs JavaScript (or Python) directly inside your n8n workflow and gives you full access to the incoming data.",
        objectives: [
          "Write JavaScript in the Code node to transform data",
          "Loop over arrays of items from previous nodes",
          "Return single or multiple items from the Code node",
          "Use the Code node to parse, reshape, and enrich data",
          "Handle errors gracefully inside the Code node",
        ],
        prerequisites: ["Completed Exercises 1–4"],
        estimatedTime: "35–50 minutes",
        tools: [
          {
            name: "Code Node",
            description:
              "Runs JavaScript or Python. Receives `$input` (all incoming items) and must return an array of objects with a `json` key. Has access to built-in Node.js modules like `crypto` and utility functions.",
            docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.code/",
          },
        ],
        steps: [
          {
            title: "Understand the Code node structure",
            content:
              "The Code node always receives an array of items (even if there's just one). You must return an array of items. Each item must be an object with a `json` key:\n\n```\nreturn [{ json: { result: 'hello' } }];\n```\n\nTo process all incoming items, loop over `$input.all()`.",
            code: "// Basic Code node template\nconst items = $input.all();\nconst results = [];\n\nfor (const item of items) {\n  const data = item.json;\n  results.push({\n    json: {\n      // Your transformed fields here\n      processed: true,\n      original: data\n    }\n  });\n}\n\nreturn results;",
            codeLanguage: "javascript",
          },
          {
            title: "Transform a UponAI call payload",
            content:
              "Take a raw call payload and reshape it into a clean, flat object suitable for a CRM or spreadsheet:",
            code: "const call = $input.first().json.body.call;\n\n// Convert duration to human-readable\nfunction formatDuration(ms) {\n  const seconds = Math.floor(ms / 1000);\n  const mins = Math.floor(seconds / 60);\n  const secs = seconds % 60;\n  return `${mins}m ${secs}s`;\n}\n\n// Determine call outcome category\nfunction categorize(status, duration_ms) {\n  if (status !== 'ended') return 'failed';\n  if (duration_ms < 15000) return 'abandoned';\n  if (duration_ms < 60000) return 'brief';\n  return 'completed';\n}\n\nreturn [{\n  json: {\n    call_id: call.call_id,\n    agent_id: call.agent_id,\n    caller_phone: call.from_number || 'Unknown',\n    duration_readable: formatDuration(call.duration_ms || 0),\n    duration_seconds: Math.round((call.duration_ms || 0) / 1000),\n    outcome: categorize(call.call_status, call.duration_ms),\n    date: new Date(call.end_timestamp || Date.now()).toLocaleDateString(),\n    logged_at: new Date().toISOString()\n  }\n}];",
            codeLanguage: "javascript",
          },
          {
            title: "Process multiple items (batch mode)",
            content:
              "When your previous node outputs multiple items (e.g., rows from a spreadsheet), the Code node receives all of them. Process each one:",
            code: "const items = $input.all();\n\nreturn items.map(item => {\n  const call = item.json;\n  return {\n    json: {\n      ...call,\n      // Add computed fields\n      is_long_call: (call.duration_ms || 0) > 120000,\n      priority: call.disconnect_reason === 'agent_hangup' ? 'high' : 'normal',\n      formatted_phone: (call.from_number || '').replace(/\\D/g, '')\n        .replace(/(\\d{3})(\\d{3})(\\d{4})/, '($1) $2-$3')\n    }\n  };\n});",
            codeLanguage: "javascript",
            tip: "Use the spread operator (`...call`) to keep all existing fields and just add new ones. This prevents accidentally losing data.",
          },
          {
            title: "Parse a transcript into a structured format",
            content:
              "Transcripts from UponAI come as a raw string. Use the Code node to parse them into an array of turns:",
            code: "const transcript = $input.first().json.body.call.transcript || '';\n\n// Split into individual lines\nconst lines = transcript.split('\\n').filter(l => l.trim());\n\n// Parse each line into speaker + text\nconst turns = lines.map(line => {\n  const colonIdx = line.indexOf(':');\n  if (colonIdx === -1) return { speaker: 'unknown', text: line };\n  return {\n    speaker: line.substring(0, colonIdx).trim().toLowerCase(),\n    text: line.substring(colonIdx + 1).trim()\n  };\n});\n\nconst agentTurns = turns.filter(t => t.speaker === 'agent');\nconst customerTurns = turns.filter(t => t.speaker === 'customer');\n\nreturn [{\n  json: {\n    total_turns: turns.length,\n    agent_turns: agentTurns.length,\n    customer_turns: customerTurns.length,\n    talk_ratio: customerTurns.length / (agentTurns.length || 1),\n    first_customer_words: customerTurns[0]?.text || '',\n    transcript_turns: turns\n  }\n}];",
            codeLanguage: "javascript",
          },
          {
            title: "Use crypto for webhook signature verification",
            content:
              "The Code node has access to Node.js built-in modules like `crypto`:",
            code: "const crypto = require('crypto');\n\nconst body = JSON.stringify($input.first().json.body);\nconst signature = $input.first().json.headers['x-upon-signature'];\nconst secret = 'your_webhook_secret';\n\nconst expected = 'sha256=' + crypto\n  .createHmac('sha256', secret)\n  .update(body)\n  .digest('hex');\n\nif (signature !== expected) {\n  throw new Error('Invalid signature');\n}\n\nreturn $input.all();",
            codeLanguage: "javascript",
            tip: "When the Code node throws an error, it stops the workflow and triggers error handling. Use this intentionally for validation.",
          },
        ],
        aiTips: [
          "Ask AI: 'Write a JavaScript function for an n8n Code node that takes a UponAI transcript string and counts the number of times a customer mentions pricing or cost.'",
          "Ask AI: 'How do I use the n8n Code node to flatten a deeply nested JSON object into key-value pairs?'",
          "Ask AI to debug: Paste your Code node script and error message and ask 'Why is this Code node throwing an error?'",
        ],
        testingGuide:
          "Test with any sample transcript from your earlier webhook exercises. Verify the Code node correctly parses it into turns, calculates the talk ratio, and extracts the first customer words.",
        nextSteps:
          "Exercise 6 covers debugging, pinned data, and execution history so you can test workflows without constantly re-triggering them.",
      },
    },
    {
      slug: "13-debugging-and-testing",
      title: "Exercise 6: Debugging, Testing & Execution History",
      description:
        "Learn to use n8n's execution history, pin data, and debug tools to build workflows with confidence. Never get stuck on a failing workflow again.",
      difficulty: "BEGINNER",
      order: 6,
      tags: "debugging,testing,execution-history,pinning",
      content: {
        overview:
          "The best n8n developers know how to debug efficiently. n8n has powerful built-in tools for inspecting what went wrong, pinning test data so you don't have to re-trigger webhooks, and testing edge cases. This exercise teaches you to use all of them.",
        objectives: [
          "Use the Executions panel to inspect past runs",
          "Pin data to a node so you can re-run without re-triggering",
          "Use the Manual Trigger for workflow testing",
          "Read and interpret n8n error messages",
          "Use the Run Workflow button to test individual paths",
        ],
        prerequisites: ["Completed Exercises 1–3"],
        estimatedTime: "25–40 minutes",
        tools: [
          {
            name: "Executions Panel",
            description:
              "Found in the left sidebar. Shows every time the workflow ran — successful and failed. Click any execution to replay it and inspect the data at every node.",
          },
          {
            name: "Pin Data",
            description:
              "Right-click a node → 'Pin Data'. This saves the current output so the next test run uses the pinned data instead of re-triggering the node. Essential for webhook development.",
          },
          {
            name: "Manual Trigger Node",
            description:
              "A trigger that fires when you click the 'Execute workflow' button. Great for testing non-webhook workflows like scheduled tasks or data processing pipelines.",
          },
        ],
        steps: [
          {
            title: "Explore the Executions panel",
            content:
              "Open any workflow that has run at least once. Click **Executions** in the left sidebar. You'll see a list of all past runs with:\n\n- Green checkmark = success\n- Red X = failed\n- The trigger time\n- Execution duration\n\nClick any failed execution to see exactly which node failed and why.",
          },
          {
            title: "Replay a past execution",
            content:
              "Inside a past execution view, you can inspect data at each node by clicking through them. But you can also click **Open in Editor** to bring that execution's data back into the editor — letting you re-run from any point. This is incredibly powerful for debugging: run once, then iterate on a node without re-triggering the webhook.",
          },
          {
            title: "Pin data to a Webhook node",
            content:
              "Here is the workflow that saves the most time:\n\n1. Send one real webhook event\n2. See the data arrive in your Webhook node\n3. Right-click the Webhook node → **Pin Data**\n4. Now when you click 'Test workflow', n8n uses the pinned data instead of waiting for a new webhook\n\nThis means you can develop your entire workflow from a single captured event.",
            tip: "Pinned data shows a pin icon on the node. Click 'Unpin' to stop using pinned data and go back to live testing.",
          },
          {
            title: "Add a Manual Trigger for non-webhook workflows",
            content:
              "When building scheduled workflows or data pipelines, use the Manual Trigger node (search for it in the node panel). It has no configuration — just click **Execute workflow** to fire it. Connect it to the same flow as your Schedule Trigger, or use it standalone during development.",
          },
          {
            title: "Reading error messages",
            content:
              "When a node fails, it shows a red border and an error badge. Click the node to see the error. Common errors:\n\n- **401 Unauthorized** → Wrong or expired API credential\n- **404 Not Found** → Wrong URL or resource ID\n- **422 Unprocessable Entity** → Correct URL, but bad request body (check required fields)\n- **ECONNREFUSED** → Can't reach the server (URL wrong, or service is down)\n- **Cannot read property X of undefined** → Missing data — your expression references a field that doesn't exist",
            tip: "For expression errors, check the data panel of the node BEFORE the failing one. The problem is usually that the data doesn't have the structure you expected.",
          },
          {
            title: "Use console.log in the Code node",
            content:
              "Inside a Code node, you can use `console.log()` to print debug output. It appears in n8n's server logs (or in the browser console in some setups). More reliably, return debug data in your output:",
            code: "// Debug helper — add temporary fields to inspect data\nconst data = $input.first().json;\n\nconsole.log('Input data:', JSON.stringify(data, null, 2));\n\nreturn [{\n  json: {\n    // Your real output\n    result: 'processed',\n    // Temporary debug fields (remove before production)\n    _debug_input_keys: Object.keys(data),\n    _debug_type: typeof data.someField\n  }\n}];",
            codeLanguage: "javascript",
            warning:
              "Remove debug fields and console.log statements before activating a workflow for production. They add noise and can expose sensitive data.",
          },
          {
            title: "Test edge cases with different pinned data",
            content:
              "Pin multiple different test payloads to test edge cases:\n\n1. Pin a `call_ended` with `call_status: 'ended'` and test the happy path\n2. Change the pinned data to `call_status: 'error'` and verify the error path works\n3. Try a payload with missing fields to verify your null safety expressions\n\nTo edit pinned data: right-click the node → Edit Pinned Data → modify the JSON.",
          },
        ],
        aiTips: [
          "Ask AI: 'What are the most common n8n workflow errors and how do I fix each one?'",
          "Ask AI: 'How do I test n8n workflows without a live webhook? Walk me through the pinned data approach step by step.'",
          "Use AI as a rubber duck: describe your workflow and what's failing. Often just explaining it surfaces the bug.",
        ],
        testingGuide:
          "Deliberately break one of your earlier workflows (use a wrong API key, or reference a field that doesn't exist). Practice using the Executions panel to find the error, understand the message, and fix it.",
        nextSteps:
          "You now have solid fundamentals. Exercise 7 puts them to work by sending a clean call-summary email from a real call branch.",
      },
    },

    // ─── INTERMEDIATE ────────────────────────────────────────────────────────
    {
      slug: "10-calendar-availability-lookup",
      title: "Exercise 10: Calendar Availability Lookup",
      description:
        "Use a webhook to check calendar availability inside a date range, then expand the search window when no slots are returned. This teaches a real appointment-lookup pattern without overcomplicating it.",
      difficulty: "INTERMEDIATE",
      order: 10,
      tags: "calendar,availability,webhook,highlevel,scheduling",
      content: {
        overview:
          "A scheduling assistant often needs to answer one simple question: what appointment times are open? In your real flow, the webhook receives a start and end range, converts the dates, checks a calendar, and widens the search if nothing is available. This exercise teaches that pattern at a clean, high level.",
        objectives: [
          "Receive a scheduling request through a webhook",
          "Read start and end dates from the incoming payload",
          "Convert dates into the format required by the calendar API",
          "Return matching open slots",
          "Extend the search window when the first search is empty",
        ],
        prerequisites: [
          "Completed Exercises 1–9",
          "A calendar system or GoHighLevel calendar connected in n8n",
          "A real UponAI agent with a SIP or phone route if you want the lookup to be called from a live voice workflow",
        ],
        estimatedTime: "45–60 minutes",
        tools: [
          {
            name: "Webhook Node",
            description:
              "Starts the lookup flow by receiving the requested start and end date range from another system or AI tool.",
          },
          {
            name: "Code Node",
            description:
              "Use it to convert ISO strings into epoch timestamps or any other date format your calendar API expects.",
          },
          {
            name: "HTTP Request or HighLevel Node",
            description:
              "Use the built-in HighLevel node when possible, or HTTP Request when you need a specific availability endpoint such as LeadConnector free-slots.",
          },
        ],
        steps: [
          {
            title: "Confirm the real-call setup before testing end to end",
            content:
              "This lesson can be built with manual webhook data, but if you want to test it the same way a real AI agent will use it, make sure the full call path already exists:\n\n- a real UponAI agent\n- a SIP connection or phone-number route into that agent\n- post-call analytics fields for `first_name`, `last_name`, `company_name`, `reason_call`, and the yes/no fields your later routing will depend on",
          },
          {
            title: "Receive a date range from a webhook",
            content:
              "Create a webhook that expects a small payload with `start` and `end`. Keep the training version simple and ignore every other field until the lookup works reliably.",
            code: "{\n  \"args\": {\n    \"start\": \"2026-05-20T09:00:00.000Z\",\n    \"end\": \"2026-05-23T17:00:00.000Z\"\n  }\n}",
            codeLanguage: "json",
          },
          {
            title: "Convert the incoming dates for the calendar API",
            content:
              "Add a Code node that reads the incoming ISO dates and converts them into the format your calendar endpoint needs. In many real flows, that means epoch milliseconds plus one extra value for an extended end date.",
            tip: "Do the conversion once in a Code node so the rest of the workflow stays readable.",
          },
          {
            title: "Call the availability endpoint",
            content:
              "Use either the HighLevel node or an HTTP Request node to ask the calendar for free slots in the requested window. Return only the slots and a small amount of metadata so the response stays clean.",
          },
          {
            title: "Check whether any slots were returned",
            content:
              "Add an IF node after the availability lookup.\n\n- **TRUE branch**: slots were returned, so respond immediately\n- **FALSE branch**: nothing was found, so try a larger date range",
          },
          {
            title: "Extend the search by five days when the first search is empty",
            content:
              "On the empty-results branch, run a second availability request using the same start date and a later end date. A simple version is adding 5 days to the original end date, then responding with that expanded result.",
            tip: "This makes the assistant feel helpful instead of just saying 'nothing available' too quickly.",
          },
          {
            title: "Respond with a clean payload",
            content:
              "End the workflow with a Respond to Webhook node. Return the available slots and, if helpful, whether the search had to be expanded.",
            code: "{\n  \"success\": true,\n  \"extended_search\": false,\n  \"slots\": []\n}",
            codeLanguage: "json",
          },
        ],
        aiTips: [
          "Ask AI: 'Write a small n8n Code node that converts start and end ISO strings into epoch milliseconds and also adds five days to the end date.'",
          "Ask AI: 'How should I keep an availability webhook response simple enough for a voice assistant tool call?'",
          "Ask AI: 'What fields should I return from a calendar availability lookup if I want the next booking step to stay easy?'",
        ],
        testingGuide:
          "Test one date range that has open slots and one that does not. Confirm the first returns direct results and the second falls back to the extended window without failing.",
        nextSteps:
          "Exercise 11 takes the next real-world step: booking the appointment, checking the booking status, and sending a basic confirmation message.",
      },
    },
    {
      slug: "11-calendar-booking-confirmation",
      title: "Exercise 11: Calendar Booking & Confirmation",
      description:
        "Book an appointment from a webhook request, branch on booking success or failure, and send a simple confirmation email. This mirrors the core booking flow from your real automations.",
      difficulty: "INTERMEDIATE",
      order: 11,
      tags: "calendar,booking,confirmation,email,highlevel",
      content: {
        overview:
          "After you can find open times, the next step is booking one. In your real workflow, the booking request goes into the calendar system, a status comes back, and the workflow decides whether to confirm or fail. This exercise teaches that core pattern and adds a lightweight confirmation email.",
        objectives: [
          "Receive booking details through a webhook",
          "Look up or reuse the right CRM contact",
          "Create the appointment in the calendar system",
          "Branch on `booked` vs not booked",
          "Send a simple confirmation email after success",
        ],
        prerequisites: [
          "Completed Exercise 10",
          "A connected GoHighLevel calendar and email credential",
          "A contact lookup path or real UponAI call workflow that can provide the customer data needed for booking",
        ],
        estimatedTime: "45–60 minutes",
        tools: [
          {
            name: "HighLevel Calendar Action",
            description:
              "Use the GoHighLevel node to create the appointment when the built-in calendar action is available.",
          },
          {
            name: "Switch Node",
            description:
              "A Switch is a clean way to branch on the returned booking status, especially when the API sends values like `booked`, `pending`, or `failed`.",
          },
          {
            name: "Send Email Node",
            description:
              "Use one simple confirmation email. Keep the first version short and focused on the who, when, and where.",
          },
        ],
        steps: [
          {
            title: "Keep the real-call prerequisites in mind",
            content:
              "Booking only feels real when the request comes from a real voice flow. For end-to-end testing, that means:\n\n- a real UponAI agent built in UponAI\n- a SIP connection or phone route so the agent can take a real call\n- post-call analytics fields inside the agent for `first_name`, `last_name`, `company_name`, `reason_call`, and yes/no answers used later in routing",
          },
          {
            title: "Receive the booking request",
            content:
              "Create a webhook that accepts the selected slot plus the customer information you need for the calendar and email steps.",
            code: "{\n  \"args\": {\n    \"selectedSlot\": \"2026-05-21T15:00:00.000Z\",\n    \"user_name\": \"Jody\",\n    \"email\": \"jody@example.com\",\n    \"phone\": \"+19732073861\"\n  }\n}",
            codeLanguage: "json",
          },
          {
            title: "Find the contact or create it first",
            content:
              "Before booking, reuse the contact lookup pattern from Exercise 9. If your booking endpoint needs a contact ID, get it here so the calendar step stays clean.",
          },
          {
            title: "Create the appointment",
            content:
              "Use the HighLevel calendar action or a booking API request to create the appointment using the selected slot and contact ID. Keep the first version focused on one calendar and one location.",
          },
          {
            title: "Branch on booking status",
            content:
              "Add a Switch node after the booking action.\n\n- `status == booked` -> success path\n- anything else -> failure path\n\nRespond clearly so the caller, tool, or downstream workflow knows what happened.",
            code: "{\n  \"success\": true,\n  \"message\": \"Appointment booked successfully\"\n}",
            codeLanguage: "json",
          },
          {
            title: "Send a short confirmation email on success",
            content:
              "On the success branch, add one email node that sends a basic confirmation to the customer or internal rep. Include:\n\n- name\n- date and time\n- any meeting link or next step\n\nDo not try to make the first version pretty. Just make it correct.",
          },
          {
            title: "Return a simple success or failure response",
            content:
              "End both branches with a Respond to Webhook node so the caller gets a consistent JSON result. This is especially useful when the booking flow is called by another AI tool.",
          },
        ],
        aiTips: [
          "Ask AI: 'What is the minimum confirmation email I should send after an appointment is booked from an n8n workflow?'",
          "Ask AI: 'Help me design a simple Switch node pattern for booked, failed, and fallback booking states.'",
          "Ask AI: 'What booking fields should I keep in the webhook payload versus looking up from the CRM?'",
        ],
        testingGuide:
          "Test one successful booking and one failed booking. Confirm the success path sends the email and the failure path returns a clean error response without sending false confirmations.",
        nextSteps:
          "Exercise 12 shows another intake pattern: using n8n's built-in Form Trigger when the workflow starts from a form instead of a voice tool or webhook.",
      },
    },
    {
      slug: "14-scheduled-reports",
      title: "Exercise 16: Scheduled Reports & Digest Emails",
      description:
        "Build a daily automated report that aggregates your UponAI call data from Google Sheets and emails a formatted summary digest to your team every morning.",
      difficulty: "INTERMEDIATE",
      order: 16,
      tags: "schedule-trigger,reporting,email,digest,automation",
      content: {
        overview:
          "The Schedule Trigger is one of n8n's most powerful features — it lets you build automations that run on a clock rather than a webhook. In this exercise you'll build a daily digest that pulls your call data, crunches the numbers, and emails a clean summary report every morning.",
        objectives: [
          "Configure the Schedule Trigger with cron expressions",
          "Aggregate data from Google Sheets using the Sheets node",
          "Calculate summary statistics with a Code node",
          "Format and send a professional HTML digest email",
          "Test scheduled workflows without waiting for the schedule",
        ],
        prerequisites: ["Completed Exercises 7 (email) and 8 (Google Sheets)"],
        estimatedTime: "50–70 minutes",
        tools: [
          {
            name: "Schedule Trigger Node",
            description:
              "Fires your workflow on a cron schedule. Supports every-N-minutes, hourly, daily, weekly, and custom cron expressions. You can have multiple schedules in the same workflow.",
            docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/",
          },
          {
            name: "Aggregate Node",
            description:
              "Combines multiple items into one, or groups them by a field. Use it to sum, count, or collect values from many rows into a single summary object.",
            docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.aggregate/",
          },
        ],
        steps: [
          {
            title: "Add a Schedule Trigger",
            content:
              "Create a new workflow. Add a **Schedule Trigger** node. Configure it to run **Every Day** at **8:00 AM**. The cron expression for this is `0 8 * * *`.\n\nYou'll see options for:\n- Every X minutes/hours\n- Daily at a specific time\n- Weekly on specific days\n- Custom cron expression",
            tip: "To run during business days only, use the custom cron: `0 8 * * 1-5` (Mon–Fri at 8am).",
          },
          {
            title: "Read yesterday's call data from Google Sheets",
            content:
              "Add a **Google Sheets → Get Many Rows** node. Point it to your Call Log sheet. Filter rows where `date_logged` contains yesterday's date:\n\nUse a filter expression: `{{ $json.date_logged }}` contains `{{ $now.minus({ days: 1 }).toFormat('yyyy-MM-dd') }}`",
            tip: "If your sheet doesn't have a date_logged column in the right format, you can read all rows and filter in a Code node instead.",
          },
          {
            title: "Calculate summary stats in a Code node",
            content:
              "Add a **Code node** to aggregate all the call rows:",
            code: "const rows = $input.all().map(i => i.json);\n\nif (rows.length === 0) {\n  return [{ json: { total: 0, no_data: true } }];\n}\n\nconst total = rows.length;\nconst completed = rows.filter(r => r.call_status === 'ended').length;\nconst failed = rows.filter(r => r.call_status !== 'ended').length;\nconst avgDuration = Math.round(\n  rows.reduce((sum, r) => sum + (parseInt(r.duration_seconds) || 0), 0) / total\n);\nconst totalTalkTime = rows.reduce((sum, r) => sum + (parseInt(r.duration_seconds) || 0), 0);\n\nconst byDisconnect = rows.reduce((acc, r) => {\n  const reason = r.disconnect_reason || 'unknown';\n  acc[reason] = (acc[reason] || 0) + 1;\n  return acc;\n}, {});\n\nreturn [{\n  json: {\n    date: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),\n    total,\n    completed,\n    failed,\n    completion_rate: Math.round((completed / total) * 100),\n    avg_duration_seconds: avgDuration,\n    total_talk_minutes: Math.round(totalTalkTime / 60),\n    top_disconnect: Object.entries(byDisconnect).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A'\n  }\n}];",
            codeLanguage: "javascript",
          },
          {
            title: "Build the HTML digest email",
            content:
              "Add an **IF node** to skip sending if there's no data (`{{ $json.no_data }}` is true). On the false branch, add a Gmail or SMTP node with an HTML email body:",
            code: '<div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">\n  <div style="background: #f97316; padding: 20px; border-radius: 8px 8px 0 0;">\n    <h1 style="color: white; margin: 0;">Daily Call Report</h1>\n    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">{{ $json.date }}</p>\n  </div>\n  <div style="background: #1e293b; padding: 20px; border-radius: 0 0 8px 8px;">\n    <table style="width: 100%; border-collapse: collapse;">\n      <tr>\n        <td style="padding: 12px; color: #94a3b8; border-bottom: 1px solid #334155;">Total Calls</td>\n        <td style="padding: 12px; color: white; font-weight: bold; text-align: right; border-bottom: 1px solid #334155;">{{ $json.total }}</td>\n      </tr>\n      <tr>\n        <td style="padding: 12px; color: #94a3b8; border-bottom: 1px solid #334155;">Completion Rate</td>\n        <td style="padding: 12px; color: #22c55e; font-weight: bold; text-align: right; border-bottom: 1px solid #334155;">{{ $json.completion_rate }}%</td>\n      </tr>\n      <tr>\n        <td style="padding: 12px; color: #94a3b8; border-bottom: 1px solid #334155;">Avg Duration</td>\n        <td style="padding: 12px; color: white; text-align: right; border-bottom: 1px solid #334155;">{{ $json.avg_duration_seconds }}s</td>\n      </tr>\n      <tr>\n        <td style="padding: 12px; color: #94a3b8;">Total Talk Time</td>\n        <td style="padding: 12px; color: white; text-align: right;">{{ $json.total_talk_minutes }} minutes</td>\n      </tr>\n    </table>\n  </div>\n</div>',
            codeLanguage: "html",
          },
          {
            title: "Test without waiting for the schedule",
            content:
              "You don't have to wait until 8am to test. Add a **Manual Trigger** node connected to the same flow, just upstream of the Sheets read. Click 'Execute workflow' to trigger it immediately.\n\nAlternatively: temporarily change the schedule to 'Every minute', test, then change it back.",
            warning:
              "Make sure to change the schedule back after testing. Every-minute schedules can flood your email if left running.",
          },
        ],
        aiTips: [
          "Ask AI: 'Write a cron expression for 9am on the first Monday of every month.'",
          "Ask AI: 'Improve this n8n daily report HTML email template to include a bar chart showing call volume by hour.'",
          "Ask AI: 'How do I calculate the week-over-week percentage change in call volume in a Code node?'",
        ],
        testingGuide:
          "Run the workflow manually with at least 5 rows of fake call data in your sheet. Verify the stats are calculated correctly and the email looks good. Test the zero-data edge case by running when the sheet is empty.",
        nextSteps:
          "Exercise 17 covers processing multiple items at once using Split in Batches — essential when you're dealing with large lists of contacts or calls.",
      },
    },
    {
      slug: "15-split-in-batches",
      title: "Exercise 17: Processing Lists with Split in Batches",
      description:
        "Learn to process large arrays of data efficiently. Use Split in Batches to handle contact lists, bulk API calls, and multi-row spreadsheet data without hitting rate limits.",
      difficulty: "INTERMEDIATE",
      order: 17,
      tags: "split-in-batches,arrays,bulk,rate-limiting,loops",
      content: {
        overview:
          "Real workflows often need to process many items — a list of 500 contacts to call, 100 rows from a spreadsheet, or 50 CRM records to update. Doing this naively can hit API rate limits or timeout. The Split in Batches node is n8n's solution for looping over large datasets reliably.",
        objectives: [
          "Understand how n8n handles multiple items vs single items",
          "Use Split in Batches to process large lists in chunks",
          "Add delays between batches to respect rate limits",
          "Loop over a contact list and trigger UponAI outbound calls",
          "Aggregate results from all batches",
        ],
        prerequisites: ["Completed Exercises 1–6"],
        estimatedTime: "50–70 minutes",
        tools: [
          {
            name: "Split in Batches Node",
            description:
              "Takes all incoming items and outputs them in chunks of a configurable size. After each batch is processed by downstream nodes, it loops back and sends the next batch. This creates a loop pattern in n8n.",
            docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.splitinbatches/",
          },
          {
            name: "Wait Node",
            description:
              "Pauses the workflow for a specified duration. Place one after each batch to add a delay between API calls — essential for avoiding rate limit errors (HTTP 429).",
            docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.wait/",
          },
        ],
        steps: [
          {
            title: "Set up a contact list source",
            content:
              "Create a Google Sheet called 'Outbound Call List' with columns: `name`, `phone`, `company`, `campaign`. Add 10–15 test rows with fake data.\n\nAdd a **Google Sheets → Get Many Rows** node to read all rows. This will output multiple items — one per row.",
          },
          {
            title: "Add Split in Batches",
            content:
              "After the Google Sheets node, add a **Split in Batches** node. Set **Batch Size** to `5`. This means n8n will process 5 contacts at a time, then loop back for the next 5.\n\nThe node has two outputs:\n- **Output 0** (loop): sends the current batch downstream\n- **Output 1** (done): fires once when all batches are processed",
            tip: "Batch size depends on your API rate limits. For UponAI, check their documentation for calls-per-second limits. A batch size of 5–10 with a 2-second wait is usually safe.",
          },
          {
            title: "Process each batch item with an HTTP Request",
            content:
              "Connect the **Output 0** of Split in Batches to an **HTTP Request** node that triggers a UponAI outbound call for each contact:",
            code: 'URL: https://api.uponai.com/create-phone-call\nMethod: POST\nAuthentication: UponAI API\nBody: {\n  "from_number": "+15551234567",\n  "to_number": "{{ $json.phone }}",\n  "agent_id": "YOUR_AGENT_ID",\n  "upon_llm_dynamic_variables": {\n    "contact_name": "{{ $json.name }}",\n    "company": "{{ $json.company }}",\n    "campaign": "{{ $json.campaign }}"\n  }\n}',
            codeLanguage: "text",
            warning:
              "Always test with a small batch of real phone numbers you own before running a full campaign. TCPA compliance is your responsibility.",
          },
          {
            title: "Add a Wait node between batches",
            content:
              "After the HTTP Request node (and before it loops back), connect a **Wait** node set to **2 seconds**. This adds a 2-second pause between each batch of 5 calls, preventing rate limit issues.\n\nThe flow is: `Sheets → Split in Batches → HTTP Request → Wait → (loops back to Split in Batches) → Done`",
          },
          {
            title: "Handle the Done output",
            content:
              "Connect the **Output 1** (done) of Split in Batches to a notification node — send a Slack message or email when the entire batch campaign is finished:\n\n`Campaign complete! Processed {{ $node['Split in Batches'].context.currentRunIndex }} batches.`",
          },
          {
            title: "Log results to a spreadsheet",
            content:
              "After the HTTP Request, add a Google Sheets append node to log each call attempt. This gives you a record of which contacts were called and the initial API response.",
            code: "call_attempt_id -> {{ $json.call_id }}\ncontact_name   -> {{ $node['Split in Batches'].json.name }}\nphone          -> {{ $node['Split in Batches'].json.phone }}\nstatus         -> {{ $json.call_status }}\nattempt_time   -> {{ $now.toISO() }}",
            codeLanguage: "text",
          },
        ],
        aiTips: [
          "Ask AI: 'How do I calculate the optimal batch size and wait time to stay within an API's rate limit of 10 requests per second?'",
          "Ask AI: 'In n8n, how do I access data from the Split in Batches node inside downstream nodes using $node?'",
          "Ask AI: 'Write an n8n Code node that deduplicates a list of phone numbers before passing them to Split in Batches.'",
        ],
        testingGuide:
          "Create a test sheet with 12 rows. Set batch size to 3. Verify that exactly 4 batches run (3 contacts each), a 2-second wait occurs between each, results are logged to your sheet, and the 'done' notification fires after all batches complete.",
        nextSteps:
          "Exercise 18 applies batch and control patterns to outbound calling by building a structured campaign engine.",
      },
    },
    {
      slug: "16-form-trigger-intake",
      title: "Exercise 12: Lead Capture with the Form Trigger",
      description:
        "Use n8n's built-in Form trigger to create a no-code web form. Capture leads, intake info, or feedback — then automatically trigger a UponAI outbound call to follow up.",
      difficulty: "INTERMEDIATE",
      order: 12,
      tags: "form-trigger,lead-capture,no-code,intake,outbound",
      content: {
        overview:
          "n8n has a built-in Form trigger that creates a public-facing web form with no external tools needed. When someone submits the form, it fires your workflow. This is perfect for lead intake, demo request forms, or callback requests — and you can immediately trigger a UponAI AI call to follow up automatically.",
        objectives: [
          "Create a public web form using n8n's Form Trigger",
          "Configure form fields (text, email, phone, dropdown)",
          "Process form submissions in real-time",
          "Trigger an automatic UponAI outbound callback",
          "Log leads to Google Sheets and notify via Slack",
        ],
        prerequisites: ["Completed Exercises 1–6"],
        estimatedTime: "45–60 minutes",
        tools: [
          {
            name: "n8n Form Trigger",
            description:
              "Creates a hosted web form at a public URL (your-n8n-instance/form/[path]). No code or external service needed. Supports text, email, number, dropdown, and file upload fields.",
            docUrl: "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.formtrigger/",
          },
        ],
        steps: [
          {
            title: "Add the n8n Form Trigger node",
            content:
              "Create a new workflow. Search for **n8n Form Trigger** in the node panel (not the regular Webhook). This is a special trigger that creates a hosted form UI.\n\nSet the **Form Path** to something like `callback-request`. Your form will be live at:\n`https://YOUR_N8N_URL/form/callback-request`",
          },
          {
            title: "Configure your form fields",
            content:
              "Add these fields to your form:\n\n1. **Full Name** — Text field, required\n2. **Email** — Email field, required\n3. **Phone Number** — Text field, required, placeholder: '+1 (555) 000-0000'\n4. **Company** — Text field, optional\n5. **Best Time to Call** — Dropdown: 'Morning (9am-12pm)', 'Afternoon (12pm-5pm)', 'Any time'\n6. **What can we help with?** — Textarea, optional",
            tip: "Keep forms short. Every extra field reduces conversion. Name, email, phone, and one context question is usually ideal.",
          },
          {
            title: "Add an instant thank-you response",
            content:
              "The Form Trigger has a **Form Ending** option where you can configure what the user sees after submitting. Set it to show a thank-you message:\n\n**Title**: 'We will be in touch shortly!'\n**Message**: 'Our AI assistant will call you within 5 minutes during business hours. Check your email for confirmation.'",
          },
          {
            title: "Trigger an immediate UponAI callback",
            content:
              "After the form trigger, add an IF node to check business hours, then an HTTP Request node to call the lead back immediately:",
            code: 'URL: https://api.uponai.com/create-phone-call\nMethod: POST\nBody: {\n  "from_number": "+15551234567",\n  "to_number": "{{ $json.formData.phoneNumber }}",\n  "agent_id": "YOUR_AGENT_ID",\n  "upon_llm_dynamic_variables": {\n    "lead_name": "{{ $json.formData.fullName }}",\n    "company": "{{ $json.formData.company || \'their company\' }}",\n    "best_time": "{{ $json.formData.bestTimeToCall }}",\n    "topic": "{{ $json.formData.whatCanWeHelpWith || \'your inquiry\' }}"\n  }\n}',
            codeLanguage: "json",
            tip: "Form data is available at `$json.formData.fieldName` where fieldName matches the field label (camelCased automatically by n8n).",
          },
          {
            title: "Log to Google Sheets and notify Slack",
            content:
              "After the form submission (parallel to the callback), log the lead to Google Sheets and send a Slack notification:\n\n**Sheets columns**: timestamp, name, email, phone, company, best_time, topic, callback_triggered\n\n**Slack message**: `New callback request from {{ $json.formData.fullName }} ({{ $json.formData.company }}) — calling {{ $json.formData.phoneNumber }} now!`",
          },
          {
            title: "Share the form URL",
            content:
              "Activate the workflow, then copy the form URL from the Form Trigger node. You can embed this URL in:\n- Your website as a button or link\n- Email campaigns\n- Your CRM as a follow-up link\n- LinkedIn messages\n\nTest by submitting the form with your own phone number.",
          },
        ],
        aiTips: [
          "Ask AI: 'Write a UponAI agent prompt for an AI that calls back a lead immediately after they submit a demo request form. Include how to use the dynamic variables for personalization.'",
          "Ask AI: 'How do I add CAPTCHA or spam protection to an n8n form trigger?'",
          "Ask AI: 'What should my form's thank-you message say to set the right expectations for an immediate AI callback?'",
        ],
        testingGuide:
          "Submit the form with your own name and phone number. Verify: (1) you see the thank-you page, (2) Slack notification arrives, (3) Google Sheets row is added, (4) UponAI API returns a call_id (or the actual call comes through).",
        nextSteps:
          "Exercise 13 returns to AI-specific processing by using LLM nodes to analyze transcripts and produce structured outputs.",
      },
    },

    // ─── ADVANCED ────────────────────────────────────────────────────────────
    {
      slug: "17-outbound-campaign-engine",
      title: "Exercise 18: Outbound Call Campaign Engine",
      description:
        "Build a full outbound calling campaign system with retry logic, do-not-call blackout windows, multi-touch sequences, and real-time progress tracking.",
      difficulty: "ADVANCED",
      order: 18,
      tags: "outbound,campaigns,retry-logic,scheduling,sequences",
      content: {
        overview:
          "A production outbound campaign isn't just 'call everyone on the list.' It needs retry logic for no-answers, respect for do-not-call windows, multi-touch sequences (call → voicemail → SMS follow-up), and real-time tracking. This exercise builds that complete system using n8n and UponAI.",
        objectives: [
          "Build a campaign state machine with attempt tracking",
          "Implement retry logic with maximum attempt limits",
          "Add time-window filtering for business hours calling",
          "Create a multi-touch sequence (call + follow-up)",
          "Build a live campaign dashboard in Google Sheets",
        ],
        prerequisites: ["Completed Exercises 1–9 and 15"],
        estimatedTime: "90–120 minutes",
        tools: [
          {
            name: "Google Sheets as a Campaign Database",
            description:
              "Use separate sheets for: Contacts (master list), Campaign Queue (pending calls), Active Campaign (in-progress), Completed (finished). Update status as the campaign progresses.",
          },
          {
            name: "n8n Workflow Variables",
            description:
              "Store campaign-level state (start time, total contacts, completed count) as workflow static data using `$getWorkflowStaticData('global')`. This persists across executions.",
          },
        ],
        steps: [
          {
            title: "Design your campaign data structure",
            content:
              "Set up a Google Sheet with your campaign contacts and these status columns:\n\n`name | phone | email | attempt_count | last_attempt | status | call_id | notes`\n\nStatus values: `pending` → `calling` → `completed` / `no_answer` / `do_not_call` / `max_attempts`\n\nThis sheet is your campaign's source of truth.",
          },
          {
            title: "Build the campaign launcher workflow",
            content:
              "Create a workflow triggered by Schedule Trigger (every 30 minutes during business hours). It reads all `pending` and `no_answer` contacts with `attempt_count < 3`, filters by business hours, and initiates calls:",
            code: "const now = new Date();\nconst hour = now.getHours();\nconst day = now.getDay();\n\n// Business hours: Mon-Fri, 9am-5pm\nif (day === 0 || day === 6 || hour < 9 || hour >= 17) {\n  return [{ json: { skip: true, reason: 'Outside business hours' } }];\n}\n\nconst contacts = $input.all().map(i => i.json);\nconst eligible = contacts.filter(c => \n  (c.status === 'pending' || c.status === 'no_answer') && \n  parseInt(c.attempt_count || 0) < 3\n);\n\nconsole.log(`Campaign: ${eligible.length} contacts eligible`);\nreturn eligible.map(c => ({ json: c }));",
            codeLanguage: "javascript",
          },
          {
            title: "Update contact status before calling",
            content:
              "Before making the API call, update the contact's row in Google Sheets to `calling` status. This prevents duplicate calls if the workflow runs again before the first call completes:\n\n- Find row by phone number\n- Update: `status = calling`, `last_attempt = NOW()`, `attempt_count = attempt_count + 1`",
          },
          {
            title: "Handle the call outcome webhook",
            content:
              "Create a separate webhook workflow that receives `call_ended` events. Route based on `disconnect_reason`:\n\n- `user_hangup` / `call_ended` → update to `completed`\n- `no_answer` / `voicemail` → update to `no_answer` (eligible for retry)\n- `do_not_call` → update to `do_not_call` (never retry)\n- After 3 attempts with `no_answer` → update to `max_attempts`",
          },
          {
            title: "Add a voicemail follow-up sequence",
            content:
              "When a call results in `no_answer` and it's attempt #1 or #2, trigger an email follow-up. This creates a multi-touch sequence:\n\n- **Touch 1**: AI Call (answered → great, not answered → send email)\n- **Touch 2**: Email (24 hours later) with a calendar link\n- **Touch 3**: Final AI Call attempt (48 hours later)\n\nUse the Wait node + Schedule Trigger combination to time these follow-ups.",
            code: "// Determine next touch based on attempt count\nconst contact = $input.first().json;\nconst attempt = parseInt(contact.attempt_count);\n\nif (attempt === 1) {\n  return [{ json: { ...contact, next_action: 'email', wait_hours: 24 } }];\n} else if (attempt === 2) {\n  return [{ json: { ...contact, next_action: 'final_call', wait_hours: 48 } }];\n} else {\n  return [{ json: { ...contact, next_action: 'close', wait_hours: 0 } }];\n}",
            codeLanguage: "javascript",
          },
          {
            title: "Build a real-time campaign dashboard",
            content:
              "Add a separate 'Dashboard' sheet tab with these cells updated by every workflow run:\n\n- Total Contacts: `=COUNTA(Contacts!A:A)-1`\n- Completed: `=COUNTIF(Contacts!H:H,'completed')`\n- Pending: `=COUNTIF(Contacts!H:H,'pending')`\n- Completion Rate: `=Completed/Total*100`\n- Last Run: Updated by n8n via Sheets node",
          },
        ],
        aiTips: [
          "Ask AI: 'Design a retry schedule for outbound calling campaigns. How many attempts, how far apart, and what time of day works best?'",
          "Ask AI: 'What are TCPA compliance requirements for automated outbound calling and how do I implement them in my workflow?'",
          "Ask AI: 'Write a UponAI agent prompt for a follow-up call where the agent knows this is the second attempt and the person didn't answer the first call.'",
        ],
        testingGuide:
          "Load 5 test contacts into your sheet. Run the campaign. Verify status updates correctly for each state. Test the blackout window by running outside business hours. Verify max attempt logic stops retrying after 3 attempts.",
        nextSteps:
          "Exercise 19 adds live monitoring and alerting so your team can react when active call behavior looks abnormal.",
      },
    },
    {
      slug: "18-live-call-monitoring",
      title: "Exercise 19: Live Call Monitoring & Alerts",
      description:
        "Build a real-time call monitoring system that tracks active calls, detects anomalies (unusually long calls, repeated failures), and sends instant alerts with context.",
      difficulty: "ADVANCED",
      order: 19,
      tags: "monitoring,alerts,real-time,anomaly-detection,dashboard",
      content: {
        overview:
          "Once you have UponAI handling real calls, you need to know what's happening right now — not just in yesterday's report. This exercise builds a live monitoring system that tracks active calls, computes metrics in real-time, detects issues automatically, and alerts your team before small problems become big ones.",
        objectives: [
          "Build a stateful call tracker using n8n workflow static data",
          "Detect anomalies: calls over a certain duration, high failure rates",
          "Send context-rich Slack alerts with actionable information",
          "Create a real-time metrics dashboard",
          "Implement a heartbeat monitor for your webhook itself",
        ],
        prerequisites: ["Completed Exercises 1–9"],
        estimatedTime: "75–100 minutes",
        tools: [
          {
            name: "n8n Static Data",
            description:
              "Persistent key-value storage per workflow. Access with `$getWorkflowStaticData('global')`. Data survives workflow restarts. Use it to track running call counts, last-seen timestamps, and metric windows.",
          },
          {
            name: "Webhook Heartbeat Pattern",
            description:
              "A scheduled workflow that checks whether your webhook has received any events in the last N minutes. If not, it fires an alert — catching silent failures where UponAI stopped sending events.",
          },
        ],
        steps: [
          {
            title: "Build a call state tracker",
            content:
              "In your `call_started` handler, add a Code node that tracks active calls using static data:",
            code: "const staticData = $getWorkflowStaticData('global');\nif (!staticData.activeCalls) staticData.activeCalls = {};\n\nconst call = $input.first().json.body.call;\nstaticData.activeCalls[call.call_id] = {\n  started_at: Date.now(),\n  agent_id: call.agent_id,\n  from_number: call.from_number,\n  alerted: false\n};\n\n// Update metrics\nstaticData.calls_today = (staticData.calls_today || 0) + 1;\nstaticData.last_call_at = Date.now();\n\nreturn $input.all();",
            codeLanguage: "javascript",
          },
          {
            title: "Detect abnormally long calls",
            content:
              "In your `call_ended` handler, add logic to remove the call from active tracking and check if it was unusually long:",
            code: "const staticData = $getWorkflowStaticData('global');\nconst call = $input.first().json.body.call;\n\n// Remove from active calls\ndelete staticData.activeCalls?.[call.call_id];\n\n// Check for anomaly: call > 10 minutes\nconst duration_minutes = (call.duration_ms || 0) / 60000;\nconst is_anomaly = duration_minutes > 10;\n\n// Track failure rate in a rolling window\nif (!staticData.recent_calls) staticData.recent_calls = [];\nstaticData.recent_calls.push({\n  time: Date.now(),\n  status: call.call_status,\n  duration: call.duration_ms || 0\n});\n// Keep only last 20 calls\nstaticData.recent_calls = staticData.recent_calls.slice(-20);\n\nconst failures = staticData.recent_calls.filter(c => c.status !== 'ended').length;\nconst failure_rate = Math.round((failures / staticData.recent_calls.length) * 100);\n\nreturn [{ json: {\n  ...call,\n  duration_minutes: Math.round(duration_minutes * 10) / 10,\n  is_anomaly,\n  failure_rate,\n  high_failure_rate: failure_rate > 30\n}}];",
            codeLanguage: "javascript",
          },
          {
            title: "Route anomalies to an alert branch",
            content:
              "After the tracker Code node, add a Switch node with two outputs:\n\n- **Anomaly alert**: `{{ $json.is_anomaly || $json.high_failure_rate }}` is true\n- **Normal**: all other calls\n\nOn the anomaly branch, send an urgent Slack message with full context.",
          },
          {
            title: "Build the anomaly Slack alert",
            content:
              "Format a rich Slack alert for anomalous calls:",
            code: "ALERT: Call Anomaly Detected!\n\nCall ID: {{ $json.call_id }}\nDuration: {{ $json.duration_minutes }} minutes\nFrom: {{ $json.from_number }}\nAgent: {{ $json.agent_id }}\nAnomaly: {{ $json.is_anomaly ? 'Unusually long call (' + $json.duration_minutes + 'm)' : '' }}\nFailure Rate: {{ $json.high_failure_rate ? $json.failure_rate + '% of recent calls failed (threshold: 30%)' : 'Normal' }}\nTime: {{ $now.toFormat('h:mm a') }}\n\nAction required: Check UponAI dashboard.",
            codeLanguage: "text",
          },
          {
            title: "Build a heartbeat monitor",
            content:
              "Create a separate workflow with a **Schedule Trigger** (every 15 minutes). It checks if your main webhook has received any events recently:",
            code: "const staticData = $getWorkflowStaticData('global');\nconst lastCallAt = staticData.last_call_at || 0;\nconst minutesSinceLastCall = (Date.now() - lastCallAt) / 60000;\n\n// Alert if no calls in 2 hours during business hours\nconst hour = new Date().getHours();\nconst isBusinessHours = hour >= 9 && hour < 17;\n\nif (isBusinessHours && minutesSinceLastCall > 120) {\n  return [{ json: {\n    alert: true,\n    minutes_silent: Math.round(minutesSinceLastCall),\n    message: 'No webhook events in ' + Math.round(minutesSinceLastCall) + ' minutes. Is UponAI sending events?'\n  } }];\n}\n\nreturn [{ json: { alert: false } }];",
            codeLanguage: "javascript",
            tip: "Share static data between workflows by giving the heartbeat workflow access to the same workflow ID. Or use a shared Google Sheet as the state store instead.",
          },
          {
            title: "Add a monitoring Slack command",
            content:
              "Create one more workflow with a Webhook trigger that responds to a Slack slash command like `/call-status`. It reads the static data and returns current metrics:\n\n- Active calls right now\n- Calls today\n- Recent failure rate\n- Minutes since last call event\n\nThis lets your team check system health on demand.",
          },
        ],
        aiTips: [
          "Ask AI: 'What metrics should I monitor for an AI phone agent system and what thresholds should trigger alerts?'",
          "Ask AI: 'Design an anomaly detection algorithm for call center metrics — what patterns indicate a problem?'",
          "Ask AI: 'How do I create a Slack slash command that responds with data from an n8n webhook?'",
        ],
        testingGuide:
          "Simulate scenarios by sending fake webhook payloads: (1) send 10 call_started + call_ended events with `call_status: error` to trigger the failure rate alert, (2) send a call with `duration_ms: 700000` (>10 min) to trigger the anomaly alert, (3) wait 3 hours without sending any events and verify the heartbeat fires.",
        nextSteps:
          "You have now completed the advanced track. Exercise 20 ties all patterns together into a complete, deployable production system.",
      },
    },
  ];

  for (const exercise of NEW_EXERCISES) {
    await prisma.exercise.upsert({
      where: { slug: exercise.slug },
      update: {
        title: exercise.title,
        description: exercise.description,
        difficulty: exercise.difficulty,
        order: exercise.order,
        tags: exercise.tags,
        content: JSON.stringify(exercise.content),
      },
      create: {
        slug: exercise.slug,
        title: exercise.title,
        description: exercise.description,
        difficulty: exercise.difficulty,
        order: exercise.order,
        tags: exercise.tags,
        content: JSON.stringify(exercise.content),
      },
    });
    console.log("Exercise seeded: " + exercise.title);
  }

  console.log("\nSeed complete!");
  console.log("Admin login: " + adminEmail + " / " + adminPassword);
  console.log("Change the admin password after first login!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
