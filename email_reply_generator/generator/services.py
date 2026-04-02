import json
import logging
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
from google import genai
from google.genai import errors as genai_errors

logger = logging.getLogger('generator')


def strip_fences(text):
    """Remove markdown code fences from text."""
    text = re.sub(r'^```[a-z]*\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*```\s*$', '', text)
    return text.strip()


def build_prompt(current_email, tone, length, history_messages, user_name, signature):
    if signature.strip():
        sig_block = signature.strip()
    else:
        name = user_name.strip() or '[Your Name]'
        sig_block = 'Best regards,\n' + name

    length_guide = {
        'short': '2-4 lines',
        'medium': '5-8 lines',
        'long': '9-14 lines with explanation',
    }.get(length, '5-8 lines')

    history_text = 'No prior conversation.'
    if history_messages:
        parts = []
        for msg in history_messages[-5:]:
            label = 'User' if msg['sender'] == 'user' else 'AI'
            parts.append(label + ': ' + msg['content'])
        history_text = '\n'.join(parts)

    lines = [
        'You are an advanced context-aware email assistant.',
        'Return ONLY a valid JSON object. No markdown. No explanation. No code fences.',
        '',
        'INPUTS:',
        'Current Email: ' + current_email,
        'Conversation History (last 5 messages, oldest first):',
        history_text,
        'Tone: ' + tone,
        'Reply Length: ' + length + ' (' + length_guide + ')',
        'User Name: ' + (user_name.strip() or 'Not provided'),
        'Signature:',
        sig_block,
        '',
        'TASKS:',
        '1. replies array with exactly 3 strings:',
        '   [0] Direct and concise',
        '   [1] Balanced and detailed',
        '   [2] Friendly and expressive',
        '   Each must have greeting, body, closing, signature. Use ' + tone + ' tone, ' + length + ' length (' + length_guide + ').',
        '2. subject: relevant subject line string',
        '3. summary.key_points: array of strings',
        '4. summary.action_items: array of strings',
        '5. summary.deadlines: array of strings (empty if none)',
        '6. intent: one of [Request, Complaint, Follow-up, Inquiry, Information]',
        '7. emotion: one of [Angry, Neutral, Happy, Urgent]',
        '8. priority: one of [High, Medium, Low]',
        '9. suggestions.attachment: string or null',
        '10. suggestions.follow_up: string or null',
        '11. suggestions.clarification: string or null',
        '',
        'Return ONLY this JSON, nothing else:',
        '{"subject":"","replies":["","",""],"summary":{"key_points":[],"action_items":[],"deadlines":[]},"intent":"","emotion":"","priority":"","suggestions":{"attachment":null,"follow_up":null,"clarification":null}}',
    ]
    return '\n'.join(lines)


def generate_email_reply(current_email, tone, length='medium',
                         history_messages=None, user_name='', signature=''):
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError('Gemini API key is not configured.')

    client = genai.Client(api_key=api_key)
    prompt = build_prompt(current_email, tone, length, history_messages or [], user_name, signature)

    logger.debug('Gemini request | tone=%s length=%s', tone, length)

    raw = ''
    try:
        response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        raw = response.text.strip()
        logger.debug('Gemini raw (500): %s', raw[:500])
        result = json.loads(strip_fences(raw))
        logger.info('Gemini reply generated | tone=%s length=%s', tone, length)
        return result
    except json.JSONDecodeError as e:
        logger.error('JSON parse error: %s | raw: %s', e, raw[:300])
        raise RuntimeError('AI returned an invalid response. Please try again.')
    except genai_errors.APIError as e:
        logger.error('Gemini API error: %s', e)
        raise RuntimeError('AI service error: ' + str(e))
    except Exception as e:
        logger.error('Unexpected error in generate_email_reply: %s', e)
        raise RuntimeError('AI service error: ' + str(e))


def send_gmail(gmail_address, app_password, to, subject, body):
    """
    Send email via Gmail SMTP.
    Tries SSL on port 465 first, falls back to STARTTLS on port 587.
    """
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = gmail_address
    msg['To'] = to
    msg.attach(MIMEText(body, 'plain', 'utf-8'))

    raw_password = app_password.replace(' ', '')  # strip spaces from app password

    logger.debug('Attempting Gmail send from %s to %s', gmail_address, to)

    # Try SSL (port 465) first
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=15) as server:
            server.login(gmail_address, raw_password)
            server.sendmail(gmail_address, [to], msg.as_string())
        logger.info('Email sent (SSL) from %s to %s', gmail_address, to)
        return
    except smtplib.SMTPAuthenticationError as e:
        logger.error('SMTP auth error (SSL): %s', e)
        raise RuntimeError(
            'Gmail authentication failed. Make sure you are using an App Password '
            '(not your regular Gmail password). '
            'Go to Settings to update your credentials.'
        )
    except Exception as e:
        logger.warning('SSL send failed, trying STARTTLS: %s', e)

    # Fallback: STARTTLS (port 587)
    try:
        with smtplib.SMTP('smtp.gmail.com', 587, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(gmail_address, raw_password)
            server.sendmail(gmail_address, [to], msg.as_string())
        logger.info('Email sent (STARTTLS) from %s to %s', gmail_address, to)
        return
    except smtplib.SMTPAuthenticationError as e:
        logger.error('SMTP auth error (STARTTLS): %s', e)
        raise RuntimeError(
            'Gmail authentication failed. Make sure you are using an App Password '
            '(not your regular Gmail password). '
            'Go to Settings to update your credentials.'
        )
    except smtplib.SMTPException as e:
        logger.error('SMTP error (STARTTLS): %s', e)
        raise RuntimeError('Failed to send email: ' + str(e))
    except Exception as e:
        logger.error('Unexpected send error: %s', e)
        raise RuntimeError('Failed to send email: ' + str(e))
