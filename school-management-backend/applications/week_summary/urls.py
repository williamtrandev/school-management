from django.urls import path
from . import views

app_name = 'week_summary'

urlpatterns = [
    # Week Summary CRUD
    path('', views.week_summary_list, name='week-summary-list'),
    path('<uuid:id>', views.week_summary_detail, name='week-summary-detail'),
    path('<uuid:id>/approve', views.week_summary_approve, name='week-summary-approve'),
    
    # Rankings API
    path('/dashboard/rankings', views.dashboard_rankings, name='dashboard-rankings'),
    path('/rankings', views.class_rankings, name='class-rankings'),
    path('/rankings/realtime', views.realtime_rankings, name='realtime-rankings'),
    path('/rankings/monthly', views.monthly_rankings, name='monthly-rankings'),
    path('/rankings/yearly', views.yearly_rankings, name='yearly-rankings'),
    path('/top-performers', views.top_performers, name='top-performers'),
    
    # Removed generation endpoints - using real-time computation
    
    # Test API to check data
    path('/test-data', views.test_rankings_data, name='test-rankings-data'),
] 