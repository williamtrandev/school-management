from django.urls import path
from . import views

app_name = 'classroom'

urlpatterns = [
    # CRUD operations
    path('', views.classroom_list, name='classroom-list'),
    path('/create', views.classroom_create, name='classroom-create'),
    path('/<uuid:id>', views.classroom_detail, name='classroom-detail'),
    path('/<uuid:id>/update', views.classroom_update, name='classroom-update'),
    path('/<uuid:id>/delete', views.classroom_delete, name='classroom-delete'),
    
    # Additional endpoints
    path('/grades', views.get_grades, name='grades'),
    path('/teachers', views.get_teachers, name='teachers'),
    path('/stats', views.get_classroom_stats, name='classroom-stats'),
] 