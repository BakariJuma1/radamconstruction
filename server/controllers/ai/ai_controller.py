from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from groq import Groq
import os

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
        for msg in messages[-20:]:  # keep last 20 turns to stay within token limits
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
