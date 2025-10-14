from django.urls import path
from . import views

app_name = 'student'

urlpatterns = [
    # CRUD operations
    path('', views.student_list, name='student-list'),
    path('/create', views.student_create, name='student-create'),
    path('/<uuid:id>', views.student_detail, name='student-detail'),
    path('/<uuid:id>/update', views.student_update, name='student-update'),
    path('/<uuid:id>/delete', views.student_delete, name='student-delete'),
    
    # Classroom-specific operations
    path('/classroom/<uuid:classroom_id>', views.students_by_classroom, name='students-by-classroom'),
    path('/my-classroom', views.students_of_my_classroom, name='students-of-my-classroom'),
    
    # Statistics
    path('/stats', views.student_stats, name='student-stats'),
    
    # Import operations
    path('/import', views.student_import_excel, name='student-import-excel'),
    path('/import/template', views.student_import_template, name='student-import-template'),
    
    # Behavior Record operations
    path('/behavior', views.behavior_record_list, name='behavior-record-list'),
    path('/behavior/stats', views.behavior_record_stats, name='behavior-record-stats'),
    path('/behavior/create', views.behavior_record_create, name='behavior-record-create'),
    path('/behavior/<uuid:id>', views.behavior_record_detail, name='behavior-record-detail'),
    path('/behavior/<uuid:id>/update', views.behavior_record_update, name='behavior-record-update'),
    path('/behavior/<uuid:id>/delete', views.behavior_record_delete, name='behavior-record-delete'),
] 