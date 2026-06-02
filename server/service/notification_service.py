import os

import resend

from server.models import User


def _get_resend_config():
    api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("RESEND_FROM_EMAIL")

    if not api_key or not from_email:
        raise RuntimeError("Resend email settings are not configured")

    return api_key, from_email


def _get_whatsapp_number():
    try:
        from server.models import SiteSetting
        return SiteSetting.get_singleton().whatsapp_number
    except Exception:
        return None


def _whatsapp_line(number):
    if not number:
        return ""
    return f"""
        <tr>
          <td style="padding:10px 0;font-weight:700;width:160px;">WhatsApp</td>
          <td style="padding:10px 0;">
            <a href="https://wa.me/{number}" style="color:#16a34a;text-decoration:none;">
              Chat with us on WhatsApp
            </a>
          </td>
        </tr>"""


_ACK_STYLE = """
    font-family:Arial,sans-serif;
    max-width:620px;
    margin:0 auto;
    color:#111827;
    line-height:1.6;
"""

_ACK_HEADER = """
    <div style="background:#0f172a;padding:24px 32px;border-radius:12px 12px 0 0;">
      <p style="margin:0;color:#94a3b8;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">
        Radamjaribu Builders
      </p>
    </div>
"""

_ACK_FOOTER = """
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e5e7eb;
                color:#6b7280;font-size:12px;">
      <p style="margin:0;">
        Radamjaribu Builders &mdash;
        <a href="https://radamconstruction.vercel.app" style="color:#6b7280;">
          radamconstruction.vercel.app
        </a>
      </p>
      <p style="margin:4px 0 0;">
        This is an automated acknowledgement. Please do not reply to this email.
      </p>
    </div>
"""


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


def send_booking_acknowledgement(booking):
    """Instant acknowledgement sent to the customer when they submit a booking."""
    if not booking.email:
        return None

    api_key, from_email = _get_resend_config()
    resend.api_key = api_key

    service_name = booking.service.name if booking.service else "General inquiry"
    first_name = (booking.name or "there").split()[0]
    wa = _get_whatsapp_number()

    return resend.Emails.send({
        "from": from_email,
        "to": [booking.email],
        "subject": "We've received your booking request — Radamjaribu Builders",
        "html": f"""
        <div style="{_ACK_STYLE}">
          {_ACK_HEADER}
          <div style="padding:32px;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">
              Thanks for reaching out, {first_name}!
            </h2>
            <p style="margin:0 0 20px;color:#475569;">
              We've received your booking request and our team will review it shortly.
              You can expect a personalised response within <strong>24 hours</strong>.
            </p>

            <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 12px;font-weight:700;color:#0f172a;">Your request summary</p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#64748b;width:140px;">Service</td>
                  <td style="padding:8px 0;color:#111827;">{service_name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#64748b;">Name</td>
                  <td style="padding:8px 0;color:#111827;">{booking.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#64748b;">Phone</td>
                  <td style="padding:8px 0;color:#111827;">{booking.phone or "—"}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#64748b;vertical-align:top;">
                    Your message
                  </td>
                  <td style="padding:8px 0;color:#111827;white-space:pre-wrap;">
                    {booking.message or "—"}
                  </td>
                </tr>
              </table>
            </div>

            <p style="margin:0 0 8px;color:#475569;font-size:14px;">
              Need a faster response?
            </p>
            <table style="border-collapse:collapse;font-size:14px;">
              {_whatsapp_line(wa)}
            </table>

            <p style="margin:24px 0 0;color:#111827;">
              Kind regards,<br>
              <strong>The Radamjaribu Builders Team</strong>
            </p>
            {_ACK_FOOTER}
          </div>
        </div>
        """,
    })


def send_contact_acknowledgement(contact):
    """Instant acknowledgement sent to the customer when they submit a contact message."""
    if not contact.email:
        return None

    api_key, from_email = _get_resend_config()
    resend.api_key = api_key

    first_name = (contact.name or "there").split()[0]
    subject_label = contact.subject or "your message"
    is_rfq = contact.subject == "hardware-rfq"
    wa = _get_whatsapp_number()

    intro = (
        "We've received your hardware RFQ. Our team will review your list, "
        "check stock availability, and get back to you with pricing within <strong>24 hours</strong>."
        if is_rfq else
        "We've received your message and our team will get back to you within <strong>24 hours</strong>."
    )

    return resend.Emails.send({
        "from": from_email,
        "to": [contact.email],
        "subject": "Thanks for your message — Radamjaribu Builders",
        "html": f"""
        <div style="{_ACK_STYLE}">
          {_ACK_HEADER}
          <div style="padding:32px;">
            <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">
              Thanks for getting in touch, {first_name}!
            </h2>
            <p style="margin:0 0 20px;color:#475569;">
              {intro}
            </p>

            <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 12px;font-weight:700;color:#0f172a;">Your message summary</p>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#64748b;width:140px;">Subject</td>
                  <td style="padding:8px 0;color:#111827;">{subject_label}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#64748b;">Name</td>
                  <td style="padding:8px 0;color:#111827;">{contact.name}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-weight:600;color:#64748b;vertical-align:top;">
                    Message
                  </td>
                  <td style="padding:8px 0;color:#111827;white-space:pre-wrap;">
                    {contact.message or "—"}
                  </td>
                </tr>
              </table>
            </div>

            <p style="margin:0 0 8px;color:#475569;font-size:14px;">
              Need a faster response?
            </p>
            <table style="border-collapse:collapse;font-size:14px;">
              {_whatsapp_line(wa)}
            </table>

            <p style="margin:24px 0 0;color:#111827;">
              Kind regards,<br>
              <strong>The Radamjaribu Builders Team</strong>
            </p>
            {_ACK_FOOTER}
          </div>
        </div>
        """,
    })
