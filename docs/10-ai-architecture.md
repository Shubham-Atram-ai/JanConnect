# AI Architecture

The system utilizes AI strictly as an assistive layer. AI decisions are never final, irreversible, or capable of bypassing human review.

## 1. Speech-to-Text (ASR)
- **Input:** Raw audio (`.webm`/`.opus`) from the citizen's browser.
- **Provider:** Whisper (Self-hosted) as default, Bhashini pluggable via environment variables.
- **Output:** Transcript string + detected language + confidence score.
- **Error Handling:** Client-side fallback to standard text input if recording fails or transcription times out. Original audio is permanently retained.

## 2. Translation
- **Input:** Transcript in local language.
- **Provider:** Bhashini (if enabled) or mocked pass-through.
- **Output:** Translated working text (e.g., English).

## 3. Intelligence / Extraction (LLM)
- **Input:** Translated text. Passed explicitly as "data to be classified", protected against prompt injection.
- **Provider:** Hosted LLM (e.g., Gemini, OpenAI) utilizing Structured Output (JSON mode).
- **Output:** JSON matching a strict Zod schema: `title`, `summary`, `domain`, `subdomain`, `problem_type`, `required_skills`, `priority_suggestion`.
- **Confidence Handling:**
  - `Confidence < 0.5`: Fields left entirely blank. Citizen must manually enter.
  - `Confidence 0.5 - 0.75`: Badge shown as "Medium confidence, please review".
  - `Overall Confidence < 0.6`: Prevents Government Admin from quick-approving; forces full manual review.
- **Fallback:** Rule-based keyword matching if the LLM API fails or times out.

## 4. Semantic Deduplication (Embeddings)
- **Input:** Challenge title + summary.
- **Provider:** Sentence Embedding model.
- **Storage:** `vector(384)` in PostgreSQL via `pgvector`.
- **Processing:** Added to the deterministic deduplication formula (Domain match + Location Proximity + Temporal similarity + Embeddings). Never auto-merges; only flags for human review.

## Human-in-the-Loop Constraints
- Citizens can overwrite the AI's pre-filled form before submission.
- Government Admins review the form, check duplicate suggestions, and finalize priority. Priority is computed by a deterministic formula, using the AI's `priority_suggestion` as only one weighted input.
