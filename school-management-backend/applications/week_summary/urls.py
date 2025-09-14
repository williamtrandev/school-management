from django.urls import path
from . import views

app_name = 'week_summary'

urlpatterns = [
    # Week Summary CRUD
    path('', views.week_summary_list, name='week-summary-list'),
    path('<uuid:id>/', views.week_summary_detail, name='week-summary-detail'),
    path('<uuid:id>/approve/', views.week_summary_approve, name='week-summary-approve'),
    
    # Dashboard rankings
    path('dashboard/rankings/', views.dashboard_rankings, name='dashboard-rankings'),
] 