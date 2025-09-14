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
    path('/<uuid:pk>', views.event_detail, name='event_detail'),
    path('/<uuid:pk>/update', views.event_update, name='event_update'),
    path('/<uuid:pk>/delete', views.event_delete, name='event_delete'),
    path('/bulk_create', views.event_bulk_create, name='event_bulk_create'),
] 