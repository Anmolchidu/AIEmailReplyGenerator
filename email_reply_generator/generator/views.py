import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .serializers import (
    RegisterSerializer, UserProfileSerializer, UpdateProfileSerializer,
    GenerateReplySerializer, SendEmailSerializer,
    ConversationSerializer, ConversationCreateSerializer,
    DraftSerializer, EmailHistorySerializer,
)
from .models import Conversation, Message, Draft, EmailHistory
from .services import generate_email_reply, send_gmail

logger = logging.getLogger('generator')

User = get_user_model()


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        if not s.is_valid():
            first = next(iter(s.errors.values()))[0]
            return Response({'error': str(first)}, status=400)
        user = s.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data,
        }, status=201)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')
        user = authenticate(username=username, password=password)
        if not user:
            return Response({'error': 'Invalid username or password.'}, status=401)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserProfileSerializer(user).data,
        })


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def patch(self, request):
        s = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        if not s.is_valid():
            return Response(s.errors, status=400)
        s.save()
        return Response(UserProfileSerializer(request.user).data)


# ── AI Generate ───────────────────────────────────────────────────────────────

class GenerateReplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = GenerateReplySerializer(data=request.data)
        if not s.is_valid():
            first = next(iter(s.errors.values()))[0]
            return Response({'success': False, 'error': str(first)}, status=400)

        d = s.validated_data
        history = []
        conversation = None

        conv_id = d.get('conversation_id')
        if conv_id:
            try:
                conversation = Conversation.objects.get(id=conv_id, user=request.user)
                msgs = conversation.messages.order_by('-timestamp')[:5]
                history = [{'sender': m.sender, 'content': m.content} for m in reversed(msgs)]
            except Conversation.DoesNotExist:
                pass

        try:
            result = generate_email_reply(
                current_email=d['current_email'],
                tone=d['tone'],
                length=d['length'],
                history_messages=history,
                user_name=d.get('user_name') or request.user.username,
                signature=d.get('signature', ''),
            )
        except (ValueError, RuntimeError) as e:
            return Response({'success': False, 'error': str(e)}, status=502)
        except Exception:
            logger.exception('Unexpected error in GenerateReplyView')
            return Response({'success': False, 'error': 'Unexpected error.'}, status=500)

        if conversation:
            Message.objects.create(conversation=conversation, sender='user', content=d['current_email'])
            if result.get('replies'):
                Message.objects.create(conversation=conversation, sender='ai', content=result['replies'][0])
            conversation.save()

        return Response({'success': True, 'data': result})


# ── Send Email ────────────────────────────────────────────────────────────────

class SendEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = SendEmailSerializer(data=request.data)
        if not s.is_valid():
            first = next(iter(s.errors.values()))[0]
            return Response({'error': str(first)}, status=400)

        d = s.validated_data
        user = request.user

        if not user.gmail_address or not user.gmail_app_password:
            return Response(
                {'error': 'Gmail credentials not configured. Go to Settings to add them.'},
                status=400
            )

        try:
            send_gmail(user.gmail_address, user.gmail_app_password, d['to'], d['subject'], d['message'])
        except RuntimeError as e:
            return Response({'error': str(e)}, status=502)

        EmailHistory.objects.create(
            user=user,
            original_email=d.get('original_email', ''),
            generated_reply=d['message'],
            tone=d.get('tone', 'professional'),
            subject=d['subject'],
            sent_to=d['to'],
        )

        conv_id = d.get('conversation_id')
        if conv_id:
            try:
                conv = Conversation.objects.get(id=conv_id, user=user)
                Message.objects.create(conversation=conv, sender='user', content=d['message'])
                conv.save()
            except Conversation.DoesNotExist:
                pass

        return Response({'success': True, 'message': 'Email sent successfully.'})


# ── Conversations ─────────────────────────────────────────────────────────────

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        convs = Conversation.objects.filter(user=request.user)
        return Response(ConversationSerializer(convs, many=True).data)

    def post(self, request):
        s = ConversationCreateSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=400)
        conv = Conversation.objects.create(user=request.user, subject=s.validated_data['subject'])
        return Response(ConversationSerializer(conv).data, status=201)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            conv = Conversation.objects.get(id=pk, user=request.user)
        except Conversation.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        return Response(ConversationSerializer(conv).data)

    def delete(self, request, pk):
        try:
            Conversation.objects.get(id=pk, user=request.user).delete()
        except Conversation.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        return Response(status=204)


# ── Drafts ────────────────────────────────────────────────────────────────────

class DraftView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(DraftSerializer(Draft.objects.filter(user=request.user), many=True).data)

    def post(self, request):
        s = DraftSerializer(data=request.data)
        if not s.is_valid():
            return Response(s.errors, status=400)
        draft = s.save(user=request.user)
        return Response(DraftSerializer(draft).data, status=201)


class DraftDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            draft = Draft.objects.get(id=pk, user=request.user)
        except Draft.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        s = DraftSerializer(draft, data=request.data, partial=True)
        if not s.is_valid():
            return Response(s.errors, status=400)
        s.save()
        return Response(DraftSerializer(draft).data)

    def delete(self, request, pk):
        try:
            Draft.objects.get(id=pk, user=request.user).delete()
        except Draft.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)
        return Response(status=204)


# ── History ───────────────────────────────────────────────────────────────────

class EmailHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(EmailHistorySerializer(
            EmailHistory.objects.filter(user=request.user), many=True
        ).data)
