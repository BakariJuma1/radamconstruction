from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from groq import Groq
import os
import json
import re

ai_bp = Blueprint("ai", __name__)

ENHANCE_SYSTEM_PROMPT = (
    "You are a marketing copywriter for Radamjaribu Builders, a professional construction "
    "company in Kenya. Enhance the given description to be compelling, professional, and "
    "sales-oriented. Keep it concise (2-4 sentences). Focus on quality, reliability, and "
    "value. Do not add made-up specifications or prices. Return only the enhanced description "
    "with no preamble, labels, or quotation marks."
)

TYPE_CONTEXT = {
    "service": "This is a construction service offering.",
    "portfolio": "This is a completed construction project in a portfolio.",
    "hardware_category": "This is a category of hardware and building materials.",
    "hardware_item": "This is a hardware or building material product.",
}


def _groq_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key)


def _extract_json(text):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group())
    return None


# ── Enhance description ────────────────────────────────────────────────────────

@ai_bp.route("/ai/enhance-description", methods=["POST"])
@jwt_required()
def enhance_description():
    data = request.get_json()
    text = (data or {}).get("text", "").strip()
    content_type = (data or {}).get("type", "service")

    if not text:
        return jsonify({"error": "text is required"}), 400

    client = _groq_client()
    if not client:
        return jsonify({"error": "Groq API key not configured"}), 500

    context = TYPE_CONTEXT.get(content_type, TYPE_CONTEXT["service"])
    user_message = f"{context}\n\nOriginal description: {text}"

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": ENHANCE_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
            max_tokens=300,
        )
        enhanced = completion.choices[0].message.content.strip()
        return jsonify({"enhanced": enhanced})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Chatbot context builder ────────────────────────────────────────────────────

def _build_company_context():
    from server.models import Service, PortfolioItem, HardwareCategory

    lines = ["=== RADAMJARIBU BUILDERS — COMPANY KNOWLEDGE BASE ===\n"]

    services = Service.query.all()
    if services:
        lines.append("SERVICES WE OFFER:")
        for s in services:
            line = f"  • {s.name}"
            if s.description:
                line += f": {s.description}"
            lines.append(line)
    else:
        lines.append("SERVICES: Not yet added by the admin.")

    lines.append("")

    portfolio = PortfolioItem.query.all()
    if portfolio:
        lines.append("COMPLETED PROJECTS (PORTFOLIO):")
        for p in portfolio:
            title = getattr(p, "tittle", None) or getattr(p, "title", "Unnamed project")
            line = f"  • {title}"
            if p.description:
                line += f": {p.description}"
            lines.append(line)
    else:
        lines.append("PORTFOLIO: No completed projects listed yet.")

    lines.append("")

    categories = HardwareCategory.query.all()
    if categories:
        lines.append("HARDWARE & BUILDING MATERIALS:")
        for cat in categories:
            lines.append(f"  Category: {cat.name}")
            if cat.description:
                lines.append(f"    {cat.description}")
            for item in cat.items:
                item_line = f"    - {item.name}"
                if item.description:
                    item_line += f": {item.description}"
                if item.price:
                    item_line += f" | KES {item.price:,.0f}"
                    if item.unit:
                        item_line += f" per {item.unit}"
                lines.append(item_line)
    else:
        lines.append("HARDWARE: No products listed yet.")

    return "\n".join(lines)


CHAT_SYSTEM_TEMPLATE = """\
You are a friendly and knowledgeable customer assistant for Radamjaribu Builders, \
a professional construction company based in Kenya.

Your job is to help visitors learn about the company's services, completed projects, \
and hardware products — using ONLY the information in the knowledge base below. \
Do not invent services, products, prices, or project details that are not listed.

If a visitor asks about something not covered in the knowledge base, say you don't have \
that detail right now and invite them to contact the team directly or make a booking.

Keep replies concise, warm, and helpful. Use short paragraphs or bullet points where \
appropriate. When relevant, encourage the visitor to book a consultation or send a message \
through the contact page.

{context}
"""


