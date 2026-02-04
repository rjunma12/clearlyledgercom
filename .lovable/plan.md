

# Fix DODO_MODE Secret Configuration

## Problem
The `DODO_MODE` secret currently contains what appears to be an API key or token value instead of the mode setting. This causes the Dodo Payments API calls to fail.

## Solution
Update the `DODO_MODE` secret to the correct value:

| Secret | Current Value | Required Value |
|--------|---------------|----------------|
| `DODO_MODE` | `TKjRMQ8X5PuK...` (wrong - looks like a key) | `live` |

## What This Changes
Once corrected, the edge function will properly route to:
- **Live mode** (`live`): `https://live.dodopayments.com`
- **Test mode** (`test`): `https://test.dodopayments.com`

## Action Required
After approving this plan, I will prompt you to enter the new value for `DODO_MODE`. Simply type `live` (or `test` if you want to test first) when the secret input appears.

## Verification
After updating, we should test a payment checkout to confirm it works correctly.

