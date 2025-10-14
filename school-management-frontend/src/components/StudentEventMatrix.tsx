import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Classroom, EventCreateRequest, EventType, Student } from '@/services/api';
import { getScoreForLessonRating, getScoreForPointColumn } from '@/lib/scoring';
import { CalendarDays, Users, CheckSquare, Upload, Clock, Plus, X } from 'lucide-react';

type PointColumnKey = 'p10' | 'p9' | 'p8' | 'p4' | 'p3' | 'p2_or_less' | 'debt' | 'no_lesson';
type LessonRatingKey = 'good' | 'fair' | 'average' | 'weak' | 'poor';

// Class-level violations (per occurrence, no student)
type ViolationClassKey =
  | 'skipPeriod'
  | 'notFocused'
  | 'reportWritten'
  | 'noisyClass'
  | 'swearing'
  | 'absenceNoPermission'
  | 'late'
  | 'noSchoolCampaign'
  | 'fighting'
  | 'phoneInClass'
  | 'lateGathering'
  | 'publicProperty'
  | 'eatingDrinkingColor'
  | 'leaveWithoutPermission'
  | 'noClassCleaning'
  | 'trashDelayDirty';

// Per-student attire violations
type AttireViolationKey = 'dressUniform' | 'noProperShoes' | 'hairOrDyed' | 'noNameTag';

// Per-student general violations (non-attire)
type StudentGeneralViolationKey =
  | 'skipPeriod'
  | 'notFocused'
  | 'reportWritten'
  | 'swearing'
  | 'absenceNoPermission'
  | 'late'
  | 'fighting'
  | 'phoneInClass'
  | 'eatingDrinkingColor'
  | 'leaveWithoutPermission';

type StudentViolationKey = AttireViolationKey | StudentGeneralViolationKey;

interface PointColumnConfig {
  key: PointColumnKey;
  label: string;
}

interface LessonRatingConfig {
  key: LessonRatingKey;
  label: string;
}

interface ViolationClassConfig {
  key: ViolationClassKey;
  label: string;
}

interface AttireViolationConfig {
  key: AttireViolationKey;
  label: string;
}

interface StudentViolationConfig {
  key: StudentViolationKey;
  label: string;
}

const POINT_COLUMNS: PointColumnConfig[] = [
  { key: 'p10', label: 'Điểm 10' },
  { key: 'p9', label: 'Điểm 9' },
  { key: 'p8', label: 'Điểm 8' },
  { key: 'p4', label: 'Điểm 4' },
  { key: 'p3', label: 'Điểm 3' },
  { key: 'p2_or_less', label: 'Điểm 2 trở xuống' },
  { key: 'debt', label: 'Điểm nợ' },
  { key: 'no_lesson', label: 'Không thuộc bài' },
];

const LESSON_RATINGS: LessonRatingConfig[] = [
  { key: 'good', label: 'Tiết tốt' },
  { key: 'fair', label: 'Tiết khá' },
  { key: 'average', label: 'Tiết trung bình' },
  { key: 'weak', label: 'Tiết yếu' },
  { key: 'poor', label: 'Tiết kém' },
];

// Class-level counters (remaining after moving some to per-student)
const VIOLATION_CLASS: ViolationClassConfig[] = [
  { key: 'noSchoolCampaign', label: 'Không tham gia phong trào trường' },
  { key: 'noisyClass', label: 'Mất trật tự / lớp ồn' },
  { key: 'lateGathering', label: 'Tập trung trễ (chào cờ, lễ, ngoại khoá)' },
  { key: 'publicProperty', label: 'Vi phạm của công' },
  { key: 'noClassCleaning', label: 'Không vệ sinh lớp (ngày)' },
  { key: 'trashDelayDirty', label: 'Không đổ rác / vệ sinh chậm / hành lang dơ' },
];

const ATTIRE_VIOLATIONS: AttireViolationConfig[] = [
  { key: 'dressUniform', label: 'Áo/quần không đúng quy định' },
  { key: 'noProperShoes', label: 'Không mang giày/dép có quai hậu' },
  { key: 'hairOrDyed', label: 'Tóc dài (nam), nhuộm màu' },
  { key: 'noNameTag', label: 'Không bảng tên' },
];

const STUDENT_GENERAL_VIOLATIONS: StudentViolationConfig[] = [
  { key: 'skipPeriod', label: 'Cúp tiết' },
  { key: 'notFocused', label: 'Không tập trung vào lớp' },
  { key: 'reportWritten', label: 'Vi phạm bị lập biên bản' },
  { key: 'swearing', label: 'Nói tục / chửi thề' },
  { key: 'absenceNoPermission', label: 'Nghỉ không phép' },
  { key: 'late', label: 'Đi trễ' },
  { key: 'fighting', label: 'Đánh nhau' },
  { key: 'phoneInClass', label: 'Dùng điện thoại trong giờ' },
  { key: 'eatingDrinkingColor', label: 'Ăn vụn / mang nước phẩm màu' },
  { key: 'leaveWithoutPermission', label: 'Tự ý ra ngoài không xin phép' },
];

interface StudentEventMatrixProps {
  onSubmitted?: () => void;
  initialDate?: string;
  initialClassroomId?: string;
  isEditMode?: boolean;
  isViewMode?: boolean;
  onSave?: () => void;
}

