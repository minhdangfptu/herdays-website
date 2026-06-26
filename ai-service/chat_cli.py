import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path


DEFAULT_AI_SERVICE_URL = "http://localhost:8090/"
DEFAULT_CONTEXT = {
    "sessionType": "guest",
    "targetStatus": None,
    "ageGroup": None,
    "personalizationConsent": False,
    "quizSummary": None,
}


def load_dotenv(path: Path) -> None:
    if not path.exists():
        return

    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue

        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def build_url(base_url: str) -> str:
    normalized = base_url.rstrip("/") + "/"
    return normalized + "v1/chat/respond"


def post_json(url: str, token: str | None, payload: dict) -> dict:
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    if token:
        headers["X-Service-Token"] = token

    request = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code}: {body}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"Cannot connect to AI service: {error.reason}") from error


def print_response(response: dict) -> None:
    print("\nHERDAYs:")
    print(response.get("answer", "(empty answer)"))

    safety = response.get("safety") or {}
    print(f"\nSafety: {safety.get('level', 'unknown')}")

    citations = response.get("citations") or []
    if citations:
        print("\nCitations:")
        for citation in citations:
            title = citation.get("title") or citation.get("sourceId")
            url = citation.get("url")
            print(f"- {title}{f' ({url})' if url else ''}")

    products = response.get("recommendedProducts") or []
    if products:
        print("\nProducts:")
        for product in products:
            print(f"- {product.get('title')}: {product.get('reason')}")

    ctas = response.get("ctas") or []
    if ctas:
        print("\nCTAs:")
        for cta in ctas:
            label = cta.get("label")
            url = cta.get("url")
            print(f"- {label}{f': {url}' if url else ''}")

    print("")


def parse_context_args(args: argparse.Namespace) -> dict:
    context = DEFAULT_CONTEXT.copy()
    context["targetStatus"] = args.target_status
    context["ageGroup"] = args.age_group
    context["personalizationConsent"] = args.personalization_consent

    if args.quiz_summary:
        try:
            context["quizSummary"] = json.loads(args.quiz_summary)
        except json.JSONDecodeError as error:
            raise SystemExit(f"Invalid --quiz-summary JSON: {error}") from error

    return context


def build_payload(
    message: str,
    history: list[dict],
    context: dict,
    conversation_id: str | None,
) -> dict:
    return {
        "conversationId": conversation_id,
        "userMessage": message,
        "language": "vi",
        "userContext": context,
        "history": history[-12:],
        "knowledgeFilters": {
            "targetStatuses": [context["targetStatus"]] if context.get("targetStatus") else [],
            "tags": [],
            "limit": 5,
        },
        "productCandidates": [],
    }


def run_chat(args: argparse.Namespace) -> int:
    load_dotenv(Path(__file__).resolve().parent / ".env")

    base_url = args.url or os.getenv("AI_SERVICE_URL") or DEFAULT_AI_SERVICE_URL
    token = args.token if args.token is not None else os.getenv("SERVICE_TOKEN")
    url = build_url(base_url)
    context = parse_context_args(args)
    history: list[dict] = []

    print("HERDAYs chatbot CLI")
    print(f"Endpoint: {url}")
    print("Type /exit to quit, /reset to clear local history.\n")

    while True:
        try:
            message = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye.")
            return 0

        if not message:
            continue

        if message in {"/exit", "/quit"}:
            print("Bye.")
            return 0

        if message == "/reset":
            history.clear()
            print("History cleared.\n")
            continue

        payload = build_payload(message, history, context, args.conversation_id)

        try:
            response = post_json(url, token, payload)
        except RuntimeError as error:
            print(f"\nError: {error}\n", file=sys.stderr)
            continue

        print_response(response)

        answer = response.get("answer")
        history.append({"role": "user", "content": message})
        if answer:
            history.append({"role": "assistant", "content": answer})


def main() -> int:
    parser = argparse.ArgumentParser(description="Test HERDAYs AI chatbot behavior from CLI.")
    parser.add_argument("--url", help="AI service base URL. Default: http://localhost:8090/")
    parser.add_argument("--token", help="Service token. Default: SERVICE_TOKEN from ai-service/.env")
    parser.add_argument("--conversation-id", help="Optional conversation id passed to the AI service.")
    parser.add_argument("--target-status", help="Optional target status, for example cycle, pregnancy, ivf.")
    parser.add_argument("--age-group", help="Optional age group, for example 25-34.")
    parser.add_argument(
        "--personalization-consent",
        action="store_true",
        help="Send personalizationConsent=true.",
    )
    parser.add_argument(
        "--quiz-summary",
        help='Sanitized quiz summary JSON, for example {"goal":"cycle tracking"}.',
    )

    return run_chat(parser.parse_args())


if __name__ == "__main__":
    raise SystemExit(main())

