from rest_framework import serializers
from .models import Conversation, Message, Draft, EmailHistory

VALID_TONES = ['professional', 'friendly', 'formal', 'casual', 'apologetic', 'confident']
VALID_LENGTHS = ['short', 'medium', 'long']


class GenerateReplySerializer(serializers.Serializer):
    current_email = serializers.CharField(min_length=10, max_length=5000)
    conversation_id = serializers.IntegerField(required=False, allow_null=True)
    tone = serializers.ChoiceField(choices=VALID_TONES, default='professional')
    length = serializers.ChoiceField(choices=VALID_LENGTHS, default='medium')
    user_name = serializers.CharField(required=False, allow_blank=True, default='')
    signature = serializers.CharField(required=False, allow_blank=True, default='')


class SendEmailSerializer(serializers.Serializer):
    to = serializers.EmailField()
    subject = serializers.CharField(max_length=255)
    message = serializers.CharField()
    gmail_address = serializers.EmailField()
    gmail_app_password = serializers.CharField()
    conversation_id = serializers.IntegerField(required=False, allow_null=True)
    original_email = serializers.CharField(required=False, allow_blank=True, default='')
    tone = serializers.CharField(required=False, default='professional')


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'timestamp']


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'subject', 'created_at', 'updated_at', 'messages', 'last_message']

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return msg.content[:80] if msg else ''


class ConversationCreateSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=255, default='No Subject')


class DraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Draft
        fields = ['id', 'subject', 'email_to', 'content', 'tone', 'saved_at']
        read_only_fields = ['saved_at']


class EmailHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailHistory
        fields = ['id', 'original_email', 'generated_reply', 'tone', 'subject', 'sent_to', 'gmail_address', 'created_at']
