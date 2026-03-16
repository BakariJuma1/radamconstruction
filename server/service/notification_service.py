import os

import resend

from server.models import User


def _get_resend_config():
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("RESEND_FROM_EMAIL")

    if not api_key or not from_email:
        raise RuntimeError("Resend email settings are not configured")

    return api_key, from_email


def _get_team_recipient_emails():
    users = User.query.order_by(User.username.asc()).all()
    return [user.email for user in users if user.email]


def send_new_booking_notification(booking):
    recipient_emails = _get_team_recipient_emails()
    if not recipient_emails:
        return None

    api_key, from_email = _get_resend_config()
    resend.api_key = api_key

    service_name = booking.service.name if booking.service else "General inquiry"
    message = booking.message or "No project details provided."

    return resend.Emails.send(
        {
            "from": from_email,
            "to": recipient_emails,
            "subject": f"New booking request: {service_name}",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #111827;">
                  <h2 style="margin-bottom: 12px;">New booking request received</h2>
                  <p style="margin-bottom: 20px;">A customer has requested a consultation through the website.</p>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700; width: 160px;">Customer</td>
                      <td style="padding: 10px 0;">{booking.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700;">Phone</td>
                      <td style="padding: 10px 0;">{booking.phone}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700;">Email</td>
                      <td style="padding: 10px 0;">{booking.email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700;">Service</td>
                      <td style="padding: 10px 0;">{service_name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700;">Submitted</td>
                      <td style="padding: 10px 0;">{booking.created_at.strftime("%Y-%m-%d %H:%M:%S")}</td>
                    </tr>
                  </table>
                  <div style="padding: 16px; border-radius: 12px; background: #f3f4f6;">
                    <p style="margin: 0 0 8px; font-weight: 700;">Project details</p>
                    <p style="margin: 0; white-space: pre-wrap;">{message}</p>
                  </div>
                </div>
            """,
        }
    )


def send_new_contact_notification(contact):
    recipient_emails = _get_team_recipient_emails()
    if not recipient_emails:
        return None

    api_key, from_email = _get_resend_config()
    resend.api_key = api_key

    subject = contact.subject or "New contact message"
    message = contact.message or "No message provided."

    return resend.Emails.send(
        {
            "from": from_email,
            "to": recipient_emails,
            "subject": f"New contact message: {subject}",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #111827;">
                  <h2 style="margin-bottom: 12px;">New contact message received</h2>
                  <p style="margin-bottom: 20px;">A customer has submitted a message through the website.</p>
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700; width: 160px;">Customer</td>
                      <td style="padding: 10px 0;">{contact.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700;">Phone</td>
                      <td style="padding: 10px 0;">{contact.phone or "Not provided"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700;">Email</td>
                      <td style="padding: 10px 0;">{contact.email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700;">Subject</td>
                      <td style="padding: 10px 0;">{subject}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; font-weight: 700;">Submitted</td>
                      <td style="padding: 10px 0;">{contact.created_at.strftime("%Y-%m-%d %H:%M:%S")}</td>
                    </tr>
                  </table>
                  <div style="padding: 16px; border-radius: 12px; background: #f3f4f6;">
                    <p style="margin: 0 0 8px; font-weight: 700;">Message</p>
                    <p style="margin: 0; white-space: pre-wrap;">{message}</p>
                  </div>
                </div>
            """,
        }
    )
