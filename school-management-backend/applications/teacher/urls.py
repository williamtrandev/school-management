from django.urls import path
from . import views

app_name = 'teacher'

urlpatterns = [
    # CRUD operations
    path('', views.teacher_list, name='teacher-list'),
    path('/create', views.teacher_create, name='teacher-create'),
    path('/<uuid:id>', views.teacher_detail, name='teacher-detail'),
    path('/<uuid:id>/update', views.teacher_update, name='teacher-update'),
    path('/<uuid:id>/delete', views.teacher_delete, name='teacher-delete'),
    
    # Statistics
    path('/stats', views.teacher_stats, name='teacher-stats'),
    
    # Import operations
    path('/import', views.teacher_import_excel, name='teacher-import-excel'),
    path('/import/template', views.teacher_import_template, name='teacher-import-template'),
] 