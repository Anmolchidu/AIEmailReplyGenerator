from django.db import models


class Conversation(models.Model):
    subject = models.CharField(max_length=255, default='No Subject')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.subject


class Message(models.Model):
    SENDER_CHOICES = [('user', 'User'), ('ai', 'AI')]
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']


class Draft(models.Model):
    subject = models.CharField(max_length=255, blank=True, default='')
    email_to = models.EmailField(blank=True, default='')
    content = models.TextField(blank=True, default='')
    tone = models.CharField(max_length=50, default='professional')
    saved_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-saved_at']


class EmailHistory(models.Model):
    original_email = models.TextField()
    generated_reply = models.TextField()
    tone = models.CharField(max_length=50)
    subject = models.CharField(max_length=255, blank=True, default='')
    sent_to = models.EmailField(blank=True, default='')
    gmail_address = models.EmailField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
