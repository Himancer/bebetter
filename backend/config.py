import os

# JWT signing key. MUST be provided via the SECRET_KEY environment variable in
# production — if it isn't, tokens are signed with a known value and anyone can
# forge a valid login. We fall back to an obviously-insecure dev key locally and
# print a loud warning so it can never be mistaken for production-safe.
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    SECRET_KEY = 'dev-insecure-key-do-not-use-in-production'
    print(
        "WARNING: SECRET_KEY not set - using an INSECURE development key. "
        "Set the SECRET_KEY environment variable in production to prevent JWT forgery."
    )
