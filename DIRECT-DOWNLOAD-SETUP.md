# DEWIFY direct digital downloads

This setup uses **Paddle + Google Apps Script + private Google Drive**. No Supabase and no email delivery.

## 1. Put the paid files in private Google Drive

Upload these files to a private Drive folder:

- `300_Digital_Product_Vault.zip`
- `AI_MONEY_ARC_Book.pdf`

Do **not** enable "Anyone with the link". The Apps Script runs as the owner and reads the files privately.

The script accepts explicit Drive file IDs (recommended). If you leave the IDs blank, it can fall back to the exact filenames above.

## 2. Deploy the Apps Script

Open Google Apps Script, paste `DEWIFY-PADDLE-DIGITAL-DELIVERY.gs`, and deploy it as a **Web app**:

- Execute as: **Me**
- Who has access: **Anyone**
- Copy the Web app URL.

In Script Properties, add:

`PADDLE_API_KEY`
Your **live** Paddle API key. Never put it in GitHub or frontend code.

`DELIVERY_WEB_APP_URL`
The full Apps Script Web app URL.

`CREATOR_VAULT_PRICE_ID`
The live Paddle `pri_...` ID for Creator Vault 300.

`AI_MONEY_ARC_PRICE_ID`
The live Paddle `pri_...` ID for AI Money Arc.

`CREATOR_VAULT_FILE_ID`
The private Drive file ID for `300_Digital_Product_Vault.zip`.

`AI_MONEY_ARC_FILE_ID`
The private Drive file ID for `AI_MONEY_ARC_Book.pdf`.

## 3. Configure the storefront

In `products.html`, replace these placeholders:

- `REPLACE_WITH_LIVE_CLIENT_SIDE_TOKEN`
- `REPLACE_WITH_APPS_SCRIPT_WEB_APP_URL`
- `REPLACE_WITH_CREATOR_VAULT_PRICE_ID`
- `REPLACE_WITH_AI_MONEY_ARC_PRICE_ID`

Use the live Paddle client-side token in the frontend. Keep the secret API key only in Apps Script Script Properties.

## 4. Customer flow

`products.html`
→ Paddle overlay checkout
→ `checkout.completed` exposes `transaction_id`
→ browser goes to Apps Script `action=authorize`
→ Apps Script re-reads the transaction from Paddle
→ requires `completed` status and the correct `pri_...` price
→ creates a short-lived download token
→ Apps Script reads the private Drive file
→ browser receives an in-memory Blob and starts the file download

The Drive file itself is never made public.

## 5. Notes

The direct download handler currently caps a delivered file at **8 MB** because it temporarily base64-encodes the file into the response page. The current Creator Vault ZIP (~2.7 MB) and AI Money Arc PDF (~1.4 MB) are below that limit.

This protects the original file from being publicly indexed or directly linked. It cannot prevent a legitimate buyer from sharing a copy after downloading.

Paddle's `checkout.completed` event exposes the transaction ID, while `transaction.completed` is the completed-payment fulfillment event. The server-side re-check is intentional so a client cannot simply invent a successful transaction reference.
