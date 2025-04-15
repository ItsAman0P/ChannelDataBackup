import fs from "fs";
import fetch from "node-fetch";

const API_URL = "https://api.intospace.io/chat/message";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJlbWFpbCI6ImFtYW5rdW1hcmdvdXJoQGdtYWlsLmNvbSIsImlhdCI6MTc0NDYyODc1NCwiZXhwIjoxNzc2MTg2MzU0LCJhdWQiOiJodHRwczovL3lvdXJkb21haW4uY29tIiwiaXNzIjoiZmVhdGhlcnMiLCJzdWIiOiJ0VnNlRnJGRlFLZzlnSXhvIiwianRpIjoiNTgyYjY1YmQtNWYyNi00NWY2LWE3M2MtM2U3OWIxMzAxMmYyIn0.XhNbVqebaHdyJjKfwbIRfjnnN6XQr9HgeiHXmqBRdwU"; // Replace this with your real token
const YOUR_SENDER_ID = "tVseFrFFQKg9gIxo";
const TEAM_ID = "614396f2f76dbe0010b1d7ab";
const OUTPUT_FILE = "my-work-updates.html";

let hasMore = true;
let lastCreatedAt = null;
let allMessages = [];

async function fetchMessages(beforeDate) {
  const params = new URLSearchParams({
    teamId: TEAM_ID,
    deleted: "false",
    $paginate: "false",
    parentMessages: "true",
    $limit: "30",
  });

  if (beforeDate) {
    params.append("createdAt[$lte]", beforeDate);
  }

  const response = await fetch(`${API_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const json = await response.json();
  return json.messages || [];
}

function formatDate(dateString) {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function createHTMLDocument(messages) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Work Updates - Aman Karpentar</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 2px solid #eee;
      padding-bottom: 10px;
    }
    .message {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .message-date {
      color: #7f8c8d;
      font-size: 0.9em;
      margin-bottom: 10px;
    }
    .message-content {
      margin-top: 10px;
    }
    ul, ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
    }
    strong {
      font-weight: bold;
    }
    em {
      font-style: italic;
    }
    .generated-date {
      color: #7f8c8d;
      font-size: 0.9em;
      margin-bottom: 30px;
      text-align: right;
    }
  </style>
</head>
<body>
  <h1>My Work Updates</h1>
  <div class="generated-date">Generated on ${new Date().toLocaleDateString()}</div>
  
  ${messages.map(msg => `
    <div class="message">
      <div class="message-date">${formatDate(msg.createdAt)}</div>
      <div class="message-content">${msg.content.replace(/<br\s*\/?>/gi, '<br>')}</div>
    </div>
  `).join('')}
</body>
</html>`;
}

(async () => {
  try {
    while (hasMore) {
      const messages = await fetchMessages(lastCreatedAt);

      const userMessages = messages.filter(
        (msg) => msg.senderId === YOUR_SENDER_ID && msg.content
      );

      allMessages = [...allMessages, ...userMessages];

      if (messages.length < 30) {
        hasMore = false;
      } else {
        lastCreatedAt = messages[messages.length - 1].createdAt;
      }
    }

    // Sort messages by date (newest first)
    allMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const html = createHTMLDocument(allMessages);
    fs.writeFileSync(OUTPUT_FILE, html);
    console.log(`✅ Exported ${allMessages.length} messages to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("Error:", error);
  }
})();