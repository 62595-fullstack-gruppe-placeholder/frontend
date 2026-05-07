import os
import base64
import secrets
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

SALT_LENGTH = 16
IV_LENGTH = 12
TAG_LENGTH = 16
ITERATIONS = 100_000

def get_key(salt: bytes) -> bytes:
    password = os.environ.get("ENCRYPTION_SECRET")
    if not password:
        raise Exception("Missing required environment variable: ENCRYPTION_SECRET")
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=ITERATIONS,
    )
    return kdf.derive(password.encode("utf-8"))

def encrypt(plaintext: str) -> str:
    salt = secrets.token_bytes(SALT_LENGTH)
    iv = secrets.token_bytes(IV_LENGTH)
    key = get_key(salt)
    aesgcm = AESGCM(key)
    # AESGCM.encrypt returns ciphertext + tag appended
    ct_with_tag = aesgcm.encrypt(iv, plaintext.encode("utf-8"), None)
    ciphertext = ct_with_tag[:-TAG_LENGTH]
    tag = ct_with_tag[-TAG_LENGTH:]
    buf = salt + iv + tag + ciphertext
    return base64.b64encode(buf).decode("utf-8")

def decrypt(ciphertext_b64: str) -> str:
    buf = base64.b64decode(ciphertext_b64)

    salt       = buf[0:SALT_LENGTH]
    iv         = buf[SALT_LENGTH:SALT_LENGTH + IV_LENGTH]
    tag        = buf[SALT_LENGTH + IV_LENGTH:SALT_LENGTH + IV_LENGTH + TAG_LENGTH]
    encrypted  = buf[SALT_LENGTH + IV_LENGTH + TAG_LENGTH:]

    key = get_key(salt)

    # AESGCM expects ciphertext + tag appended
    aesgcm = AESGCM(key)
    decrypted = aesgcm.decrypt(iv, encrypted + tag, None)

    return decrypted.decode("utf-8")