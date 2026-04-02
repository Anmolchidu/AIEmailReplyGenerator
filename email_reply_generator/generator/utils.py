def sanitize_email_content(text: str) -> str:
    """Strip excessive whitespace while preserving paragraph structure."""
    lines = text.splitlines()
    cleaned = [line.strip() for line in lines]
    return '\n'.join(cleaned).strip()


def truncate_text(text: str, max_length: int = 5000) -> str:
    if len(text) > max_length:
        return text[:max_length]
    return text
