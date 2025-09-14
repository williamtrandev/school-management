from django.urls import path, include

urlpatterns = [
    # User Management app
    path('/', include('applications.user_management.urls')),
    
    # Event app
    path('/events', include('applications.event.urls')),
    
    # Classroom app
    path('/classrooms', include('applications.classroom.urls')),
    
    # Week Summary app
    path('/week-summaries', include('applications.week_summary.urls')),
    
    # Student app
    path('/students', include('applications.student.urls')),
    
    # Teacher app
    path('/teachers', include('applications.teacher.urls')),
    # path('api/', include('applications.grade.urls')),
    # path('api/', include('applications.notification.urls')),
    # path('api/', include('applications.point_rule.urls')),
] 