import fs from "fs";
import fetch from "node-fetch";

const API_URL = "https://api.intospace.io/chat/message";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJlbWFpbCI6ImFtYW5rdW1hcmdvdXJoQGdtYWlsLmNvbSIsImlhdCI6MTc0NDYyODc1NCwiZXhwIjoxNzc2MTg2MzU0LCJhdWQiOiJodHRwczovL3lvdXJkb21haW4uY29tIiwiaXNzIjoiZmVhdGhlcnMiLCJzdWIiOiJ0VnNlRnJGRlFLZzlnSXhvIiwianRpIjoiNTgyYjY1YmQtNWYyNi00NWY2LWE3M2MtM2U3OWIxMzAxMmYyIn0.XhNbVqebaHdyJjKfwbIRfjnnN6XQr9HgeiHXmqBRdwU"; // Replace this with your real token
const YOUR_SENDER_ID = "tVseFrFFQKg9gIxo";
const TEAM_ID = "614396f2f76dbe0010b1d7ab";
const OUTPUT_FILE = "my-work-updates.md";

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

(async () => {
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

  const markdown = allMessages
    .map((msg) => {
      const dateObj = new Date(msg.createdAt);
      const formattedDate = dateObj.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      const content = msg.content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<ul>/gi, "")
      .replace(/<\/ul>/gi, "")
      .replace(/<li>/gi, "\n- ")
      .replace(/<\/li>/gi, "")
      .replace(/<[^>]+>/g, ""); // Remove any remaining HTML tags
      return `### ${formattedDate}\n${content}\n`;
    })
    .join("\n---\n");

  fs.writeFileSync(OUTPUT_FILE, markdown);
  console.log(`✅ Exported ${allMessages.length} messages to ${OUTPUT_FILE}`);
})();
