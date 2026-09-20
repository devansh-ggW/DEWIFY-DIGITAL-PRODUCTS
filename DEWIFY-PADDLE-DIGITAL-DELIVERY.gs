/*
 * DEWIFY — Paddle Digital Delivery (DIRECT DOWNLOAD)
 *
 * No Supabase. No email delivery.
 * Uses:
 *   - Paddle Billing for payment verification
 *   - Google Apps Script as the server-side gate
 *   - Private Google Drive for the source files
 *
 * FLOW
 *   1. Paddle checkout.completed exposes txn_... to the browser.
 *   2. Browser redirects to this Apps Script web app with product + txn.
 *   3. Apps Script verifies the transaction directly with Paddle using the
 *      server-side API key and checks the configured price ID.
 *   4. Apps Script creates a short-lived download token in CacheService.
 *   5. Browser is redirected to the download action.
 *   6. Apps Script verifies the token, re-checks Paddle, reads the private
 *      Google Drive file, and returns a page that triggers a local browser
 *      download from an in-memory Blob. The Drive file is never public.
 *
 * SCRIPT PROPERTIES
 *   PADDLE_API_KEY
 *   CREATOR_VAULT_PRICE_ID
 *   AI_MONEY_ARC_PRICE_ID
 *   CREATOR_VAULT_FILE_ID   (recommended)
 *   AI_MONEY_ARC_FILE_ID    (recommended)
 *
 * If a FILE_ID is omitted, the exact filename below is searched in Drive.
 */

const DIGITAL_PRODUCTS = {
  creator: {
    label: "Creator Vault 300",
    priceProperty: "CREATOR_VAULT_PRICE_ID",
    fileIdProperty: "CREATOR_VAULT_FILE_ID",
    fileName: "300_Digital_Product_Vault.zip",
    downloadName: "Creator-Vault-300.zip",
    mimeType: "application/zip"
  },
  arc: {
    label: "AI Money Arc",
    priceProperty: "AI_MONEY_ARC_PRICE_ID",
    fileIdProperty: "AI_MONEY_ARC_FILE_ID",
    fileName: "AI_MONEY_ARC_Book.pdf",
    downloadName: "AI-Money-Arc.pdf",
    mimeType: "application/pdf"
  }
};

const TOKEN_PREFIX = "DEWIFY_DOWNLOAD_";
const TOKEN_TTL_SECONDS = 10 * 60;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const RETRY_MS = 2500;

function doGet(e) {
  try {
    const action = String(e && e.parameter && e.parameter.action || "status").toLowerCase();

    if (action === "status") {
      return htmlPage_(
        "DEWIFY Digital Delivery",
        "Delivery service is online.",
        "<p style='color:#999'>No file was requested.</p>"
      );
    }

    if (action === "authorize") {
      return authorizePage_(e);
    }

    if (action === "download") {
      return downloadPage_(e);
    }

    return htmlPage_("DEWIFY Digital Delivery", "Invalid request.", "<p>Please return to DEWIFY and try again.</p>");
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return htmlPage_(
      "DEWIFY — Download Error",
      "We couldn't prepare your download.",
      "<p style='color:#999'>Please return to the product page and try again.</p>"
    );
  }
}

function authorizePage_(e) {
  const productKey = clean_(e && e.parameter && e.parameter.product, 20).toLowerCase();
  const transactionId = clean_(e && e.parameter && e.parameter.txn, 80);
  const product = DIGITAL_PRODUCTS[productKey];

  if (!product) {
    return htmlPage_("DEWIFY — Invalid Product", "Invalid digital product.", "<p>Please start the purchase again.</p>");
  }

  if (!/^txn_[a-z0-9]{26}$/i.test(transactionId)) {
    return htmlPage_("DEWIFY — Invalid Transaction", "Invalid transaction reference.", "<p>Please start the purchase again.</p>");
  }

  const transaction = getPaddleTransaction_(transactionId);

  if (String(transaction.status || "") !== "completed") {
    const retryUrl = buildAbsoluteSelfUrl_({
      action: "authorize",
      product: productKey,
      txn: transactionId
    });

    return htmlPage_(
      "DEWIFY — Finalizing Purchase",
      "Your payment is being finalized…",
      "<p style='color:#999'>This page will retry automatically.</p>" +
      "<p style='color:#666;font-size:12px'>Transaction status: " + escapeHtml_(String(transaction.status || "pending")) + "</p>" +
      "<script>setTimeout(function(){location.replace(" + JSON.stringify(retryUrl) + ");}," + RETRY_MS + ");</script>"
    );
  }

  if (!transactionContainsProduct_(transaction, product)) {
    return htmlPage_("DEWIFY — Verification Failed", "Purchase could not be verified.", "<p style='color:#999'>The transaction does not contain this product.</p>");
  }

  const token = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  CacheService.getScriptCache().put(
    TOKEN_PREFIX + token,
    JSON.stringify({ transactionId: transactionId, productKey: productKey }),
    TOKEN_TTL_SECONDS
  );

  const downloadUrl = buildAbsoluteSelfUrl_({
    action: "download",
    token: token
  });

  return htmlPage_(
    "DEWIFY — Download Ready",
    "Your download is ready.",
    "<p style='color:#999'>Starting your download…</p>" +
    "<p><a style='color:#eee' href='" + escapeHtml_(downloadUrl) + "'>Click here if it doesn't start.</a></p>" +
    "<script>setTimeout(function(){location.replace(" + JSON.stringify(downloadUrl) + ");},350);</script>"
  );
}

