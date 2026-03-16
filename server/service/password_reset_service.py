import os
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
import resend


RESET_SALT = "password-reset"


def _get_serializer():
    secret_key = os.getenv("JWT_SECRET_KEY") or os.getenv("SECRET_KEY")
    if not secret_key:
        raise RuntimeError("JWT_SECRET_KEY or SECRET_KEY must be configured")
    return URLSafeTimedSerializer(secret_key)


def generate_reset_token(email):
    serializer = _get_serializer()
    return serializer.dumps(email, salt=RESET_SALT)


def verify_reset_token(token, max_age=3600):
    serializer = _get_serializer()
    try:
        return serializer.loads(token, salt=RESET_SALT, max_age=max_age)
    except SignatureExpired as error:
        raise ValueError("Reset link has expired") from error
    except BadSignature as error:
        raise ValueError("Invalid reset link") from error


def send_password_reset_email(email, reset_url):
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("RESEND_FROM_EMAIL")

    if not api_key or not from_email:
        raise RuntimeError("Resend email settings are not configured")

    resend.api_key = api_key
    return resend.Emails.send(
        {
            "from": from_email,
            "to": [email],
            "subject": "Reset your Radamjaribu Builders password",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
                  <h2>Reset your password</h2>
                  <p>We received a request to reset your password.</p>
                  <p>
                    <a href="{reset_url}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-weight: 600;">
                      Reset password
                    </a>
                  </p>
                  <p>This link expires in 1 hour.</p>
                  <p>If you did not request this, you can ignore this email.</p>
                </div>
            """,
        }
    )
