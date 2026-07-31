# CRA contribution rules

This is a snapshot of the rules encoded in [`src/data/limits.ts`](../src/data/limits.ts), current as of the `LIMITS_LAST_VERIFIED` date in that file. The in-app **About** screen always renders the live tables straight from that same file, so it can never drift from what the calculators actually use - if you want the current numbers, check the app itself; this file is for understanding the _rules_, not for copying figures.

Sources: canada.ca, cross-checked against TaxTips.ca and Investment Executive.

## TFSA

- Annual dollar limit is set by CRA each year, indexed to inflation and rounded to the nearest $500.
- **2015 is a real anomaly**: the limit jumped to $10,000 for one year (a policy change), then reverted to $5,500 in 2016. Growth is not monotonic - don't assume it when reasoning about this data.
- Room starts accruing the year a resident turns 18, regardless of a province's age of majority for _opening_ an account (BC, NB, NL, NS, NT, NU, and YT require age 19 to open, but room still accrues from 18).
- Unused room carries forward indefinitely, with no cap.
- **Withdrawals are added back to room only on January 1 of the following year** - withdrawing and re-contributing in the same calendar year is still an over-contribution. This is the single most common real-world mistake with TFSAs.
- Over-contribution penalty: 1% per month on the excess, with no buffer.
- 2027's limit had not yet been published as of this writing - the app treats an unpublished year as unknown rather than guessing, via `isYearSupported()`.

## FHSA

- Introduced April 2023. Unlike TFSA and RRSP, these dollar figures are **fixed in legislation, not indexed to inflation** - they've been $8,000/$40,000 since launch.
- **Room does not accrue before an account is opened** - someone eligible since 2023 who opens their first FHSA in 2026 has $8,000 of room, not $32,000.
- Carryforward into a given year is capped at $8,000 from the *immediately preceding* year only - it does not accumulate across multiple skipped years. Two years of zero contributions doesn't mean $16,000 carries forward; only the most recent year's unused amount does, capped at $8,000.
- A $40,000 lifetime cap overrides the annual/carryforward math whenever it would otherwise allow more.
- The account closes at the earliest of: 15 years after opening, the year the holder turns 71, or the year after their first qualifying withdrawal.
- Over-contribution penalty: 1% per month, no buffer.

## RRSP

- New room each year = `min(18% of last year's earned income, that year's CRA dollar maximum)`, minus any pension adjustment, plus whatever carried forward.
- **No minimum age** - a teenager with a summer job and a filed tax return accrues RRSP room. The only bound is the upper end.
- Must be collapsed by December 31 of the year the holder turns 71; contributions are permitted through that year.
- Carries forward indefinitely.
- Over-contribution buffer: a **$2,000 lifetime cushion** before the 1%/month penalty applies - the only one of the three accounts with a buffer at all.
- The RRSP dollar maximum for a given year is published a year ahead of TFSA's, because it's derived from the prior year's money-purchase limit - so a future year can be "known" for RRSP while the same year is still unknown for TFSA.
- `priorUnusedRoomOverrideCents` lets a user paste their real available room straight from their Notice of Assessment instead of reconstructing income history back to when they started working - without it, this tool would only be useful to someone with perfect records since age 18.

## Disclaimer

See [`DISCLAIMER.md`](DISCLAIMER.md). Short version: this is an estimate, not advice, and your CRA My Account is the source of truth.
