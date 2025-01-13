curl \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/bipproduction/wibu-storage/branches/hotfix/2 \
  | jq -r '.commit.sha'