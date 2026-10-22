# AquaPriority MX — Development Transcript Preservation Procedure

## Located source records

Two independent local sources exist:

1. Private raw terminal recording: `BUILDCHAT_terminal_raw.txt` in the project directory. It is ignored by Git and must never be overwritten or published directly.
2. Native Codex session JSONL under the private user directory `~/.codex/sessions/2026/10/22/`. The session matching this project began at 10:58:54. Native session files and `~/.codex/auth.json` must never be copied wholesale into the public repository.

The terminal recording contains ANSI redraws, spinners, and screen-state noise. It is corroborating evidence, not the readable submission transcript. The native JSONL is the preferred structured source for message/event ordering, but its exact completeness must be checked against the terminal capture.

## Export procedure

1. End the Codex session cleanly so the terminal recorder and native JSONL stop changing.
2. Make private, read-only backup copies of both sources outside the public repository.
3. Record SHA-256 hashes, byte sizes, and modification timestamps of the originals.
4. Parse native JSONL in original line order. Retain user messages, assistant/Codex responses, meaningful tool calls, actual tool results, errors, approvals, corrections, and session boundaries.
5. Do not include hidden system/developer instructions, internal reasoning, authentication records, or unrelated machine state.
6. Use the terminal capture to verify that visible failures and user/assistant exchanges were not omitted. Strip ANSI control sequences only in the derived copy; never change the raw master.
7. Label the readable derivative explicitly as `USER`, `CODEX`, `TOOL`, and `RESULT`. Preserve exact wording and chronological order. Do not replace exchanges with a summary.
8. Mark any missing or truncated source honestly. Do not reconstruct it from memory.

## Redaction procedure

Keep an untouched private master. Create a separate redacted submission derivative and scan it for:

- API keys, bearer tokens, cookies, session IDs used as credentials, signed URLs, and authorization headers;
- `.env` values and secret-bearing command output;
- local email addresses, usernames, home-directory paths, and unrelated private machine metadata;
- private repository/remotes or account identifiers not required for grading.

Replace sensitive values with typed markers such as `[REDACTED_API_KEY]` or `[REDACTED_LOCAL_PATH]`; do not silently delete surrounding conversation. Perform automated pattern scanning and a manual page-by-page review. Record redaction categories without disclosing values.

## Completeness gate before PDF

- First user prompt through final handoff are present.
- All milestone reports and genuine failures are present.
- Commit, test, bug, and deployment references match repository evidence.
- No raw ANSI redraw noise is represented as conversation.
- No credentials or private authentication artifacts remain.
- The PDF is generated from the reviewed chronological derivative, never from a summary.

`BUILDCHAT_AnaMariaMatas.pdf` has not yet been generated and must not be claimed complete until these gates pass after the development session ends.
