from django.urls import path
from .views import (
    GenerateReplyView, SendEmailView,
    ConversationListView, ConversationDetailView,
    DraftView, DraftDetailView, EmailHistoryView,
)

urlpatterns = [
    path('generate-reply/', GenerateReplyView.as_view()),
    path('send-email/', SendEmailView.as_view()),
    path('conversations/', ConversationListView.as_view()),
    path('conversations/<int:pk>/', ConversationDetailView.as_view()),
    path('drafts/', DraftView.as_view()),
    path('drafts/<int:pk>/', DraftDetailView.as_view()),
    path('history/', EmailHistoryView.as_view()),
]
