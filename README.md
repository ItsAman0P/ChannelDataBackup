# ChannelDataBackup

A simple Node.js script to back up your messages from Channel (an internal Slack-like tool). It filters messages by a specific sender and saves them in HTML format.

## Getting Started

### Clone the repository
```bash
git clone https://github.com/ItsAman0P/ChannelDataBackup.git
cd ChannelDataBackup
```

### Install dependencies
```bash
npm i
```

### Configure the script
Open the file `export-work-html.mjs` and update the following constants:

```js
const AUTH_TOKEN = "YOUR_AUTH_TOKEN"; // Replace with your actual Channel API auth token
const YOUR_SENDER_ID = "YOUR_SENDER_ID"; // Replace with your user ID to filter your messages
```

### Run the script
```bash
node export-work-html.mjs
```

The script will generate an HTML file containing your filtered messages.

---

Feel free to fork or contribute to improve this tool!

