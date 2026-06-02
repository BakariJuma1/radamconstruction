from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from groq import Groq
import os

ai_bp = Blueprint("ai", __name__)

SYSTEM_PROMPT = (
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


@ai_bp.route("/ai/enhance-description", methods=["POST"])
@jwt_required()
def enhance_description():
    data = request.get_json()
    text = (data or {}).get("text", "").strip()
    content_type = (data or {}).get("type", "service")

    if not text:
        return jsonify({"error": "text is required"}), 400

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return jsonify({"error": "Groq API key not configured"}), 500

    context = TYPE_CONTEXT.get(content_type, TYPE_CONTEXT["service"])
    user_message = f"{context}\n\nOriginal description: {text}"

    try:
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.7,
            max_tokens=300,
        )
        enhanced = completion.choices[0].message.content.strip()
        return jsonify({"enhanced": enhanced})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
