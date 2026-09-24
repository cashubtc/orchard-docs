# Test run: New Mint guide on regtest

This is the prompt for an agent with full root access to a disposable VPS. It follows the
Orchard New Mint guide from start to finish on regtest and reports every place the guide
failed, was unclear, or needed an unwritten step.

Replace the `DOCS_URL` value below before handing this over. To test unreleased changes,
use a preview deploy of the branch; otherwise leave the production site.

---

## Prompt

You are testing a documentation guide by following it exactly on this server. You have
full root access to a disposable Ubuntu VPS. Nothing on it matters, and no real money is
involved.

**Docs:** `DOCS_URL = https://docs.orchard.space`

Treat this site as the only source of truth for the setup. Start at
`DOCS_URL/new-mint/` and work through its five steps in order: System, Bitcoin node,
Lightning node, Cashu mint, Orchard. A plain-text copy of the whole guide is at
`DOCS_URL/_llms-txt/new-mint.txt`. Use it to read ahead, but follow the web pages, which
are canonical. Where a page hands off to an external guide (MiniBolt), follow that guide
as the page directs.

### Goal

Stand up the full stack from the guide, **on regtest**, and prove it is wired together
and working. Then write a report of everything that went wrong or wasn't written down.
The report matters more than getting the stack running.

### Rules

1. **Follow the guide literally.** Run the commands as written, in order, as the user the
   guide names. Don't fix things ahead of time from your own knowledge. Let the guide fail
   first, then fix it and record what happened.
2. **Regtest everywhere.** The guide targets mainnet. Change only what regtest requires,
   and log each change as an *expected regtest adaptation*, separate from real problems:
   - Bitcoin Core: `regtest=1` with a regtest RPC port (18443). No initial block download.
     Mine blocks yourself with `bitcoin-cli -regtest generatetoaddress` when funds or
     confirmations are needed.
   - LND: `bitcoin.regtest=true`. Macaroon paths use `chain/bitcoin/regtest/` instead of
     `mainnet/`, in both the mint config and the Orchard config.
   - Anything else that names a network: use regtest and log it.
3. **Skip only what can't work here, and log each skip.**
   - Cloudflare Tunnel: there's no domain or Cloudflare account. Skip it. Set the mint's
     `url` to `http://127.0.0.1:8085/`, and test everything locally.
   - Tor hidden service for Orchard: attempt it. If it can't work on this VPS, skip it and
     say why.
   - Firewall or SSH hardening that could lock you out of the VPS: apply it, but keep
     your own access working. If a step would lock you out, log it and adapt.
4. **Every manual effort gets recorded.** This means any command, file edit, permission
   change, package install, retry, wait, or guess that the guide didn't spell out. Record
   the exact command and why it was needed.
5. **Don't stop at the first failure.** Work around it, record it, and keep going. Only
   stop if the stack truly can't go further, and explain why in the report.
6. **Secrets:** use freshly generated seeds and passwords. Never reuse well-known test
   mnemonics. Don't paste seed phrases or passwords into the report.

### Extra wiring needed to test payments

The mint needs a Lightning counterparty to actually move money. This part isn't in the
guide, so it isn't counted as a guide problem, but log what you did:

- Run a second LND node on the same regtest bitcoind, with its own data dir, ports, and
  user. Fund both nodes by mining to them.
- Open a channel from the mint's LND to the second node, and push or pay across it so
  both sides have liquidity. Mine blocks to confirm it.
- For a Cashu wallet, download `cdk-cli` from the same CDK GitHub release the guide uses
  for `cdk-mintd`, verify it against `SHA256SUMS`, and point it at
  `http://127.0.0.1:8085`.

### What "working" means

Check each of these and record pass or fail with evidence (command plus trimmed output):

**Services**
- `bitcoind`, `lnd`, `postgresql`, `redis-server`, `cdk-mintd`, and `orchard` are all
  `active (running)` under systemd, and all are enabled.
- Reboot the VPS once. Everything comes back on its own, in dependency order, with no
  manual help.

**Mint**
- `curl http://127.0.0.1:8085/v1/info` returns the name and description from the guide's
  config, and the `cdk-mintd` version matches the release the guide installed.
- `curl http://127.0.0.1:9000/metrics` returns metrics.
- Ports match the guide's port table, and every service listens on `127.0.0.1` where the
  guide says it should.
- `cdk-mintd config show` (run as the guide runs it) prints the imported config, with
  secrets shown as `env:` references and not their values.
- **Mint:** request a mint quote with `cdk-cli`, pay its invoice from the second LND
  node, and mint ecash. The wallet balance matches.
- **Melt:** create an invoice on the second LND node and pay it from the `cdk-cli` wallet.
  The invoice settles, and the fee reserve and change look sensible.
- **Swap/send:** send a token from the wallet and receive it back.

**Orchard**
- The dashboard loads over the method the guide sets up. Report which one you used and
  how you reached it from this VPS (for example, curl or a port forward).
- Orchard connects to all of: Bitcoin RPC, LND, the mint's public API, the mint database
  (as the read-only `orchard` role), the mint's management RPC, and the mint metrics
  page. Check Orchard's logs for connection errors.
- The mint's System dashboard shows metrics after a few minutes.
- Change the mint's message of the day in Orchard. `curl /v1/info` shows the change.
  Restart `cdk-mintd`, and the change survives.
- Mint and melt activity from the payment tests shows up in Orchard's mint database
  views.

**Configuration changes** (the mint guide's "Change the configuration" section)
- Follow it to change one setting, for example `max_mint`. Confirm the new value is live.
  Confirm the section's warning about Orchard-made changes is accurate: say whether the
  message of the day you set in Orchard was reset.
- Follow its rollback steps and confirm the previous value is back.

**Backup and restore**
- Take a mint database backup the way the guide describes. Note whether it was clear
  what to back up (database, secrets file, seed) and where to store it.

### The report

Write the report to `/root/new-mint-test-report.md`, and print it at the end of your run.
Use this structure:

1. **Summary.** Did the stack end up fully working? One line per guide step: pass,
   pass with fixes, or fail.
2. **Environment.** OS and version, VPS size, and the exact versions of Bitcoin Core,
   LND, cdk-mintd, Postgres, Redis, Node.js, and Orchard that were installed. Include the
   `DOCS_URL` used and the date.
3. **Problems found.** For each one:
   - **Where:** page URL, section heading, and the step or command.
   - **What happened:** the exact command and error output (trimmed).
   - **What you did:** the exact fix.
   - **Suggested doc change:** a concrete wording or command change.
   - **Severity:** *blocker* (can't continue without outside knowledge), *major* (works
     only with a non-obvious fix), or *minor* (unclear, typo, cosmetic).
4. **Unwritten manual steps.** Everything you did that the guide didn't say, apart from
   the problems above and the expected adaptations, in order and with commands.
5. **Expected regtest adaptations.** Every change you made because of regtest, so they
   can be ruled out as doc bugs.
6. **Skipped steps.** What you skipped and why.
7. **Verification results.** The "What working means" checklist, with pass or fail and
   evidence for each item.
8. **Unclear or misleading text.** Places the guide worked but where a newcomer would
   likely get confused. Quote the passage and say why.

Be specific and factual. "The macaroon path was wrong" isn't enough. Name the page,
section and line, the path the guide gave, the path that worked, and why.
