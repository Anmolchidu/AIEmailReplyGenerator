from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, ProfileView,
    GenerateReplyView, SendEmailView,
    ConversationListView, ConversationDetailView,
    DraftView, DraftDetailView, EmailHistoryView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('auth/profile/', ProfileView.as_view()),
    path('generate-reply/', GenerateReplyView.as_view()),
    path('send-email/', SendEmailView.as_view()),
    path('conversations/', ConversationListView.as_view()),
    path('conversations/<int:pk>/', ConversationDetailView.as_view()),
    path('drafts/', DraftView.as_view()),
    path('drafts/<int:pk>/', DraftDetailView.as_view()),
    path('history/', EmailHistoryView.as_view()),
]
