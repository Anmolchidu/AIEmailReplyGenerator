from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message, Draft, EmailHistory

User = get_user_model()

VALID_TONES = ['professional', 'friendly', 'formal', 'casual', 'apologetic', 'confident']
VALID_LENGTHS = ['short', 'medium', 'long']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'gmail_address', 'gmail_app_password']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            gmail_address=validated_data.get('gmail_address', ''),
            gmail_app_password=validated_data.get('gmail_app_password', ''),
        )


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'gmail_address']


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'gmail_address', 'gmail_app_password']


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
        fields = ['id', 'original_email', 'generated_reply', 'tone', 'subject', 'sent_to', 'created_at']