# ── Public chatbot ─────────────────────────────────────────────────────────────

@ai_bp.route("/ai/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    messages = data.get("messages", [])

    if not isinstance(messages, list) or not messages:
        return jsonify({"error": "messages array is required"}), 400

    client = _groq_client()
    if not client:
        return jsonify({"error": "Groq API key not configured"}), 500

    try:
        context = _build_company_context()
        system_prompt = CHAT_SYSTEM_TEMPLATE.format(context=context)

        groq_messages = [{"role": "system", "content": system_prompt}]
        for msg in messages[-20:]:
            role = msg.get("role")
            content = msg.get("content", "").strip()
            if role in ("user", "assistant") and content:
                groq_messages.append({"role": role, "content": content})

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=groq_messages,
            temperature=0.6,
            max_tokens=500,
        )
        reply = completion.choices[0].message.content.strip()
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── AI reply drafting ──────────────────────────────────────────────────────────

@ai_bp.route("/ai/draft-reply", methods=["POST"])
@jwt_required()
def draft_reply():
    data = request.get_json() or {}
    item_type = data.get("type", "booking")
    item = data.get("data", {})

    name = item.get("name", "Customer")
    email = item.get("email", "")
    message = item.get("message", "")

    if item_type == "booking":
        service = (item.get("service") or {}).get("name", "General inquiry")
        context_line = f"Service requested: {service}"
    else:
        subject = item.get("subject", "General inquiry")
        context_line = f"Subject: {subject}"

    prompt = f"""Write a professional, warm email reply from Radamjaribu Builders to this customer.

Customer: {name}
{context_line}
Customer's message: {message}

Format your response exactly like this (include the markers):
SUBJECT: <concise email subject>
BODY:
<full email body — use proper salutation, address their specific request, and sign off as 'The Radamjaribu Builders Team'>"""

    client = _groq_client()
    if not client:
        return jsonify({"error": "Groq API key not configured"}), 500

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a professional customer service email writer for Radamjaribu Builders, "
                        "a construction company in Kenya. Write warm, professional, and personalised emails. "
                        "Always address the customer by name. Never invent prices or timelines."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=700,
        )
        text = completion.choices[0].message.content.strip()

        subject = f"Re: Your inquiry – {name}"
        body = text

        if "SUBJECT:" in text and "BODY:" in text:
            parts = text.split("BODY:", 1)
            subject = parts[0].replace("SUBJECT:", "").strip()
            body = parts[1].strip()

        return jsonify({"subject": subject, "body": body, "to": email, "toName": name})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Send reply email via Resend ────────────────────────────────────────────────

