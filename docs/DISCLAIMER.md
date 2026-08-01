# Disclaimer

Contribution Limits Tool provides **estimates only**. It is not tax, legal, or financial advice, and nothing it displays should be treated as a substitute for professional advice or for CRA's own records.

Your contribution room depends on details this tool does not and cannot fully track: your complete residency history, income reported to CRA, pension adjustments, past withdrawals and transfers, and any corrections CRA has made to your account. This tool only knows what you type into it.

**Your official contribution room is shown in your CRA My Account and on your Notice of Assessment.** Always verify against those before making a contribution decision, and consult a qualified financial advisor or tax professional for anything that matters.

Contribution limit figures are hardcoded in [`src/data/limits.ts`](../src/data/limits.ts) and were last verified against CRA sources on the date recorded in that file (`LIMITS_LAST_VERIFIED`). A year with no published limit yet (for example, a future TFSA limit CRA hasn't announced) is treated as unknown and excluded from the estimate rather than guessed.

All data entered into this tool stays in your browser's `localStorage`. Nothing is transmitted anywhere. Clearing your browser data, using a different browser or device, or using private/incognito mode will not preserve it - use the Summary screen's export feature to back it up.
