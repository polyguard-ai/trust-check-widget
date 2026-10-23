"""Flask decorator that requires a completed Polyguard Trust Check.

Standard library only for the HTTP call. Behind a proxy, wrap the app with
werkzeug.middleware.proxy_fix.ProxyFix so request.remote_addr is the visitor's.
"""

import json
import os
import urllib.parse
import urllib.request
from functools import wraps

from flask import Flask, abort, jsonify, request

SITEVERIFY_URL = "https://api.polyguard.ai/v2/siteverify"
# The hostname your form is served from, exactly as visitors load it.
EXPECTED_HOSTNAME = os.environ.get("SITE_HOSTNAME", "www.example.com")


def siteverify(token, remoteip=None, secret=None):
    fields = {"response": token}
    if remoteip:
        fields["remoteip"] = remoteip
    if secret:
        fields["secret"] = secret
    data = urllib.parse.urlencode(fields).encode()
    req = urllib.request.Request(SITEVERIFY_URL, data=data, method="POST")
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.load(resp)


def require_trust_check(action=None):
    def decorator(view):
        @wraps(view)
        def wrapper(*args, **kwargs):
            token = request.form.get("pg-trust-check-response", "")
            if not token:
                abort(400, "missing-input-response")
            result = siteverify(
                token,
                remoteip=request.remote_addr,
                secret=os.environ.get("POLYGUARD_SITEVERIFY_SECRET"),
            )
            ok = (
                result.get("success") is True
                and result.get("hostname") == EXPECTED_HOSTNAME
                and (action is None or result.get("action") == action)
            )
            if not ok:
                return jsonify(error="trust_check_failed", codes=result.get("error-codes", [])), 403
            return view(*args, **kwargs)

        return wrapper

    return decorator


app = Flask(__name__)


@app.post("/signup")
@require_trust_check(action="signup")
def signup():
    return "Account created"


if __name__ == "__main__":
    app.run(debug=True)