function downloadPage_(e) {
  const token = clean_(e && e.parameter && e.parameter.token, 100);

  if (!token) {
    return htmlPage_("DEWIFY — Invalid Download", "Download link is invalid.", "<p>Please return to DEWIFY and purchase the product again.</p>");
  }

  const cached = CacheService.getScriptCache().get(TOKEN_PREFIX + token);

  if (!cached) {
    return htmlPage_("DEWIFY — Download Expired", "Download link expired.", "<p>Please return to DEWIFY and use your completed checkout again.</p>");
  }

  let grant;
  try {
    grant = JSON.parse(cached);
  } catch (_) {
    return htmlPage_("DEWIFY — Invalid Download", "Download authorization is invalid.", "<p>Please return to DEWIFY.</p>");
  }

  const product = DIGITAL_PRODUCTS[grant.productKey];

  if (!product) {
    return htmlPage_("DEWIFY — Invalid Product", "Digital product is invalid.", "<p>Please return to DEWIFY.</p>");
  }

  const transaction = getPaddleTransaction_(String(grant.transactionId || ""));

  if (String(transaction.status || "") !== "completed" || !transactionContainsProduct_(transaction, product)) {
    return htmlPage_("DEWIFY — Verification Failed", "Purchase verification failed.", "<p style='color:#999'>The transaction is no longer eligible for this download.</p>");
  }

  const file = getDriveFile_(product);
  const size = file.getSize();

  if (size > MAX_FILE_BYTES) {
    throw new Error(product.label + " is larger than the direct-download limit of 8 MB.");
  }

  const bytes = file.getBlob().getBytes();
  const base64 = Utilities.base64Encode(bytes);

  /*
   * This page does NOT expose the Drive URL.
   * It reconstructs the file entirely in the buyer's browser and starts
   * the download from a local Blob.
   */
  const jsData = JSON.stringify(base64);
  const safeName = JSON.stringify(product.downloadName);
  const safeType = JSON.stringify(product.mimeType);

  return HtmlService.createHtmlOutput(
    "<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>" +
    "<title>DEWIFY — Download</title>" +
    "<style>body{margin:0;min-height:100vh;background:#070707;color:#f4f2ec;font-family:Inter,system-ui,sans-serif;display:grid;place-items:center}.box{width:min(620px,88%);text-align:center;border:1px solid #2a2a2a;background:#0e0e0e;border-radius:22px;padding:44px 28px}.muted{color:#999;font-size:13px}</style></head><body>" +
    "<main class='box'><div style='font-size:10px;letter-spacing:.2em;color:#d9b36b;font-weight:900'>DEWIFY / DOWNLOAD</div>" +
    "<h1 style='font-size:42px;letter-spacing:-.06em;margin:10px 0'>DOWNLOAD READY.</h1>" +
    "<p class='muted'>Your file should start downloading now.</p>" +
    "<p><a id='manual' class='muted' href='#'>Click here if it doesn't start.</a></p></main>" +
    "<script>" +
    "const b64=" + jsData + ";" +
    "const name=" + safeName + ";" +
    "const type=" + safeType + ";" +
    "function go(){" +
      "const raw=atob(b64), arr=new Uint8Array(raw.length);" +
      "for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);" +
      "const blob=new Blob([arr],{type:type}), url=URL.createObjectURL(blob);" +
      "const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();" +
      "setTimeout(()=>URL.revokeObjectURL(url),30000);" +
      "document.getElementById('manual').href=url;" +
    "}" +
    "go();" +
    "</script></body></html>"
  );
}

