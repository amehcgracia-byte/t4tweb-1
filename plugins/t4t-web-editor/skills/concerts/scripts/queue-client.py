#!/usr/bin/env python3
"""Use the production queue with a host secret; never put it in arguments.

No input lists jobs. A JSON object on stdin posts one queue operation.
"""
import json
import os
import ssl
import subprocess
import sys
import urllib.error
import urllib.request

ENDPOINT = 'https://talesforthetillerman.website/api/t4t-sync'
SERVICE = 'T4T WEB EDITOR production queue'
ACCOUNT = 'prj_LXyh0dDdK7gJT6bH0g9U9mFxOWzz'


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def main():
    secret = os.environ.get('T4T_SYNC_SECRET')
    if not secret and sys.platform == 'darwin':
        found = subprocess.run(
            ['security', 'find-generic-password', '-s', SERVICE, '-a', ACCOUNT, '-w'],
            capture_output=True, text=True, check=False,
        )
        if found.returncode == 0:
            secret = found.stdout.strip()
    if not secret or len(secret) < 32:
        raise ValueError('queue_credential_unavailable')
    raw = '' if sys.stdin.isatty() else sys.stdin.read(65537)
    body = None
    if raw.strip():
        value = json.loads(raw)
        if not isinstance(value, dict) or len(raw.encode()) > 65536:
            raise ValueError('invalid_operation')
        body = json.dumps(value).encode()
    request = urllib.request.Request(
        ENDPOINT, data=body,
        headers={'Authorization': 'Bearer ' + secret, 'Content-Type': 'application/json'},
    )
    try:
        # python.org Python on macOS may not include the OS CA bundle by default.
        ca_file = '/etc/ssl/cert.pem' if sys.platform == 'darwin' else None
        context = ssl.create_default_context(cafile=ca_file)
        opener = urllib.request.build_opener(NoRedirect(), urllib.request.HTTPSHandler(context=context))
        with opener.open(request, timeout=45) as response:
            print(json.dumps(json.load(response), ensure_ascii=False))
    except urllib.error.HTTPError as error:
        print(json.dumps({'error': 'queue_request_failed', 'status': error.code}))
        return 1
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError, urllib.error.URLError):
        print(json.dumps({'error': 'queue_client_failed'}))
        sys.exit(1)