@ai_bp.route("/ai/send-reply", methods=["POST"])
@jwt_required()
def send_reply():
    import resend

    data = request.get_json() or {}
    to_email = data.get("to", "")
    subject = data.get("subject", "")
    body = data.get("body", "")

    if not to_email or not subject or not body:
        return jsonify({"error": "to, subject, and body are required"}), 400

    api_key = os.environ.get("RESEND_API_KEY")
    from_email = os.environ.get("RESEND_FROM_EMAIL")

    if not api_key or not from_email:
        return jsonify({"error": "Email settings not configured"}), 500

    resend.api_key = api_key
    html_body = "<br>".join(body.splitlines())

    try:
        resend.Emails.send({
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": f"""
                <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#111827;line-height:1.7;">
                    {html_body}
                </div>
            """,
        })
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Booking triage ─────────────────────────────────────────────────────────────

@ai_bp.route("/ai/triage-bookings", methods=["POST"])
@jwt_required()
def triage_bookings():
    data = request.get_json() or {}
    bookings = data.get("bookings", [])

    if not bookings:
        return jsonify({"results": []}), 200

    client = _groq_client()
    if not client:
        return jsonify({"error": "Groq API key not configured"}), 500

    booking_lines = []
    for b in bookings:
        service = (b.get("service") or {}).get("name", "General")
        msg = (b.get("message") or "")[:150]
        booking_lines.append(f'ID:{b["id"]} | {b.get("name","?")} | Service:{service} | "{msg}"')

    prompt = f"""Triage these construction company booking inquiries. Assign a priority and a short label.

{chr(10).join(booking_lines)}

Return ONLY valid JSON:
{{"results":[{{"id":<id>,"priority":"urgent|normal|low","label":"<max 8 word action summary>"}}]}}

Priority:
- urgent: time-sensitive, emergency, clear deadline
- normal: standard project inquiry
- low: vague or general info request"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=600,
        )
        result = _extract_json(completion.choices[0].message.content)
        return jsonify(result or {"results": []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── SEO alt-text + meta description generator ─────────────────────────────────

@ai_bp.route("/ai/generate-seo", methods=["POST"])
@jwt_required()
def generate_seo():
    data = request.get_json() or {}
    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip()
    content_type = data.get("type", "service")  # "service" | "portfolio"

    if not title:
        return jsonify({"error": "title is required"}), 400

    client = _groq_client()
    if not client:
        return jsonify({"error": "Groq API key not configured"}), 500

    type_label = "construction service" if content_type == "service" else "completed construction project"

    prompt = f"""Generate SEO content for a {type_label} by Radamjaribu Builders, a professional construction company in Kenya.

Title: {title}
Description: {description or "Not provided"}

Return ONLY valid JSON in this exact format:
{{
  "alt_text": "<descriptive image alt text, under 120 characters, include relevant keywords and Kenya context>",
  "meta_description": "<SEO meta description, 145-160 characters, compelling and keyword-rich, include a call to action>"
}}

Rules:
- alt_text: describe what someone would see in the image, include the service/project type and 'Kenya' or 'Nairobi'
- meta_description: written for search results, include the company name 'Radamjaribu Builders', relevant keywords, and end with a soft CTA"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=300,
        )
        result = _extract_json(completion.choices[0].message.content)
        if not result:
            return jsonify({"error": "Failed to parse SEO content"}), 500
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── AI hardware search ─────────────────────────────────────────────────────────

@ai_bp.route("/ai/hardware-search", methods=["POST"])
def hardware_search():
    data = request.get_json() or {}
    query = (data.get("query") or "").strip()

    if not query:
        return jsonify({"error": "query is required"}), 400

    client = _groq_client()
    if not client:
        return jsonify({"error": "Groq API key not configured"}), 500

    from server.models import HardwareCategory
    categories = HardwareCategory.query.all()

    if not categories:
        return jsonify({"results": []}), 200

    items_by_id = {}
    catalog_compact = []
    for cat in categories:
        for item in cat.items:
            items_by_id[item.id] = {
                "id": item.id,
                "name": item.name,
                "description": item.description or "",
                "category": cat.name,
                "price": item.price,
                "unit": item.unit,
                "image_url": item.image_url,
            }
            catalog_compact.append({
                "id": item.id,
                "name": item.name,
                "description": item.description or "",
                "category": cat.name,
            })

    prompt = f"""You are a hardware catalog assistant for a Kenya construction company.
Given the catalog below, find items that best match the customer query.

CATALOG: {json.dumps(catalog_compact)}

QUERY: "{query}"

Return ONLY valid JSON with up to 8 most relevant item IDs ordered by relevance:
{{"ids":[id1,id2,...]}}"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=200,
        )
        result = _extract_json(completion.choices[0].message.content)
        matched_ids = result.get("ids", []) if result else []

        id_order = {id_: idx for idx, id_ in enumerate(matched_ids)}
        matched = [items_by_id[i] for i in matched_ids if i in items_by_id]
        matched.sort(key=lambda x: id_order.get(x["id"], 999))

        return jsonify({"results": matched})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