function getPaddleTransaction_(transactionId) {
  const apiKey = requiredProperty_("PADDLE_API_KEY");
  if (!/^txn_[a-z0-9]{26}$/i.test(transactionId)) throw new Error("Invalid Paddle transaction ID.");

  const response = UrlFetchApp.fetch(
    "https://api.paddle.com/transactions/" + encodeURIComponent(transactionId) + "?include=customer",
    {
      method: "get",
      headers: { Authorization: "Bearer " + apiKey, Accept: "application/json" },
      muteHttpExceptions: true
    }
  );

  const code = response.getResponseCode();
  const raw = response.getContentText();

  if (code < 200 || code >= 300) throw new Error("Paddle API verification failed (HTTP " + code + ").");

  const payload = parseJson_(raw);
  if (!payload || !payload.data) throw new Error("Paddle returned no transaction data.");

  return payload.data;
}

function transactionContainsProduct_(transaction, product) {
  const expectedPriceId = String(PropertiesService.getScriptProperties().getProperty(product.priceProperty) || "").trim();
  if (!expectedPriceId) throw new Error("Missing Script Property: " + product.priceProperty);

  const items = Array.isArray(transaction.line_items) ? transaction.line_items : [];
  return items.some(function(item) {
    return String(item && item.price_id || "").trim() === expectedPriceId;
  });
}

function getDriveFile_(product) {
  const props = PropertiesService.getScriptProperties();
  const configuredId = String(props.getProperty(product.fileIdProperty) || "").trim();

  if (configuredId) {
    try {
      return DriveApp.getFileById(configuredId);
    } catch (_) {
      throw new Error(product.label + " Drive file ID is invalid or inaccessible.");
    }
  }

  const files = DriveApp.getFilesByName(product.fileName);
  let found = null;
  let count = 0;

  while (files.hasNext()) {
    found = files.next();
    count += 1;
  }

  if (count === 0) throw new Error(product.label + " file not found in Google Drive: " + product.fileName);
  if (count > 1) throw new Error("More than one Drive file is named " + product.fileName + ". Set " + product.fileIdProperty + ".");

  return found;
}

function buildAbsoluteSelfUrl_(params) {
  /* Apps Script web apps do not expose their public execution URL directly. */
  const configured = String(PropertiesService.getScriptProperties().getProperty("DELIVERY_WEB_APP_URL") || "").trim();
  if (!configured) throw new Error("Missing Script Property: DELIVERY_WEB_APP_URL");
  return appendQuery_(configured, params);
}

function appendQuery_(base, params) {
  const parts = [];
  Object.keys(params).forEach(function(k) {
    parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(params[k])));
  });
  return base + (base.indexOf("?") === -1 ? "?" : "&") + parts.join("&");
}

function htmlPage_(title, heading, body) {
  return HtmlService.createHtmlOutput(
    "<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'><title>" + escapeHtml_(title) + "</title>" +
    "<style>body{margin:0;min-height:100vh;background:#070707;color:#f4f2ec;font-family:Inter,system-ui,sans-serif;display:grid;place-items:center}.box{width:min(620px,88%);text-align:center;border:1px solid #2a2a2a;background:#0e0e0e;border-radius:22px;padding:44px 28px}h1{font-size:42px;line-height:.95;letter-spacing:-.06em;margin:10px 0}.eyebrow{font-size:10px;letter-spacing:.2em;color:#d9b36b;font-weight:900}p{line-height:1.7}</style></head><body><main class='box'><div class='eyebrow'>DEWIFY / DIGITAL DELIVERY</div><h1>" +
    escapeHtml_(heading) + "</h1>" + body + "</main></body></html>"
  );
}

function requiredProperty_(name) {
  const value = String(PropertiesService.getScriptProperties().getProperty(name) || "").trim();
  if (!value) throw new Error("Missing Script Property: " + name);
  return value;
}

function clean_(value, max) {
  const s = String(value == null ? "" : value).trim();
  return s.length > max ? s.slice(0, max) : s;
}

function parseJson_(value) {
  try { return JSON.parse(String(value)); }
  catch (_) { throw new Error("Invalid JSON."); }
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>\"]/g, function(char) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[char];
  });
}