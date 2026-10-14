"""Run privately to hash a password-manager-generated credential; does not generate or save a key."""
import getpass
import hashlib
import sys
value = getpass.getpass('Paste a strong credential (hidden): ')
if len(value) < 32:
    sys.exit('Use at least 32 random characters from your password manager.')
print('SHA-256 hash (configure only the hash on the server):')
print(hashlib.sha256(value.encode('utf-8')).hexdigest())
