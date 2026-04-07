from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import json
import re
import base64
import uuid
from pathlib import Path
from pydantic import BaseModel
from datetime import datetime, timezone
import anthropic

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Optional MongoDB — if MONGO_URL is set, audit logs are saved; if not, app still works
mongo_enabled = False
db = None
try:
    if os.environ.get('MONGO_URL'):
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(os.environ['MONGO_URL'])
        db = client[os.environ.get('DB_NAME', 'tss_fraud_detector')]
        mongo_enabled = True
except Exception as e:
    print(f"MongoDB not available, audit logging disabled: {e}")

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

FORENSICS_PROMPT = """You are a Lenovo TSS (Technical Support Services) digital forensics analyst. Your job is to evaluate customer-submitted screenshots and photos for signs of AI generation or AI alteration.

Analyze this image across ALL 8 of these forensic indicators:

1. Text Integrity — Is taskbar/icon/window text distorted, gibberish, or unreadable?
2. UI Consistency — Are there duplicate UI elements like two Start buttons or repeated icons? Are open windows not reflected in the taskbar?
3. Window Content — Are open windows blank or empty when they should have content?
4. Timestamp/Clock — Is the date and time readable and realistic?
5. Icon Labels — Are desktop icon labels readable and correctly spelled?
6. Overall Coherence — Are there unnatural artifacts, blurring, inconsistent lighting or reflections?
7. Edit Artifacts — Is there mismatched resolution, JPEG artifacts, or inconsistent noise patterns?
8. Context Match — Does the visual evidence support the customer's stated claim?

Respond ONLY with a raw JSON object. No markdown, no backticks, no text before or after the JSON. The JSON must have this exact structure:
{"verdict":"LEGITIMATE","confidence":85,"riskLevel":"LOW","summary":"One sentence finding","indicators":[{"category":"Text Integrity","status":"PASS","detail":"All text is legible"},{"category":"UI Consistency","status":"PASS","detail":"..."},{"category":"Window Content","status":"PASS","detail":"..."},{"category":"Timestamp/Clock","status":"PASS","detail":"..."},{"category":"Icon Labels","status":"PASS","detail":"..."},{"category":"Overall Coherence","status":"PASS","detail":"..."},{"category":"Edit Artifacts","status":"PASS","detail":"..."},{"category":"Context Match","status":"PASS","detail":"..."}],"recommendation":"What TSS agent should do","flaggedElements":[]}

Rules:
- verdict must be one of: LEGITIMATE | SUSPICIOUS | LIKELY_AI_ALTERED | CONFIRMED_AI_ALTERED
- status must be one of: PASS | WARNING | FAIL
- riskLevel must be one of: LOW | MEDIUM | HIGH | CRITICAL
- confidence is a number from 0 to 100
- Always include all 8 indicator categories
- flaggedElements is an array of strings describing specific suspicious elements found
- Output ONLY the JSON object, nothing else"""


class AnalyzeRequest(BaseModel):
    image_base64: str
    media_type: str = "image/jpeg"


def calculate_fraud_risk_score(verdict, confidence):
    confidence = max(0, min(100, confidence))
    conf_ratio = confidence / 100.0
    if verdict == "LEGITIMATE":
        score = round(30 - (conf_ratio * 30))
        tier = "Auto-Cleared"
    elif verdict == "SUSPICIOUS":
        score = round(31 + (conf_ratio * 29))
        tier = "Agent Review Recommended"
    elif verdict == "LIKELY_AI_ALTERED":
        score = round(61 + (conf_ratio * 24))
        tier = "Flag for Review"
    elif verdict == "CONFIRMED_AI_ALTERED":
        score = round(86 + (conf_ratio * 14))
        tier = "Auto-Hold / Escalate to TAM"
    else:
        score = 50
        tier = "Agent Review Recommended"
    return score, tier


@api_router.post("/analyze")
async def analyze_image(request: AnalyzeRequest):
    try:
        api_key = os.environ.get('ANTHROPIC_API_KEY')
        if not api_key:
            return {"error": "ANTHROPIC_API_KEY is not configured on the server."}

        # Use official Anthropic SDK
        anthropic_client = anthropic.Anthropic(api_key=api_key)

        message = anthropic_client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": request.media_type,
                                "data": request.image_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": FORENSICS_PROMPT
                        }
                    ],
                }
            ],
        )

        response_text = message.content[0].text
        logger.info(f"Claude response length: {len(response_text)}")

        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if not json_match:
            logger.error(f"No JSON found in Claude response: {response_text[:500]}")
            return {"error": f"Failed to parse analysis response. Got: {response_text[:200]}"}

        analysis = json.loads(json_match.group())

        verdict = analysis.get("verdict", "SUSPICIOUS")
        confidence = analysis.get("confidence", 50)
        score, tier = calculate_fraud_risk_score(verdict, confidence)

        analyzed_at = datetime.now(timezone.utc).isoformat()

        result = {
            "verdict": verdict,
            "confidence": confidence,
            "riskLevel": analysis.get("riskLevel", "MEDIUM"),
            "summary": analysis.get("summary", "Analysis complete."),
            "indicators": analysis.get("indicators", []),
            "recommendation": analysis.get("recommendation", "Manual review recommended."),
            "flaggedElements": analysis.get("flaggedElements", []),
            "fraudRiskScore": score,
            "fraudRiskTier": tier,
            "analyzedAt": analyzed_at
        }

        # Save audit log to MongoDB only if available
        if mongo_enabled and db is not None:
            try:
                audit_doc = {**result, "media_type": request.media_type, "stored_at": analyzed_at}
                await db.analyses.insert_one(audit_doc)
            except Exception as mongo_err:
                logger.warning(f"Audit log failed (non-fatal): {mongo_err}")

        return result

    except json.JSONDecodeError as e:
        return {"error": f"Failed to parse Claude response as JSON: {str(e)}"}
    except anthropic.AuthenticationError:
        return {"error": "Invalid Anthropic API key. Check your ANTHROPIC_API_KEY environment variable."}
    except anthropic.RateLimitError:
        return {"error": "Anthropic rate limit reached. Please wait a moment and try again."}
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return {"error": str(e)}


@api_router.get("/")
async def root():
    return {"message": "TSS Image Fraud Detector API v1.0"}


@api_router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "TSS Image Fraud Detector",
        "mongo": "connected" if mongo_enabled else "disabled"
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    if mongo_enabled:
        client.close()
