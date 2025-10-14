from django.urls import path
from . import views

urlpatterns = [
    # Event Type URLs
    path('/event-types', views.event_type_list, name='event_type_list'),
    path('/event-types/create', views.event_type_create, name='event_type_create'),
    path('/event-types/<uuid:pk>', views.event_type_detail, name='event_type_detail'),
    path('/event-types/<uuid:pk>/update', views.event_type_update, name='event_type_update'),
    path('/event-types/<uuid:pk>/delete', views.event_type_delete, name='event_type_delete'),

    # Event URLs
    path('', views.event_list, name='event_list'),
    path('/create', views.event_create, name='event_create'),
    path('/<int:pk>', views.event_detail, name='event_detail'),
    path('/<int:pk>/update', views.event_update, name='event_update'),
    path('/<int:pk>/delete', views.event_delete, name='event_delete'),
    path('/bulk_create', views.event_bulk_create, name='event_bulk_create'),
    path('/bulk_create_student', views.event_bulk_create_student, name='event_bulk_create_student'),
    path('/bulk_sync', views.events_bulk_sync, name='events_bulk_sync'),
    path('/bulk_approve', views.events_bulk_approve, name='events_bulk_approve'),
    path('/pending', views.events_pending, name='events_pending'),

    # Student Event Permission URLs
    path('/student-permissions', views.student_event_permissions_list, name='student_event_permissions_list'),
    path('/student-permissions/create', views.student_event_permission_create, name='student_event_permission_create'),
    path('/student-permissions/<uuid:pk>/update', views.student_event_permission_update, name='student_event_permission_update'),
    path('/student-permissions/<uuid:pk>/delete', views.student_event_permission_delete, name='student_event_permission_delete'),
    path('/student-permissions/check/<uuid:student_id>', views.check_student_event_permission, name='check_student_event_permission'),
    
    # Event Statistics and Reports (for school management)
    path('/statistics', views.event_statistics, name='event_statistics'),
    path('/export', views.event_export, name='event_export'),
] 