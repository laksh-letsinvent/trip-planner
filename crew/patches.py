"""Workarounds for upstream CrewAI bugs that would otherwise block Groq.

Every fix here should note which CrewAI version it targets so it's easy to
delete once upstream catches up."""


def disable_prompt_cache_tagging() -> None:
    """CrewAI (as of 1.15.2) tags every LLM message with a `cache_breakpoint`
    key so 'native provider' classes (OpenAI, Anthropic, etc.) can turn it
    into their own prompt-caching syntax. Groq goes through the generic
    LiteLLM path instead, which forwards the untranslated key straight to
    Groq's API — and Groq's API rejects it with a 400
    ('cache_breakpoint is unsupported'). Prompt caching isn't something
    Groq's free tier needs anyway, so just stop tagging messages.
    Re-check on a crewai upgrade whether this is still necessary."""
    import crewai.llms.cache as cache_module

    def _no_op(message: dict) -> dict:
        return message

    cache_module.mark_cache_breakpoint = _no_op
