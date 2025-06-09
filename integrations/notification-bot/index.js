const fs = require('fs/promises');
const process = require('process');
const fetch = require('node-fetch');
const { truncate } = require('./utils');

const payload = JSON.parse(
  await fs.readFile(process.env.GITHUB_EVENT_PATH, 'utf-8')
);

const repo = payload.repository.full_name;
let title, url, fullBody;

if (payload.issue) {
  const issue = payload.issue;
  title = `📝 Issue ${payload.action} in ${repo}`;
  url = issue.html_url;
  fullBody = issue.body || '';
} else if (payload.pull_request) {
  const pr = payload.pull_request;
  title = `🚀 PR ${payload.action} in ${repo}`;
  url = pr.html_url;
  fullBody = pr.body || '';
} else {
  console.error('Unsupported event type');
  process.exit(1);
}

const description = truncate(fullBody);

const discordBody = {
  embeds: [
    {
      title,
      description,
      url,
      timestamp: new Date().toISOString(),
    },
  ],
};

if (!process.env.DISCORD_WEBHOOK_URL) {
  console.error('Missing DISCORD_WEBHOOK_URL');
  process.exit(1);
}

const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(discordBody),
});

if (!response.ok) {
  console.error('Discord API error', await response.text());
  process.exit(1);
}