export default function StudentEventMatrix({ 
  onSubmitted, 
  initialDate, 
  initialClassroomId, 
  isEditMode = false, 
  isViewMode = false,
  onSave 
}: StudentEventMatrixProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [date, setDate] = useState<string>(initialDate || new Date().toISOString().split('T')[0]);
  const [classroomId, setClassroomId] = useState<string>(initialClassroomId || '');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [completedPeriods, setCompletedPeriods] = useState<Set<number>>(new Set());
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [editPeriod, setEditPeriod] = useState<number | null>(null); // null = không edit, number = đang edit tiết nào
  const [existingEvents, setExistingEvents] = useState<any[]>([]); // Events đã có trong database
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [hasExistingStudentEvents, setHasExistingStudentEvents] = useState(false);

  // No manual type mapping needed per column; we'll auto-map by EventType name

  // Count inputs for point columns
  const PERIODS: number[] = [1,2,3,4,5,6,7];
  const [activePeriod, setActivePeriod] = useState<number>(1);

  const getPeriodLabel = (p: number): string => {
    const map: Record<number, string> = {
      1: 'Tiết 1 Sáng',
      2: 'Tiết 2 Sáng',
      3: 'Tiết 3 Sáng',
      4: 'Tiết 4 Sáng',
      5: 'Tiết 1 Chiều',
      6: 'Tiết 2 Chiều',
      7: 'Tiết 3 Chiều',
    };
    return map[p] || `Tiết ${p}`;
  };

  // No explicit counts; we derive count from selected student rows per column

  // Selected students for each point column (array length == count)
  // Per-period selected students for each column
  const [pointSelectedStudentsByPeriod, setPointSelectedStudentsByPeriod] = useState<Record<number, Record<PointColumnKey, (string | undefined)[]>>>(() => {
    const base = { p10: [], p9: [], p8: [], p4: [], p3: [], p2_or_less: [], debt: [], no_lesson: [] as (string|undefined)[] } as Record<PointColumnKey, (string|undefined)[]>;
    return PERIODS.reduce((acc, p) => ({ ...acc, [p]: { ...base, p10: [], p9: [], p8: [], p4: [], p3: [], p2_or_less: [], debt: [], no_lesson: [] } }), {} as Record<number, Record<PointColumnKey, (string|undefined)[]>>);
  });

  // Notes per period for Điểm 10 rows (aligned by row index)
  const [p10NotesByPeriod, setP10NotesByPeriod] = useState<Record<number, string[]>>(() => {
    return PERIODS.reduce((acc, p) => ({ ...acc, [p]: [] as string[] }), {} as Record<number, string[]>);
  });

  // Lesson ratings toggles
  const [lessonSelectedByPeriod, setLessonSelectedByPeriod] = useState<Record<number, Record<LessonRatingKey, boolean>>>(() => {
    const base = { good: false, fair: false, average: false, weak: false, poor: false };
    return PERIODS.reduce((acc, p) => ({ ...acc, [p]: { ...base } }), {} as Record<number, Record<LessonRatingKey, boolean>>);
  });

  // No manual type mapping for lesson rating; we'll auto-map by EventType name

  // Class-level violations counters per period
  const [classViolationsByPeriod, setClassViolationsByPeriod] = useState<Record<number, Record<ViolationClassKey, number>>>(() => {
    const base = VIOLATION_CLASS.reduce((m, v) => ({ ...m, [v.key]: 0 }), {} as Record<ViolationClassKey, number>);
    return PERIODS.reduce((acc, p) => ({ ...acc, [p]: { ...base } }), {} as Record<number, Record<ViolationClassKey, number>>);
  });

  // Per-student attire violations per period
  const [studentViolationsByPeriod, setStudentViolationsByPeriod] = useState<Record<number, { studentId?: string; violation: StudentViolationKey }[]>>(() => {
    return PERIODS.reduce((acc, p) => ({ ...acc, [p]: [] }), {} as Record<number, { studentId?: string; violation: StudentViolationKey }[]>);
  });

  const classroomOptions = useMemo(() => classrooms, [classrooms]);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        // Load all data in parallel to reduce API calls
        const [types, studentResp, classrooms] = await Promise.all([
          apiService.getEventTypes(),
          user?.role === 'student' ? apiService.getMyClassroomStudents() : Promise.resolve(null),
          user?.role !== 'student' ? apiService.getClassrooms() : Promise.resolve([])
        ]);
        
        setEventTypes(types);
        
        if (user?.role === 'student' && studentResp) {
          setClassrooms([studentResp.classroom]);
          setStudents(studentResp.students || []);
          setClassroomId(studentResp.classroom.id);
        } else if (user?.role !== 'student' && classrooms.length > 0) {
          setClassrooms(classrooms);
          if (!classroomId) setClassroomId(classrooms[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  // Students are already loaded in main useEffect, no need for separate API call

  // Load existing events when date or classroom changes
  useEffect(() => {
    if (classroomId && date) {
      loadExistingEvents();
    }
  }, [classroomId, date]);

  // For teacher/admin: load students of selected classroom so names render correctly
  useEffect(() => {
    const loadClassroomStudents = async () => {
      if (!classroomId) return;
      if (user?.role === 'student') return;
      try {
        const resp = await apiService.getStudentsByClassroom(classroomId);
        setStudents(resp.students || []);
      } catch (e) {
        console.error('Failed to load classroom students', e);
      }
    };
    loadClassroomStudents();
  }, [classroomId, user?.role]);

  // Auto-load existing data when in edit mode
  useEffect(() => {
    if (editPeriod && classroomId && date) {
      loadExistingEvents();
    }
  }, [editPeriod, classroomId, date]);

  const addStudentRow = (key: PointColumnKey) => {
    setPointSelectedStudentsByPeriod(prev => {
      const current = prev[activePeriod] || {} as Record<PointColumnKey, (string|undefined)[]>;
      const arr = current[key] || [];
      return { ...prev, [activePeriod]: { ...current, [key]: [...arr, undefined] } };
    });
    if (key === 'p10') {
      setP10NotesByPeriod(prev => {
        const curr = prev[activePeriod] || [];
        return { ...prev, [activePeriod]: [...curr, ''] };
      });
    }
  };

  const handleSelectStudent = (key: PointColumnKey, index: number, studentId: string | undefined) => {
    setPointSelectedStudentsByPeriod(prev => {
      const current = prev[activePeriod] || {} as Record<PointColumnKey, (string|undefined)[]>;
      const arr = [...(current[key] || [])];
      arr[index] = studentId;
      return { ...prev, [activePeriod]: { ...current, [key]: arr } };
    });
  };

  const removeStudentRow = (key: PointColumnKey, index: number) => {
    setPointSelectedStudentsByPeriod(prev => {
      const current = prev[activePeriod] || {} as Record<PointColumnKey, (string|undefined)[]>;
      const arr = [...(current[key] || [])];
      arr.splice(index, 1);
      return { ...prev, [activePeriod]: { ...current, [key]: arr } };
    });
    if (key === 'p10') {
      setP10NotesByPeriod(prev => {
        const arr = [...(prev[activePeriod] || [])];
        arr.splice(index, 1);
        return { ...prev, [activePeriod]: arr };
      });
    }
  };

  const getSelectedEventType = (id?: string) => eventTypes.find(t => String(t.id) === String(id));

  // Helper: map point columns to EventType by name keywords
  const findEventTypeForPointColumn = (key: PointColumnKey): EventType | undefined => {
    const nameMap: Record<PointColumnKey, string[]> = {
      p10: ['Điểm 10', 'Diem 10', 'Point 10'],
      p9: ['Điểm 9', 'Diem 9', 'Point 9'],
      p8: ['Điểm 8', 'Diem 8', 'Point 8'],
      p4: ['Điểm 4', 'Diem 4', 'Point 4'],
      p3: ['Điểm 3', 'Diem 3', 'Point 3'],
      p2_or_less: ['Điểm 2', 'Điểm 1', 'Điểm 0', 'Diem 2', 'Diem 1', 'Diem 0', 'Point 2', 'Point 1', 'Point 0', '2 trở xuống'],
      debt: ['Điểm nợ', 'No bai', 'Nợ bài', 'Missing homework'],
      no_lesson: ['Không thuộc bài', 'Khong thuoc bai', 'Unprepared'],
    };
    const keywords = nameMap[key];
    return eventTypes.find(t => keywords.some(k => t.name.toLowerCase().includes(k.toLowerCase())));
  };

  // Helper: map lesson ratings to EventType by name
  const findEventTypeForLessonRating = (key: LessonRatingKey): EventType | undefined => {
    const nameMap: Record<LessonRatingKey, string[]> = {
      good: ['Tiết tốt', 'Tiet tot', 'Good lesson'],
      fair: ['Tiết khá', 'Tiet kha', 'Fair lesson'],
      average: ['Tiết trung bình', 'Tiet trung binh', 'Average lesson'],
      weak: ['Tiết yếu', 'Tiet yeu', 'Weak lesson'],
      poor: ['Tiết kém', 'Tiet kem', 'Poor lesson'],
    };
    const keywords = nameMap[key];
    return eventTypes.find(t => keywords.some(k => t.name.toLowerCase().includes(k.toLowerCase())));
  };

  const findEventTypeForClassViolation = (key: ViolationClassKey): EventType | undefined => {
    const nameMap: Record<ViolationClassKey, string[]> = {
      skipPeriod: ['Cúp tiết', 'Cup tiet', 'Skip period'],
      notFocused: ['Không tập trung', 'Khong tap trung', 'Not focused'],
      reportWritten: ['biên bản', 'bien ban', 'Report written'],
      noisyClass: ['Mất trật tự', 'Lớp ồn', 'Mat trat tu', 'Noisy'],
      swearing: ['Nói tục', 'Chửi thề', 'Noi tuc', 'Chui the', 'Swear'],
      absenceNoPermission: ['Nghỉ không phép', 'Nghi khong phep', 'Absent without permission'],
      late: ['Đi trễ', 'Di tre', 'Late'],
      noSchoolCampaign: ['Không tham gia phong trào', 'Khong tham gia phong trao', 'No campaign'],
      fighting: ['Đánh nhau', 'Danh nhau', 'Fighting'],
      phoneInClass: ['Điện thoại', 'Dien thoai', 'Phone'],
      lateGathering: ['Tập trung trễ', 'Tap trung tre', 'Late gathering'],
      publicProperty: ['của công', 'cua cong', 'Public property'],
      eatingDrinkingColor: ['Ăn vụn', 'an vun', 'nước phẩm màu', 'nuoc pham mau', 'Eating'],
      leaveWithoutPermission: ['ra ngoài không xin phép', 'ra ngoai khong xin phep', 'Leave without'],
      noClassCleaning: ['Không vệ sinh lớp', 'Khong ve sinh lop', 'No class cleaning'],
      trashDelayDirty: ['Không đổ rác', 've sinh cham', 'hanh lang do', 'Trash'],
    };
    const keywords = nameMap[key];
    return eventTypes.find(t => keywords.some(k => t.name.toLowerCase().includes(k.toLowerCase())));
  };

  const findEventTypeForStudentViolation = (key: StudentViolationKey): EventType | undefined => {
    const attireMap: Record<AttireViolationKey, string[]> = {
      dressUniform: ['Áo', 'Quần', 'không đúng quy định', 'Uniform'],
      noProperShoes: ['giày', 'dép có quai hậu', 'shoes'],
      hairOrDyed: ['Tóc dài', 'nhuộm', 'hair', 'dyed'],
      noNameTag: ['không bảng tên', 'khong bang ten', 'name tag'],
    };
    const generalMap: Record<StudentGeneralViolationKey, string[]> = {
      skipPeriod: ['Cúp tiết', 'Cup tiet', 'Skip period'],
      notFocused: ['Không tập trung', 'Khong tap trung', 'Not focused'],
      reportWritten: ['biên bản', 'bien ban', 'Report written'],
      swearing: ['Nói tục', 'Chửi thề', 'Noi tuc', 'Chui the', 'Swear'],
      absenceNoPermission: ['Nghỉ không phép', 'Nghi khong phep', 'Absent without permission'],
      late: ['Đi trễ', 'Di tre', 'Late'],
      fighting: ['Đánh nhau', 'Danh nhau', 'Fighting'],
      phoneInClass: ['Điện thoại', 'Dien thoai', 'Phone'],
      eatingDrinkingColor: ['Ăn vụn', 'an vun', 'nước phẩm màu', 'nuoc pham mau', 'Eating'],
      leaveWithoutPermission: ['ra ngoài không xin phép', 'ra ngoai khong xin phep', 'Leave without'],
    };
    const keywords = (key in attireMap ? attireMap[key as AttireViolationKey] : generalMap[key as StudentGeneralViolationKey]);
    return eventTypes.find(t => keywords.some(k => t.name.toLowerCase().includes(k.toLowerCase())));
  };

  // Helper: map event type name (discipline) to StudentViolationKey
  const mapEventNameToStudentViolationKey = (eventName: string): StudentViolationKey | undefined => {
    const name = eventName.toLowerCase();
    // Attire first (Áo/quần không đúng quy định, ...)
    const attireCandidates: Array<{ key: AttireViolationKey; tokens: string[] }> = [
      { key: 'dressUniform', tokens: ['áo', 'quần', 'không đúng quy định'] },
      { key: 'noProperShoes', tokens: ['giày', 'dép có quai hậu'] },
      { key: 'hairOrDyed', tokens: ['tóc dài', 'nhuộm'] },
      { key: 'noNameTag', tokens: ['không bảng tên'] },
    ];
    for (const c of attireCandidates) {
      if (c.tokens.every(t => name.includes(t))) return c.key;
    }
    // General
    const generalCandidates: Array<{ key: StudentGeneralViolationKey; tokens: string[] }> = [
      { key: 'skipPeriod', tokens: ['cúp tiết'] },
      { key: 'notFocused', tokens: ['không tập trung'] },
      { key: 'reportWritten', tokens: ['biên bản'] },
      { key: 'swearing', tokens: ['nói tục'] },
      { key: 'absenceNoPermission', tokens: ['nghỉ không phép'] },
      { key: 'late', tokens: ['đi trễ'] },
      { key: 'fighting', tokens: ['đánh nhau'] },
      { key: 'phoneInClass', tokens: ['điện thoại'] },
      { key: 'eatingDrinkingColor', tokens: ['ăn vụn'] },
      { key: 'leaveWithoutPermission', tokens: ['tự ý ra ngoài'] },
    ];
    for (const c of generalCandidates) {
      if (c.tokens.some(t => name.includes(t))) return c.key;
    }
    return undefined;
  };

  // Transform functions for clean code
  const transformStudentName = (student?: Student): string => {
    if (!student) return '';
    const first = student.user?.first_name || '';
    const last = student.user?.last_name || '';
    const full = `${first} ${last}`.trim();
    return full || student.user?.full_name || student.user?.username || 'Không xác định';
  };

  const getStudentNameById = (studentId?: string): string => {
    if (!studentId) return '';
    const s = students.find(st => String(st.id) === String(studentId));
    if (!s) return '';
    const first = s.user?.first_name || '';
    const last = s.user?.last_name || '';
    const full = `${first} ${last}`.trim();
    return full || s.user?.full_name || s.user?.username || '';
  };

  const transformPointColumnToEvents = (period: number, col: PointColumnConfig): EventCreateRequest[] => {
    const type = findEventTypeForPointColumn(col.key);
    if (!type) return [];

    const selected = (pointSelectedStudentsByPeriod[period]?.[col.key]) || [];
    const points = getScoreForPointColumn(
      col.key === 'p2_or_less' ? 'p2_or_less' : (col.key as any)
    );
    const resolvedPoints = Number.isFinite(points) && points !== 0 ? points : (type.default_points ?? 0);

    return selected
      .map((stuId, index) => ({ stuId, index }))
      .filter(({ stuId }) => stuId)
      .map(({ stuId, index }) => ({
        event_type: String(type.id),
        classroom: String(classroomId),
        student: String(stuId),
        date,
        period,
        points: resolvedPoints,
        description: col.key === 'p10' ? (p10NotesByPeriod[period]?.[index] || undefined) : undefined,
      }));
  };

  const transformLessonRatingToEvents = (period: number, rating: LessonRatingConfig): EventCreateRequest[] => {
    if (!(lessonSelectedByPeriod[period]?.[rating.key])) return [];
    
    const type = findEventTypeForLessonRating(rating.key);
    if (!type) return [];
    
    // Sử dụng default_points từ event type
    const points = type.default_points ?? 0;
    return [{
      event_type: String(type.id),
      classroom: String(classroomId),
      date,
      period,
      points,
    }];
  };

  const transformPeriodToEvents = (period: number): EventCreateRequest[] => {
    const payload: EventCreateRequest[] = [];
    if (!classroomId) return payload;

    // Point columns
    POINT_COLUMNS.forEach(col => {
      payload.push(...transformPointColumnToEvents(period, col));
    });

    // Lesson ratings
    LESSON_RATINGS.forEach(rating => {
      payload.push(...transformLessonRatingToEvents(period, rating));
    });

    // Class-level violations (counters)
    const counters = classViolationsByPeriod[period] || {} as Record<ViolationClassKey, number>;
    VIOLATION_CLASS.forEach(v => {
      const count = counters[v.key] || 0;
      if (count <= 0) return;
      const type = findEventTypeForClassViolation(v.key);
      if (!type) return;
      const points = type.default_points ?? 0;
      for (let i = 0; i < count; i += 1) {
        payload.push({
          event_type: String(type.id),
          classroom: String(classroomId),
          date,
          period,
          points,
        });
      }
    });

    // Per-student violations (attire + selected general ones)
    const rows = studentViolationsByPeriod[period] || [];
    rows.forEach(row => {
      if (!row.studentId) return;
      const type = findEventTypeForStudentViolation(row.violation);
      if (!type) return;
      const points = type.default_points ?? 0;
      payload.push({
        event_type: String(type.id),
        classroom: String(classroomId),
        student: String(row.studentId),
        date,
        period,
        points,
      });
    });

    return payload;
  };

  const transformAllPeriodsToEvents = (): EventCreateRequest[] => {
    const payload: EventCreateRequest[] = [];
    if (!classroomId) return payload;

    PERIODS.forEach(period => {
      // Point columns
      POINT_COLUMNS.forEach(col => {
        payload.push(...transformPointColumnToEvents(period, col));
      });

      // Lesson ratings
      LESSON_RATINGS.forEach(rating => {
        payload.push(...transformLessonRatingToEvents(period, rating));
      });

      // Class-level violations (counters)
      const counters = classViolationsByPeriod[period] || {} as Record<ViolationClassKey, number>;
      VIOLATION_CLASS.forEach(v => {
        const count = counters[v.key] || 0;
        if (count <= 0) return;
        const type = findEventTypeForClassViolation(v.key);
        if (!type) return;
        const points = type.default_points ?? 0;
        for (let i = 0; i < count; i += 1) {
          payload.push({
            event_type: String(type.id),
            classroom: String(classroomId),
            date,
            period,
            points,
          });
        }
      });

      // Per-student violations (attire + selected general ones)
      const rows = studentViolationsByPeriod[period] || [];
      rows.forEach(row => {
        if (!row.studentId) return;
        const type = findEventTypeForStudentViolation(row.violation);
        if (!type) return;
        const points = type.default_points ?? 0;
        payload.push({
          event_type: String(type.id),
          classroom: String(classroomId),
          student: String(row.studentId),
          date,
          period,
          points,
        });
      });
    });

    return payload;
  };

  const transformResetState = () => {
    setPointSelectedStudentsByPeriod(() => {
      return PERIODS.reduce((acc, p) => ({ ...acc, [p]: { p10: [], p9: [], p8: [], p4: [], p3: [], p2_or_less: [], debt: [], no_lesson: [] } }), {} as Record<number, Record<PointColumnKey, (string|undefined)[]>>);
    });
    setLessonSelectedByPeriod(() => {
      const base = { good: false, fair: false, average: false, weak: false, poor: false };
      return PERIODS.reduce((acc, p) => ({ ...acc, [p]: { ...base } }), {} as Record<number, Record<LessonRatingKey, boolean>>);
    });
    setClassViolationsByPeriod(() => {
      const base = VIOLATION_CLASS.reduce((m, v) => ({ ...m, [v.key]: 0 }), {} as Record<ViolationClassKey, number>);
      return PERIODS.reduce((acc, p) => ({ ...acc, [p]: { ...base } }), {} as Record<number, Record<ViolationClassKey, number>>);
    });
    setStudentViolationsByPeriod(() => {
      return PERIODS.reduce((acc, p) => ({ ...acc, [p]: [] }), {} as Record<number, { studentId?: string; violation: StudentViolationKey }[]>);
    });
    setCompletedPeriods(new Set());
    setCurrentStep(1);
    setActivePeriod(1);
  };

  const hasDataForPeriod = (period: number): boolean => {
    // Chỉ kiểm tra đánh giá tiết học là bắt buộc
    const hasLessonData = LESSON_RATINGS.some(rating => lessonSelectedByPeriod[period]?.[rating.key]);
    return hasLessonData;
  };

  const saveCurrentPeriod = async (): Promise<boolean> => {
    if (!classroomId) return false;
    
    try {
      setSaving(true);
      
      // Không bắt buộc phải có đánh giá tiết học (hỗ trợ tiết trống)
      // Chỉ lưu nếu có dữ liệu
      if (!hasDataForPeriod(activePeriod)) {
        console.log(`Period ${activePeriod} has no data, skipping save`);
        return true; // Cho phép chuyển tiết mà không cần lưu
      }
      
      // Nếu đang ở luồng edit, dùng sync theo tiết để tránh duplicate
      if (isEditMode || editPeriod !== null) {
        await syncPeriod(activePeriod);
      } else {
        const events = transformCurrentPeriodToEvents();
        // Luôn gửi events lên API (bao gồm đánh giá tiết học)
        if (events.length > 0) {
          const res = user?.role === 'student' 
            ? await apiService.bulkCreateEventsStudent({ events })
            : await apiService.bulkCreateEvents({ events });
          toast({ 
            title: 'Đã lưu', 
            description: `${res.created_count} sự kiện`,
            duration: 2000 // Giảm thời gian hiển thị
          });
        } else {
          // Fallback: nếu không có events nào được tạo, vẫn cho phép (có thể do event types chưa được tạo)
          toast({ 
            title: 'Đã lưu', 
            description: 'Đánh giá tiết học',
            duration: 2000 // Giảm thời gian hiển thị
          });
        }
      }
      
      return true;
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Lỗi lưu dữ liệu', description: e?.message || 'Vui lòng thử lại.', variant: 'destructive' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNextPeriod = async () => {
    // Save current period data FIRST
    const saveSuccess = await saveCurrentPeriod();
    
    // Only proceed if save was successful
    if (!saveSuccess) {
      return; // Stop here if save failed
    }
    
    // Then mark current period as completed
    setCompletedPeriods(prev => new Set([...prev, activePeriod]));
    
    if (currentStep < PERIODS.length) {
      // Move to next period
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setActivePeriod(PERIODS[nextStep - 1]);
    }
  };

  const handlePreviousPeriod = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setActivePeriod(PERIODS[prevStep - 1]);
    }
  };

  const isAllPeriodsCompleted = (): boolean => {
    // Kiểm tra ít nhất 1 tiết có đánh giá tiết học (hỗ trợ tiết trống)
    return PERIODS.some(period => hasDataForPeriod(period));
  };

  const handleEditPeriod = (period: number) => {
    setEditPeriod(period);
    setActivePeriod(period);
    setCurrentStep(period);
    
    // Load existing data for ALL periods when editing
    PERIODS.forEach(p => {
      loadExistingDataForPeriod(p);
    });
  };

  const loadExistingDataForPeriod = (period: number) => {
    const periodEvents = existingEvents.filter(e => e.period === period);
    
    // Reset current period data
    setPointSelectedStudentsByPeriod(prev => ({
      ...prev,
      [period]: { p10: [], p9: [], p8: [], p4: [], p3: [], p2_or_less: [], debt: [], no_lesson: [] }
    }));
    
    setLessonSelectedByPeriod(prev => ({
      ...prev,
      [period]: { good: false, fair: false, average: false, weak: false, poor: false }
    }));
    
    setClassViolationsByPeriod(prev => ({
      ...prev,
      [period]: VIOLATION_CLASS.reduce((m, v) => ({ ...m, [v.key]: 0 }), {} as Record<ViolationClassKey, number>)
    }));
    
    setStudentViolationsByPeriod(prev => ({
      ...prev,
      [period]: []
    }));
    
    // Load data from existing events
    periodEvents.forEach(event => {
      const eventType = eventTypes.find(et => et.id === event.event_type);
      if (!eventType) return;
      
      // Check if it's a lesson rating
      const lessonRating = LESSON_RATINGS.find(lr => 
        eventType.name.toLowerCase().includes(lr.label.toLowerCase())
      );
      if (lessonRating) {
        setLessonSelectedByPeriod(prev => ({
          ...prev,
          [period]: { ...prev[period], [lessonRating.key]: true }
        }));
        return;
      }
      
      // Check if it's a point column
      const pointColumn = POINT_COLUMNS.find(pc => 
        eventType.name.toLowerCase().includes(pc.label.toLowerCase())
      );
      if (pointColumn && event.student) {
        setPointSelectedStudentsByPeriod(prev => ({
          ...prev,
          [period]: {
            ...prev[period],
            [pointColumn.key]: [...(prev[period]?.[pointColumn.key] || []), event.student]
          }
        }));
        return;
      }
      
      // Check if it's a class violation
      const classViolation = VIOLATION_CLASS.find(cv => 
        eventType.name.toLowerCase().includes(cv.label.toLowerCase())
      );
      if (classViolation) {
        setClassViolationsByPeriod(prev => ({
          ...prev,
          [period]: {
            ...prev[period],
            [classViolation.key]: (prev[period]?.[classViolation.key] || 0) + 1
          }
        }));
        return;
      }
      
      // Check if it's a student violation
      const studentViolation = [...STUDENT_GENERAL_VIOLATIONS, ...ATTIRE_VIOLATIONS].find(sv => 
        eventType.name.toLowerCase().includes(sv.label.toLowerCase())
      );
      if (studentViolation && event.student) {
        setStudentViolationsByPeriod(prev => ({
          ...prev,
          [period]: [
            ...(prev[period] || []),
            { studentId: event.student, violation: studentViolation.key }
          ]
        }));
      }
    });
  };

  const handleCancelEdit = () => {
    setEditPeriod(null);
    // Quay lại tiết hiện tại hoặc tiết cuối cùng chưa hoàn thành
    const nextIncompletePeriod = PERIODS.find(p => !completedPeriods.has(p));
    if (nextIncompletePeriod) {
      setActivePeriod(nextIncompletePeriod);
      setCurrentStep(nextIncompletePeriod);
    } else {
      setActivePeriod(PERIODS[PERIODS.length - 1]);
      setCurrentStep(PERIODS.length);
    }
  };

  const populateFormFromEvents = (events: any[]) => {
    // Group events by period
    const eventsByPeriod = events.reduce((acc, event) => {
      const period = event.period || 0;
      if (!acc[period]) acc[period] = [];
      acc[period].push(event);
      return acc;
    }, {} as Record<number, any[]>);

    // Populate lesson ratings
    const newLessonRatings = { ...lessonSelectedByPeriod };
    Object.keys(eventsByPeriod).forEach(periodStr => {
      const period = parseInt(periodStr);
      const periodEvents = eventsByPeriod[period];
      
      // Find lesson rating event
      const lessonEvent = periodEvents.find(e => 
        e.event_type?.name?.includes('Tiết') && 
        (e.event_type?.name?.includes('tốt') || 
         e.event_type?.name?.includes('khá') || 
         e.event_type?.name?.includes('trung bình') || 
         e.event_type?.name?.includes('yếu') || 
         e.event_type?.name?.includes('kém'))
      );
      
      if (lessonEvent) {
        const eventName = lessonEvent.event_type?.name || '';
        if (eventName.includes('tốt')) newLessonRatings[period] = { good: true, fair: false, average: false, weak: false, poor: false };
        else if (eventName.includes('khá')) newLessonRatings[period] = { good: false, fair: true, average: false, weak: false, poor: false };
        else if (eventName.includes('trung bình')) newLessonRatings[period] = { good: false, fair: false, average: true, weak: false, poor: false };
        else if (eventName.includes('yếu')) newLessonRatings[period] = { good: false, fair: false, average: false, weak: true, poor: false };
        else if (eventName.includes('kém')) newLessonRatings[period] = { good: false, fair: false, average: false, weak: false, poor: true };
      }
    });
    setLessonSelectedByPeriod(newLessonRatings);

    // Populate point columns
    const newPointStudents = { ...pointSelectedStudentsByPeriod };
    const newP10Notes = { ...p10NotesByPeriod } as Record<number, string[]>;
    Object.keys(eventsByPeriod).forEach(periodStr => {
      const period = parseInt(periodStr);
      const periodEvents = eventsByPeriod[period];
      
      // Group by point value
      const pointGroups: Record<number, string[]> = {};
      periodEvents.forEach(event => {
        if (event.points && event.student) {
          const points = event.points;
          const studentName = typeof event.student === 'string' 
            ? event.student_name || event.student 
            : event.student.full_name || event.student.user?.full_name;
          console.log(`Period ${period}: Event ${event.event_type?.name} - Points: ${points}, Student: ${studentName}`);
          if (!pointGroups[points]) pointGroups[points] = [];
          const studentId = typeof event.student === 'string' ? event.student : event.student.id;
          pointGroups[points].push(studentId);
        }
      });
      console.log(`Period ${period} point groups:`, pointGroups);
      
      // Map to point columns
      const periodData: Record<PointColumnKey, string[]> = {
        p10: [],
        p9: [],
        p8: [],
        p4: [],
        p3: [],
        p2_or_less: [],
        debt: [],
        no_lesson: []
      };
      let p10NotesForPeriod: string[] = [];
      Object.keys(pointGroups).forEach(pointsStr => {
        const points = parseInt(pointsStr);
        const students = pointGroups[points];
        
        console.log(`Mapping points ${points} to column for period ${period}`);
        
        // Map based on event type name, not points value
        // because points = default_points (điểm cộng), not the actual grade
        const periodEvents = eventsByPeriod[period];
        const eventTypesForPoints = periodEvents.filter(e => e.points === points && e.student);
        
        if (eventTypesForPoints.length > 0) {
          const eventTypeName = eventTypesForPoints[0].event_type?.name?.toLowerCase();
          console.log(`Event type name for points ${points}: ${eventTypeName}`);
          
          // Map based on event type name (điểm 10, điểm 9, điểm 8, etc.)
          if (eventTypeName?.includes('điểm 10') || eventTypeName?.includes('điểm10')) {
            periodData.p10 = students;
            p10NotesForPeriod = eventTypesForPoints.map(e => e.description || '');
            console.log(`Mapped ${students.length} students to p10 (based on event type name)`);
          } else if (eventTypeName?.includes('điểm 9') || eventTypeName?.includes('điểm9')) {
            periodData.p9 = students;
            console.log(`Mapped ${students.length} students to p9 (based on event type name)`);
          } else if (eventTypeName?.includes('điểm 8') || eventTypeName?.includes('điểm8')) {
            periodData.p8 = students;
            console.log(`Mapped ${students.length} students to p8 (based on event type name)`);
          } else if (eventTypeName?.includes('điểm 4') || eventTypeName?.includes('điểm4')) {
            periodData.p4 = students;
            console.log(`Mapped ${students.length} students to p4 (based on event type name)`);
          } else if (eventTypeName?.includes('điểm 3') || eventTypeName?.includes('điểm3')) {
            periodData.p3 = students;
            console.log(`Mapped ${students.length} students to p3 (based on event type name)`);
          } else if (eventTypeName?.includes('điểm 2') || eventTypeName?.includes('điểm2')) {
            periodData.p2_or_less = students;
            console.log(`Mapped ${students.length} students to p2_or_less (based on event type name)`);
          } else if (eventTypeName?.includes('điểm nợ') || eventTypeName?.includes('điểmno')) {
            periodData.debt = students;
            console.log(`Mapped ${students.length} students to debt (based on event type name)`);
          } else if (eventTypeName?.includes('không thuộc bài') || eventTypeName?.includes('khong thuoc bai')) {
            periodData.no_lesson = students;
            console.log(`Mapped ${students.length} students to no_lesson (based on event type name)`);
          }
        }
      });
      console.log(`Final period data for period ${period}:`, periodData);
      
      // Sort each column by student name; keep p10 notes aligned
      const sortByName = (ids: string[], notes?: string[]) => {
        const combined = ids.map((id, idx) => ({ id, note: notes ? notes[idx] : undefined, name: getStudentNameById(id) }));
        combined.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        return {
          ids: combined.map(i => i.id),
          notes: combined.map(i => i.note ?? ''),
        };
      };

      const p10Sorted = sortByName(periodData.p10, p10NotesForPeriod);
      periodData.p10 = p10Sorted.ids;
      p10NotesForPeriod = p10Sorted.notes;

      const p9Sorted = sortByName(periodData.p9);
      periodData.p9 = p9Sorted.ids;
      const p8Sorted = sortByName(periodData.p8);
      periodData.p8 = p8Sorted.ids;
      const p4Sorted = sortByName(periodData.p4);
      periodData.p4 = p4Sorted.ids;
      const p3Sorted = sortByName(periodData.p3);
      periodData.p3 = p3Sorted.ids;
      const p2Sorted = sortByName(periodData.p2_or_less);
      periodData.p2_or_less = p2Sorted.ids;
      const debtSorted = sortByName(periodData.debt);
      periodData.debt = debtSorted.ids;
      const noLessonSorted = sortByName(periodData.no_lesson);
      periodData.no_lesson = noLessonSorted.ids;

      newPointStudents[period] = periodData;
      newP10Notes[period] = p10NotesForPeriod;
    });
    setPointSelectedStudentsByPeriod(newPointStudents);
    setP10NotesByPeriod(newP10Notes);

    // Populate class violations (category: school_rules)
    const newClassViolations = { ...classViolationsByPeriod };
    Object.keys(eventsByPeriod).forEach(periodStr => {
      const period = parseInt(periodStr);
      const periodEvents = eventsByPeriod[period];
      
      // Count class violations
      const violations: Record<ViolationClassKey, number> = {
        skipPeriod: 0,
        notFocused: 0,
        reportWritten: 0,
        noisyClass: 0,
        swearing: 0,
        absenceNoPermission: 0,
        late: 0,
        noSchoolCampaign: 0,
        fighting: 0,
        phoneInClass: 0,
        lateGathering: 0,
        publicProperty: 0,
        eatingDrinkingColor: 0,
        leaveWithoutPermission: 0,
        noClassCleaning: 0,
        trashDelayDirty: 0
      };
      
      // Only take class-level events that are categorized as school_rules
      periodEvents.forEach(event => {
        if (!event.student && event.event_type?.category === 'school_rules' && event.event_type?.name) {
          const eventName = event.event_type.name.toLowerCase();
          // Map by VIOLATION_CLASS labels
          VIOLATION_CLASS.forEach(v => {
            if (eventName.includes(v.label.toLowerCase())) {
              // @ts-ignore
              violations[v.key] = (violations[v.key] || 0) + 1;
            }
          });
          // Additional common aliases
          if (eventName.includes('mất trật tự') || eventName.includes('lớp ồn') || eventName.includes('mat trat tu')) violations.noisyClass += 1;
          if (eventName.includes('của công') || eventName.includes('public property')) violations.publicProperty += 1;
          if (eventName.includes('không vệ sinh lớp') || eventName.includes('khong ve sinh lop')) violations.noClassCleaning += 1;
          if (eventName.includes('không đổ rác') || eventName.includes('ve sinh cham') || eventName.includes('hanh lang do')) violations.trashDelayDirty += 1;
          if (eventName.includes('tập trung trễ') || eventName.includes('tap trung tre')) violations.lateGathering += 1;
          if (eventName.includes('không tham gia phong trào') || eventName.includes('khong tham gia phong trao')) violations.noSchoolCampaign += 1;
        }
      });
      
      newClassViolations[period] = violations;
    });
    setClassViolationsByPeriod(newClassViolations);

    // Populate student violations
    const newStudentViolations = { ...studentViolationsByPeriod };
    Object.keys(eventsByPeriod).forEach(periodStr => {
      const period = parseInt(periodStr);
      const periodEvents = eventsByPeriod[period];
      
      const violations: { studentId?: string; violation: StudentViolationKey }[] = [];
      periodEvents.forEach(event => {
        if (event.student && event.event_type?.category === 'discipline') {
          const eventName = event.event_type.name || '';
          const key = mapEventNameToStudentViolationKey(eventName);
          if (!key) {
            console.log(`Unknown discipline event name mapping: ${eventName}`);
            return;
          }
          const studentId = typeof event.student === 'string' ? event.student : event.student.id;
          violations.push({ studentId, violation: key });
        }
      });
      
      newStudentViolations[period] = violations;
    });
    setStudentViolationsByPeriod(newStudentViolations);
  };

  const transformCurrentPeriodToEvents = (): EventCreateRequest[] => {
    return transformPeriodToEvents(activePeriod);
  };

  const loadExistingEvents = async () => {
    if (!classroomId || !date) return;
    
    try {
      setIsLoadingExisting(true);
      const events = await apiService.getEvents({
        classroom_id: classroomId,
        date: date
      });
      setExistingEvents(events);
      // Compute per-period approval summary for quick display if needed
      
      // Kiểm tra tiết nào đã có dữ liệu
      const periodsWithData = new Set<number>();
      events.forEach(event => {
        if (event.period) {
          periodsWithData.add(event.period);
        }
      });
      setCompletedPeriods(periodsWithData);
      
      // Populate form data from existing events
      populateFormFromEvents(events);
      
      // Kiểm tra xem học sinh đã tạo sự kiện cho ngày đó chưa
      if (user?.role === 'student') {
        const studentEvents = events.filter(event => 
          String(event.recorded_by) === String(user.id) || 
          (event.student && String(event.student.user?.id) === String(user.id))
        );
        setHasExistingStudentEvents(studentEvents.length > 0);
      }
      
    } catch (e: any) {
      console.error('Error loading existing events:', e);
      toast({ 
        title: 'Lỗi tải dữ liệu', 
        description: 'Không thể tải sự kiện đã có. Vui lòng thử lại.', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingExisting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editPeriod === null) return;
    
    try {
      setSaving(true);
      await syncPeriod(editPeriod);
      
      // Reload existing events
      await loadExistingEvents();
      setEditPeriod(null);
      
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Lỗi cập nhật', description: e?.message || 'Vui lòng thử lại.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Reusable sync logic for a period: update/create/delete diffs to avoid duplicates
  const syncPeriod = async (period: number) => {
    const desired = transformPeriodToEvents(period);
    await apiService.bulkSyncEvents({
      classroom: String(classroomId),
      date,
      period,
      events: desired,
    });
    toast({ 
      title: 'Đã cập nhật', 
      description: `Đã đồng bộ dữ liệu cho tiết ${period}`,
      duration: 2000
    });
  };

  const buildEventsPayload = (): EventCreateRequest[] => {
    const payload: EventCreateRequest[] = [];
    if (!classroomId) return payload;

    // Iterate all 7 periods
    PERIODS.forEach(period => {
      // Point columns -> per selected student (auto-map EventType)
      POINT_COLUMNS.forEach(col => {
        const type = findEventTypeForPointColumn(col.key);
        if (!type) return;
        const points = type?.default_points ?? 0;
        const selected = (pointSelectedStudentsByPeriod[period]?.[col.key]) || [];
        selected.forEach(stuId => {
          if (!stuId) return;
          payload.push({
            event_type: String(type.id),
            classroom: String(classroomId),
            student: String(stuId),
            date,
            period,
            points,
          });
        });
      });

      // Lesson ratings -> class-level events (no student), just tick to add
      LESSON_RATINGS.forEach(r => {
        if (!(lessonSelectedByPeriod[period]?.[r.key])) return;
        const type = findEventTypeForLessonRating(r.key);
        if (!type) return;
        const points = type?.default_points ?? 0;
        payload.push({
          event_type: String(type.id),
          classroom: String(classroomId),
          date,
          period,
          points,
        });
      });
    });

    return payload;
  };

  const handleSubmit = async () => {
    try {
      // Kiểm tra ít nhất 1 tiết có đánh giá tiết học (hỗ trợ tiết trống)
      const hasAnyPeriodData = PERIODS.some(period => hasDataForPeriod(period));
      if (!hasAnyPeriodData) {
        toast({ 
          title: 'Chưa có dữ liệu', 
          description: 'Vui lòng đánh giá ít nhất 1 tiết học trước khi gửi.', 
          variant: 'destructive' 
        });
        return;
      }
      
      setLoading(true);
      if (isEditMode) {
        // Đồng bộ từng tiết để update/create/delete chính xác, tránh duplicate
        for (const period of PERIODS) {
          if (hasDataForPeriod(period)) {
            await syncPeriod(period);
          } else {
            // Nếu không có dữ liệu cho tiết đó, xóa những cái hiện có (nếu người dùng xóa)
            const existingForPeriod = existingEvents.filter(e => e.period === period);
            for (const ex of existingForPeriod) {
              await apiService.deleteEvent(ex.id);
            }
          }
        }
        toast({ 
          title: 'Hoàn thành!', 
          description: 'Đã cập nhật toàn bộ các tiết',
          duration: 3000
        });
      } else {
        const events = transformAllPeriodsToEvents();
        // Luôn gửi events lên API (bao gồm đánh giá tiết học)
        if (events.length > 0) {
          const res = user?.role === 'student' 
            ? await apiService.bulkCreateEventsStudent({ events })
            : await apiService.bulkCreateEvents({ events });
          toast({ 
            title: 'Hoàn thành!', 
            description: `Đã tạo ${res.created_count} sự kiện`,
            duration: 3000
          });
        } else {
          // Fallback: nếu không có events nào được tạo, tạo events mặc định cho đánh giá tiết học
          const fallbackEvents: EventCreateRequest[] = [];
          
          PERIODS.forEach(period => {
            LESSON_RATINGS.forEach(rating => {
              if (lessonSelectedByPeriod[period]?.[rating.key]) {
                // Tìm event type phù hợp hoặc sử dụng event type đầu tiên có sẵn
                const type = findEventTypeForLessonRating(rating.key);
                if (type) {
                  const points = getScoreForLessonRating(rating.key as any) ?? (type.default_points ?? 0);
                  fallbackEvents.push({
                    event_type: String(type.id),
                    classroom: String(classroomId),
                    date,
                    period,
                    points,
                  });
                } else if (eventTypes.length > 0) {
                  // Fallback: sử dụng event type đầu tiên có sẵn
                  const fallbackType = eventTypes[0];
                  const points = getScoreForLessonRating(rating.key as any) ?? (fallbackType.default_points ?? 0);
                  fallbackEvents.push({
                    event_type: String(fallbackType.id),
                    classroom: String(classroomId),
                    date,
                    period,
                    points,
                  });
                }
              }
            });
          });
          
          if (fallbackEvents.length > 0) {
            const res = user?.role === 'student' 
              ? await apiService.bulkCreateEventsStudent({ events: fallbackEvents })
              : await apiService.bulkCreateEvents({ events: fallbackEvents });
            toast({ 
              title: 'Hoàn thành!', 
              description: `Đã tạo ${res.created_count} sự kiện (fallback)`,
              duration: 3000
            });
          } else {
            toast({ 
              title: 'Hoàn thành!', 
              description: 'Đã đánh giá tất cả tiết học (không có dữ liệu để lưu)',
              duration: 3000
            });
          }
        }
      }
      
      if (onSubmitted) onSubmitted();
      transformResetState();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Lỗi tạo sự kiện', description: e?.message || 'Vui lòng thử lại.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            {isViewMode ? 'Chi tiết sự kiện' : 'Nhập Sự Kiện'}
          </CardTitle>
          {isViewMode && (
            <CardDescription>
              Xem chi tiết các sự kiện đã được ghi nhận cho ngày này
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-gray-500" />Ngày</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isViewMode} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-500" />Lớp học</Label>
              <Select value={classroomId || 'none'} onValueChange={(v) => setClassroomId(v === 'none' ? '' : v)} disabled={isViewMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp học">
                    {classroomId && classroomOptions.length > 0 ? (
                      <span>{classroomOptions.find(c => c.id === classroomId)?.full_name || 'Lớp học không xác định'}</span>
                    ) : classroomId ? (
                      <span>Đang tải...</span>
                    ) : (
                      'Chọn lớp học'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {classroomOptions.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-500" />Tiến trình nhập dữ liệu</Label>
            <div className="overflow-x-auto">
              <div className="flex items-center gap-3 min-w-max flex-nowrap py-1">
                {PERIODS.map((p, index) => {
                  const isCompleted = completedPeriods.has(p);
                  const isActive = activePeriod === p;
                  const periodEvents = existingEvents.filter(e => e.period === p);
                  const hasPending = periodEvents.some(e => e.status === 'pending');
                  const hasRejected = periodEvents.some(e => e.status === 'rejected');
                  const statusBadge = periodEvents.length === 0 ? null : hasPending
                    ? { text: 'Chờ', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
                    : hasRejected
                      ? { text: 'Từ chối', cls: 'bg-red-100 text-red-800 border-red-200' }
                      : { text: 'Duyệt', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' };

                  return (
                    <div key={p} className="flex flex-col items-center justify-start">
                      <button
                        type="button"
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shadow-sm transition-colors ${
                          isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                        onClick={isViewMode ? undefined : () => setActivePeriod(p)}
                        aria-label={getPeriodLabel(p)}
                      >
                        {isCompleted ? '✓' : index + 1}
                      </button>
                      <span className="mt-1 text-[11px] text-gray-600 hidden sm:block text-center whitespace-nowrap max-w-[88px] truncate">
                        {getPeriodLabel(p)}
                      </span>
                      {statusBadge && (
                        <span className={`mt-1 px-1.5 py-0.5 rounded text-[10px] border ${statusBadge.cls}`}>
                          {statusBadge.text}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {editPeriod ? `Chỉnh sửa ${getPeriodLabel(editPeriod)}` : `Bước ${currentStep}/${PERIODS.length}: ${getPeriodLabel(activePeriod)}`}
            </div>
            {editPeriod && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  size="sm"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button 
                  onClick={handleSubmit}
                  size="sm"
                  disabled={saving || loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Đang hoàn tất...' : 'Hoàn tất nhanh'}
                </Button>
              </div>
            )}
          </div>

          {/* Loading existing events */}
          {isLoadingExisting && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600">Đang tải dữ liệu đã có...</span>
              </div>
            </div>
          )}



          {/* No existing data message */}
          {!isLoadingExisting && completedPeriods.size === 0 && !editPeriod && !hasExistingStudentEvents && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">Chưa có dữ liệu cho ngày {date}</div>
              <div className="text-xs mt-1">Bắt đầu nhập dữ liệu cho các tiết học</div>
            </div>
          )}

          {/* Point Columns Matrix - Show all periods when editing */}
          {!isLoadingExisting && (
            <div className="space-y-3">
            <div className="font-semibold">Cột điểm (tùy chọn) — {getPeriodLabel(activePeriod)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {POINT_COLUMNS.map(col => (
                <Card key={col.key} className="border border-gray-200">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{col.label}</div>
                    </div>

                    <div className="space-y-2">
                      {(pointSelectedStudentsByPeriod[activePeriod]?.[col.key] || []).map((val, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex-1">
                            <StudentSearchSelect
                              value={val}
                              onChange={(v) => handleSelectStudent(col.key, idx, v)}
                              disabled={isViewMode}
                              students={students}
                            />
                          </div>
                          {col.key === 'p10' && (
                            <div className="flex-1">
                              <Input
                                placeholder="Ghi chú (tùy chọn)"
                                value={p10NotesByPeriod[activePeriod]?.[idx] || ''}
                                onChange={(e) => setP10NotesByPeriod(prev => {
                                  const arr = [...(prev[activePeriod] || [])];
                                  arr[idx] = e.target.value;
                                  return { ...prev, [activePeriod]: arr };
                                })}
                                disabled={isViewMode}
                              />
                            </div>
                          )}
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeStudentRow(col.key, idx)} aria-label="Xoá dòng" disabled={isViewMode}>
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => addStudentRow(col.key)} disabled={isViewMode}>
                        <Plus className="h-4 w-4" /> Thêm học sinh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          )}

          {/* Lesson Ratings - Show all periods when editing */}
          <div className="space-y-3">
            <div className="font-semibold">Đánh giá tiết học (bắt buộc - chọn 1) — {getPeriodLabel(activePeriod)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {LESSON_RATINGS.map(r => (
                <Card 
                  key={r.key} 
                  className={`border border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
                    lessonSelectedByPeriod[activePeriod]?.[r.key] ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  onClick={isViewMode ? undefined : () => setLessonSelectedByPeriod(prev => {
                    const base = { good: false, fair: false, average: false, weak: false, poor: false };
                    // enforce only one selected per period
                    const next = { ...base } as Record<LessonRatingKey, boolean>;
                    next[r.key] = true;
                    return { ...prev, [activePeriod]: next };
                  })}
                >
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={!!(lessonSelectedByPeriod[activePeriod]?.[r.key])}
                          onCheckedChange={(checked) => setLessonSelectedByPeriod(prev => {
                            const base = { good: false, fair: false, average: false, weak: false, poor: false };
                            // enforce only one selected per period
                            const next = { ...base } as Record<LessonRatingKey, boolean>;
                            if (checked) next[r.key] = true;
                            return { ...prev, [activePeriod]: next };
                          })}
                        />
                        <span className="font-medium">{r.label}</span>
                      </div>
                      <div />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Class-level Violations Counters - Show all periods when editing */}
          <div className="space-y-3">
            <div className="font-semibold">Vi phạm nề nếp/quy định (tùy chọn) — {getPeriodLabel(activePeriod)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {VIOLATION_CLASS.map(v => (
                <Card 
                  key={v.key} 
                  className={`border border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
                    (classViolationsByPeriod[activePeriod]?.[v.key] || 0) > 0 ? 'bg-red-50 border-red-300' : ''
                  }`}
                  onClick={isViewMode ? undefined : () => setClassViolationsByPeriod(prev => {
                    const curr = { ...(prev[activePeriod] || {}) } as Record<ViolationClassKey, number>;
                    const val = (curr[v.key] || 0) + 1;
                    return { ...prev, [activePeriod]: { ...curr, [v.key]: val } };
                  })}
                >
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{v.label}</div>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={isViewMode ? undefined : (e) => {
                            e.stopPropagation();
                            setClassViolationsByPeriod(prev => {
                              const curr = { ...(prev[activePeriod] || {}) } as Record<ViolationClassKey, number>;
                              const val = Math.max(0, (curr[v.key] || 0) - 1);
                              return { ...prev, [activePeriod]: { ...curr, [v.key]: val } };
                            });
                          }}
                        >-</Button>
                        <span className="w-6 text-center">{(classViolationsByPeriod[activePeriod]?.[v.key]) || 0}</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={isViewMode ? undefined : (e) => {
                            e.stopPropagation();
                            setClassViolationsByPeriod(prev => {
                              const curr = { ...(prev[activePeriod] || {}) } as Record<ViolationClassKey, number>;
                              const val = (curr[v.key] || 0) + 1;
                              return { ...prev, [activePeriod]: { ...curr, [v.key]: val } };
                            });
                          }}
                        >+</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Per-student violations - Show all periods when editing */}
          <div className="space-y-3">
            <div className="font-semibold">Vi phạm theo học sinh (tùy chọn) — {getPeriodLabel(activePeriod)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border border-gray-200">
                <CardContent className="pt-4 space-y-3">
                  {(studentViolationsByPeriod[activePeriod] || []).map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1">
                        <StudentSearchSelect
                          value={row.studentId}
                          onChange={(v) => setStudentViolationsByPeriod(prev => {
                            const list = [ ...(prev[activePeriod] || []) ];
                            list[idx] = { ...list[idx], studentId: v };
                            return { ...prev, [activePeriod]: list };
                          })}
                          disabled={isViewMode}
                          students={students}
                        />
                      </div>
                      <Select
                        value={row.violation}
                        onValueChange={isViewMode ? undefined : (val) => setStudentViolationsByPeriod(prev => {
                          const list = [ ...(prev[activePeriod] || []) ];
                          list[idx] = { ...list[idx], violation: val as StudentViolationKey };
                          return { ...prev, [activePeriod]: list };
                        })}
                        disabled={isViewMode}
                      >
                        <SelectTrigger className="w-[220px]">
                          <SelectValue placeholder="Chọn vi phạm" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...STUDENT_GENERAL_VIOLATIONS, ...ATTIRE_VIOLATIONS].map(opt => (
                            <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="icon" onClick={isViewMode ? undefined : () => setStudentViolationsByPeriod(prev => {
                        const list = [ ...(prev[activePeriod] || []) ];
                        list.splice(idx, 1);
                        return { ...prev, [activePeriod]: list };
                      })} aria-label="Xoá dòng" disabled={isViewMode}>
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={isViewMode ? undefined : () => setStudentViolationsByPeriod(prev => {
                    const list = [ ...(prev[activePeriod] || []) ];
                    list.push({ violation: 'skipPeriod' });
                    return { ...prev, [activePeriod]: list };
                  })} disabled={isViewMode}>
                    <Plus className="h-4 w-4" /> Thêm vi phạm
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between">
            {!editPeriod && (
              <Button 
                onClick={handlePreviousPeriod} 
                disabled={currentStep <= 1 || isViewMode}
                variant="outline"
                className="gap-2"
              >
                ← Trước
              </Button>
            )}
            
            <div className="flex gap-2">
              {!editPeriod && currentStep < PERIODS.length ? (
                <Button 
                  onClick={handleNextPeriod} 
                  disabled={saving || !classroomId || isViewMode}
                  className="gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      Lưu tiết học
                    </>
                  )}
                </Button>
              ) : !editPeriod ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !classroomId || !isAllPeriodsCompleted() || isViewMode}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4" /> 
                  {isAllPeriodsCompleted() ? 'Hoàn thành & Gửi' : 'Hoàn thành tất cả 7 tiết'}
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentSearchSelect({ value, onChange, students, disabled }: { value?: string; onChange: (v?: string) => void; students: Student[]; disabled?: boolean; }) {
  const [open, setOpen] = useState(false);
  const selected = students.find(s => String(s.id) === String(value));
  const renderName = (s?: Student) => {
    if (!s) return '';
    const first = s.user?.first_name || '';
    const last = s.user?.last_name || '';
    const full = `${first} ${last}`.trim();
    return full || s.user?.full_name || s.user?.username || 'Không xác định';
  };
  return (
    <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between" disabled={disabled}>
          {selected ? renderName(selected) : 'Chọn học sinh'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[320px]" align="start">
        <Command>
          <CommandInput placeholder="Tìm kiếm học sinh..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy</CommandEmpty>
            <CommandGroup>
              {students.map((s) => (
                <CommandItem
                  key={s.id}
                  value={renderName(s)}
                  onSelect={() => {
                    onChange(String(s.id));
                    setOpen(false);
                  }}
                >
                  {renderName(s)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


