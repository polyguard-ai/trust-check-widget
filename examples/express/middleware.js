// Express middleware that requires a completed Polyguard Trust Check.
// Node 18+ (global fetch). Mount express.urlencoded() before it.
const SITEVERIFY_URL = 'https://api.polyguard.ai/v2/siteverify';

function requireTrustCheck({ expectedHostname, action, secret } = {}) {
  if (!expectedHostname) throw new Error('requireTrustCheck: expectedHostname is required');

  return async function trustCheck(req, res, next) {
    const token = req.body && req.body['pg-trust-check-response'];
    if (typeof token !== 'string' || !token) {
      return res.status(400).json({ error: 'missing-input-response' });
    }

    const body = new URLSearchParams({ response: token });
    // Behind a proxy, set app.set('trust proxy', ...) so req.ip is the visitor's address.
    if (req.ip) body.set('remoteip', req.ip);
    if (secret) body.set('secret', secret);

    let result;
    try {
      const response = await fetch(SITEVERIFY_URL, {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(5000),
      });
      result = await response.json();
    } catch (err) {
      return next(err);
    }

    const ok =
      result.success === true &&
      result.hostname === expectedHostname &&
      (action === undefined || result.action === action);
    if (!ok) {
      return res
        .status(403)
        .json({ error: 'trust_check_failed', codes: result['error-codes'] || [] });
    }

    req.trustCheck = result;
    return next();
  };
}

module.exports = { requireTrustCheck };

// Usage:
//
// const express = require('express');
// const { requireTrustCheck } = require('./middleware');
//
// const app = express();
// app.use(express.urlencoded({ extended: false }));
// app.post(
//   '/signup',
//   requireTrustCheck({
//     expectedHostname: 'www.example.com',
//     action: 'signup',
//     secret: process.env.POLYGUARD_SITEVERIFY_SECRET,
//   }),
//   (req, res) => res.send('Account created'),
// );
