from django.db import models
import uuid


class WeekSummary(models.Model):
    """Tổng hợp điểm thi đua theo tuần"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    classroom = models.ForeignKey('classroom.Classroom', on_delete=models.CASCADE, related_name='week_summaries')
    week_number = models.IntegerField()  # Số tuần trong năm
    year = models.IntegerField()  # Năm học
    positive_points = models.IntegerField(default=0)  # Tổng điểm cộng
    negative_points = models.IntegerField(default=0)  # Tổng điểm trừ
    total_points = models.IntegerField(default=0)  # Tổng điểm
    rank = models.IntegerField(null=True, blank=True)  # Xếp hạng
    is_approved = models.BooleanField(default=False)  # Đã duyệt chưa
    approved_by = models.ForeignKey(
        'user_management.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='approved_summaries',
        limit_choices_to={'role__in': ['admin', 'teacher']}
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'week_summaries'
        verbose_name = 'Tổng hợp tuần'
        verbose_name_plural = 'Tổng hợp tuần'
        unique_together = ['classroom', 'week_number', 'year']
        ordering = ['-year', '-week_number', 'rank']

    def __str__(self):
        return f"{self.classroom.full_name} - Tuần {self.week_number}/{self.year}"

    def save(self, *args, **kwargs):
        # Tự động tính tổng điểm
        self.total_points = self.positive_points - self.negative_points
        super().save(*args, **kwargs) 