"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Building2,
  ShieldCheck,
  BookOpen,
  Search,
  Upload,
  Edit3,
  Globe,
  Lock,
  KeyRound,
  LogOut,
  BarChart3,
  TrendingUp,
  FileText,
  ExternalLink,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  RefreshCw,
  Settings,
  Users,
  FolderKanban,
  LayoutDashboard,
  Eye,
  GraduationCap,
  Award,
  Layers,
  X,
  Calendar,
  Filter,
  Check,
  Clock,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  BookMarked,
  Library,
  Lightbulb,
  Compass,
  DollarSign,
  Briefcase,
  Sun,
  Moon,
  Type
} from "lucide-react";

import {
  EDUCATION_PROGRAMS,
  SURVEY_TOPICS,
  INITIAL_TEACHERS,
  INITIAL_STAFF,
  INITIAL_PORTFOLIO_WORKS,
  INITIAL_INSTRUCTOR_FORMS,
  INITIAL_EXECUTIVE_FORMS,
  GOOGLE_FORM_INSTRUCTOR_URL,
  GOOGLE_FORM_EXECUTIVE_URL,
  SHEET_TEACHER_HISTORY_URL,
  type StaffMember,
  type TeacherInfo,
  type InstructorPlanRecord,
  type ExecutivePlanRecord,
  type PortfolioWork,
} from "@/data/seedData";

import { GAS_API_URL } from "@/lib/api";

export default function FacultyEducationPortalApp() {
  // Navigation & Auth State
  const [activeView, setActiveView] = useState<"HOME" | "INSTRUCTOR" | "EXECUTIVE" | "ADMIN">("HOME");
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [loginModalRole, setLoginModalRole] = useState<"INSTRUCTOR" | "EXECUTIVE" | "ADMIN" | null>(null);
  const [loginStaffId, setLoginStaffId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Theme & Accessibility State (Light macOS default + Dark Mode + Font Size Scaler for elderly/mobile)
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [fontSizeScale, setFontSizeScale] = useState<"normal" | "large" | "xlarge">("normal");
  const isDark = themeMode === "dark";

  // System Settings: เปิด/ปิดการกรอกข้อมูลโดยแอดมิน (Admin Submission Toggle)
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(true);

  // Database State
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [teachersList] = useState<TeacherInfo[]>(INITIAL_TEACHERS);
  const [instructorForms, setInstructorForms] = useState<InstructorPlanRecord[]>(INITIAL_INSTRUCTOR_FORMS);
  const [portfolioWorks, setPortfolioWorks] = useState<PortfolioWork[]>(INITIAL_PORTFOLIO_WORKS);
  const [executiveForms, setExecutiveForms] = useState<ExecutivePlanRecord[]>(INITIAL_EXECUTIVE_FORMS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Public Hub State
  const [publicHubTab, setPublicHubTab] = useState<"EBOOKS" | "FACULTY">("EBOOKS");
  const [publicSearch, setPublicSearch] = useState("");
  const [publicDeptFilter, setPublicDeptFilter] = useState("ALL");
  const [publicTeacherFilter, setPublicTeacherFilter] = useState("ALL");
  const [selectedWorkModal, setSelectedWorkModal] = useState<PortfolioWork | null>(null);
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<TeacherInfo | null>(null);
  const [ebookPage, setEbookPage] = useState(1);

  // Instructor Portal State
  const [instTab, setInstTab] = useState<"SUMMARY" | "FORM" | "PORTFOLIO" | "PASSWORD">("SUMMARY");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("ALL");
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>("ALL");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  
  // Instructor Form Inputs
  const [instFormState, setInstFormState] = useState({
    Academic_Year: 2570,
    Course_Code: "",
    Course_Name: "",
    Teaching_Method: "Active Learning ร่วมกับโครงงานเป็นฐาน (PBL)",
    Target_KPI: "นักศึกษาร้อยละ 85 มีผลสัมฤทธิ์ระดับ B ขึ้นไป",
    Teaching_Summary: "",
    Research_Output: "",
    Ebook_Planned: "",
    Self_Development: "",
    Budget_Requested: "",
    Additional_Notes: "",
  });

  // Portfolio Upload State
  const [editingWorkId, setEditingWorkId] = useState<string | null>(null);
  const [workFormState, setWorkFormState] = useState({
    Academic_Year: 2570,
    Title: "",
    Category: "ตำรา / E-Book",
    Work_Type: "PDF" as "PDF" | "LINK",
    File_Or_Link_URL: "",
    Description: "",
    Is_Public: true,
    base64Data: "",
    fileName: "",
  });

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Executive Portal State
  const [editingExecId, setEditingExecId] = useState<string | null>(null);
  const [execFormState, setExecFormState] = useState({
    Academic_Year: 2570,
    Curriculum_Status: "ผ่านการรับรองมาตรฐาน AUN-QA",
    Faculty_Count: 8,
    Total_Graduates: 90,
    Quality_Score: 4.80,
    Strategic_Plan_2570_2574: "",
    Budget_Needs: "",
    Issues_Found: "",
  });

  // Admin Portal State
  const [adminMenu, setAdminMenu] = useState<"DASHBOARD" | "INSTRUCTORS" | "PORTFOLIO" | "EXECUTIVES" | "FACULTY" | "STAFF" | "SETTINGS">("DASHBOARD");
  const [adminYearMode, setAdminYearMode] = useState<"RANGE_2570_2574" | "EVERY_5_YEARS" | "SINGLE_YEAR">("RANGE_2570_2574");
  const [adminSelectedYear, setAdminSelectedYear] = useState<number>(2570);
  const [newStaffForm, setNewStaffForm] = useState({
    Staff_ID: "",
    Full_Name: "",
    Department: EDUCATION_PROGRAMS[0],
    Role: "INSTRUCTOR" as "INSTRUCTOR" | "EXECUTIVE" | "ADMIN",
    Password: "123456",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // LocalStorage SWR Caching & Accessibility Settings
  useEffect(() => {
    try {
      const cachedStaff = localStorage.getItem("edu_staff_v3");
      const cachedInst = localStorage.getItem("edu_inst_v3");
      const cachedWorks = localStorage.getItem("edu_works_v3");
      const cachedExec = localStorage.getItem("edu_exec_v3");
      const cachedSub = localStorage.getItem("edu_submission_open");
      const cachedTheme = localStorage.getItem("edu_theme_v3");
      const cachedScale = localStorage.getItem("edu_scale_v3");

      if (cachedStaff) setStaffList(JSON.parse(cachedStaff));
      if (cachedInst) setInstructorForms(JSON.parse(cachedInst));
      if (cachedWorks) setPortfolioWorks(JSON.parse(cachedWorks));
      if (cachedExec) setExecutiveForms(JSON.parse(cachedExec));
      if (cachedSub !== null) setIsSubmissionOpen(JSON.parse(cachedSub));
      if (cachedTheme === "dark" || cachedTheme === "light") setThemeMode(cachedTheme);
      if (cachedScale === "normal" || cachedScale === "large" || cachedScale === "xlarge") {
        setFontSizeScale(cachedScale);
      }
    } catch (e) {
      console.warn("LocalStorage cache error:", e);
    }

    if (GAS_API_URL) {
      syncWithGAS();
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("edu_staff_v3", JSON.stringify(staffList));
      localStorage.setItem("edu_inst_v3", JSON.stringify(instructorForms));
      localStorage.setItem("edu_works_v3", JSON.stringify(portfolioWorks));
      localStorage.setItem("edu_exec_v3", JSON.stringify(executiveForms));
      localStorage.setItem("edu_submission_open", JSON.stringify(isSubmissionOpen));
    } catch (e) {
      console.warn("Failed to persist to localStorage", e);
    }
  }, [staffList, instructorForms, portfolioWorks, executiveForms, isSubmissionOpen]);

  useEffect(() => {
    try {
      localStorage.setItem("edu_theme_v3", themeMode);
    } catch (e) {}
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem("edu_scale_v3", fontSizeScale);
      if (typeof document !== "undefined") {
        if (fontSizeScale === "xlarge") {
          document.documentElement.style.fontSize = "19px";
        } else if (fontSizeScale === "large") {
          document.documentElement.style.fontSize = "17.5px";
        } else {
          document.documentElement.style.fontSize = "15.5px";
        }
      }
    } catch (e) {}
  }, [fontSizeScale]);

  const handleToggleFontSize = () => {
    if (fontSizeScale === "normal") {
      setFontSizeScale("large");
      showToast("🔤 ปรับขนาดตัวอักษร: ใหญ่ (115%) อ่านสบายตา");
    } else if (fontSizeScale === "large") {
      setFontSizeScale("xlarge");
      showToast("🔤 ปรับขนาดตัวอักษร: ใหญ่พิเศษ (125%) สำหรับผู้สูงอายุ");
    } else {
      setFontSizeScale("normal");
      showToast("🔤 ปรับขนาดตัวอักษร: ปกติ (100%)");
    }
  };

  const handleDecreaseFontSize = () => {
    if (fontSizeScale === "xlarge") {
      setFontSizeScale("large");
      showToast("🔤 ปรับขนาดตัวอักษร: ใหญ่ (115%)");
    } else if (fontSizeScale === "large") {
      setFontSizeScale("normal");
      showToast("🔤 ปรับขนาดตัวอักษร: ปกติ (100%)");
    }
  };

  const handleIncreaseFontSize = () => {
    if (fontSizeScale === "normal") {
      setFontSizeScale("large");
      showToast("🔤 ปรับขนาดตัวอักษร: ใหญ่ (115%)");
    } else if (fontSizeScale === "large") {
      setFontSizeScale("xlarge");
      showToast("🔤 ปรับขนาดตัวอักษร: ใหญ่พิเศษ (125%)");
    }
  };

  const toggleTheme = () => {
    const next = themeMode === "light" ? "dark" : "light";
    setThemeMode(next);
    showToast(next === "light" ? "☀️ ธีมสว่าง สไตล์ macOS เรียบหรู" : "🌙 ธีมมืด (Dark Mode)");
  };

  const syncWithGAS = async () => {
    if (!GAS_API_URL) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${GAS_API_URL}?action=init`);
      const data = await res.json();
      if (data.staffList && data.staffList.length > 0) {
        setStaffList((prev) => {
          const map = new Map(prev.map((s) => [s.Staff_ID, s]));
          data.staffList.forEach((s: StaffMember) => map.set(s.Staff_ID, s));
          return Array.from(map.values());
        });
      }
      if (data.instructorForms && data.instructorForms.length > 0) setInstructorForms(data.instructorForms);
      if (data.portfolioWorks && data.portfolioWorks.length > 0) setPortfolioWorks(data.portfolioWorks);
      if (data.executiveForms && data.executiveForms.length > 0) setExecutiveForms(data.executiveForms);
    } catch (e) {
      console.info("⚡ [GAS] กำลังใช้งานระบบ Real-time Local Cache");
    } finally {
      setIsSyncing(false);
    }
  };

  const postToGAS = async (payload: Record<string, unknown>) => {
    if (!GAS_API_URL) return;
    setIsSyncing(true);
    try {
      await fetch(GAS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("Data saved to local cache; GAS background sync queued.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth Handling
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const user = staffList.find(
      (s) =>
        s.Staff_ID.trim().toUpperCase() === loginStaffId.trim().toUpperCase() &&
        String(s.Password) === loginPassword.trim()
    );

    if (!user) {
      setLoginError("รหัสบุคลากรหรือรหัสผ่านไม่ถูกต้อง (เลือกคลิกรหัสทดสอบด้านล่างได้)");
      return;
    }

    if (loginModalRole && user.Role !== loginModalRole && user.Role !== "ADMIN") {
      setLoginError(`บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในส่วน "${loginModalRole}"`);
      return;
    }

    setCurrentUser(user);
    const target = loginModalRole || user.Role;
    setActiveView(target);
    setLoginModalRole(null);
    setLoginStaffId("");
    setLoginPassword("");
    showToast(`ยินดีต้อนรับ ${user.Full_Name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView("HOME");
    showToast("ออกจากระบบเรียบร้อยแล้ว");
  };

  const currentTeacherProfile = useMemo(() => {
    if (!currentUser) return null;
    return teachersList.find(
      (t) =>
        t.name.trim() === currentUser.Full_Name.trim() ||
        t.id.toUpperCase() === currentUser.Staff_ID.toUpperCase()
    );
  }, [currentUser, teachersList]);

  // ประวัติข้อมูลที่อาจารย์ท่านนี้เคยกรอกไว้ทั้งหมด
  const currentTeacherHistory = useMemo(() => {
    if (!currentUser) return [];
    return instructorForms.filter((f) => f.Staff_ID === currentUser.Staff_ID);
  }, [currentUser, instructorForms]);

  // ประวัติข้อมูลที่กรองตามหัวข้อและปีการศึกษา
  const filteredTeacherHistory = useMemo(() => {
    return currentTeacherHistory.filter((rec) => {
      const matchYear = selectedYearFilter === "ALL" || String(rec.Academic_Year) === selectedYearFilter;
      return matchYear;
    });
  }, [currentTeacherHistory, selectedYearFilter]);

  // Save Instructor Form
  const handleSaveInstructorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const recordId = editingRecordId || `REC-${instFormState.Academic_Year}-${Date.now().toString().slice(-4)}`;
    const newRecord: InstructorPlanRecord = {
      Record_ID: recordId,
      Staff_ID: currentUser.Staff_ID,
      Full_Name: currentUser.Full_Name,
      Department: currentUser.Department,
      Academic_Year: Number(instFormState.Academic_Year),
      Course_Code: instFormState.Course_Code,
      Course_Name: instFormState.Course_Name,
      Teaching_Method: instFormState.Teaching_Method,
      Target_KPI: instFormState.Target_KPI,
      Teaching_Summary: instFormState.Teaching_Summary,
      Research_Output: instFormState.Research_Output,
      Ebook_Planned: instFormState.Ebook_Planned,
      Self_Development: instFormState.Self_Development,
      Budget_Requested: instFormState.Budget_Requested,
      Additional_Notes: instFormState.Additional_Notes,
      Updated_At: new Date().toISOString().split("T")[0],
    };

    setInstructorForms((prev) => {
      const exists = prev.some((r) => r.Record_ID === recordId);
      return exists ? prev.map((r) => (r.Record_ID === recordId ? newRecord : r)) : [newRecord, ...prev];
    });

    postToGAS({
      action: "upsertInstructorForm",
      recordId: newRecord.Record_ID,
      staffId: newRecord.Staff_ID,
      fullName: newRecord.Full_Name,
      department: newRecord.Department,
      academicYear: newRecord.Academic_Year,
      courseCode: newRecord.Course_Code,
      courseName: newRecord.Course_Name,
      teachingMethod: newRecord.Teaching_Method,
      targetKpi: newRecord.Target_KPI,
      teachingSummary: newRecord.Teaching_Summary,
      researchOutput: newRecord.Research_Output,
      ebookPlanned: newRecord.Ebook_Planned,
      selfDevelopment: newRecord.Self_Development,
      budgetRequested: newRecord.Budget_Requested,
      additionalNotes: newRecord.Additional_Notes,
    });

    setEditingRecordId(null);
    setInstTab("SUMMARY");
    showToast(editingRecordId ? "แก้ไขข้อมูลแผนเรียบร้อยแล้ว" : "บันทึกแบบสำรวจเข้าสู่ระบบเรียบร้อยแล้ว");
  };

  const handleEditInstructorForm = (rec: InstructorPlanRecord) => {
    setEditingRecordId(rec.Record_ID);
    setInstFormState({
      Academic_Year: rec.Academic_Year,
      Course_Code: rec.Course_Code,
      Course_Name: rec.Course_Name,
      Teaching_Method: rec.Teaching_Method,
      Target_KPI: rec.Target_KPI,
      Teaching_Summary: rec.Teaching_Summary,
      Research_Output: rec.Research_Output,
      Ebook_Planned: rec.Ebook_Planned,
      Self_Development: rec.Self_Development || "",
      Budget_Requested: rec.Budget_Requested || "",
      Additional_Notes: rec.Additional_Notes,
    });
    setInstTab("FORM");
  };

  // Portfolio Handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setWorkFormState((prev) => ({
        ...prev,
        base64Data: base64,
        fileName: file.name,
        File_Or_Link_URL: prev.File_Or_Link_URL || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSavePortfolioWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const workId = editingWorkId || `WRK-EDU-${Date.now().toString().slice(-4)}`;
    const newWork: PortfolioWork = {
      Work_ID: workId,
      Staff_ID: currentUser.Staff_ID,
      Instructor_Name: currentUser.Full_Name,
      Department: currentUser.Department,
      Academic_Year: Number(workFormState.Academic_Year),
      Title: workFormState.Title,
      Category: workFormState.Category,
      Work_Type: workFormState.Work_Type,
      File_Or_Link_URL:
        workFormState.File_Or_Link_URL ||
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      Description: workFormState.Description,
      Is_Public: workFormState.Is_Public,
      Downloads: 0,
      Updated_At: new Date().toISOString().split("T")[0],
    };

    setPortfolioWorks((prev) => {
      const exists = prev.some((w) => w.Work_ID === workId);
      return exists ? prev.map((w) => (w.Work_ID === workId ? newWork : w)) : [newWork, ...prev];
    });

    postToGAS({
      action: "upsertPortfolioWork",
      workId: newWork.Work_ID,
      staffId: newWork.Staff_ID,
      instructorName: newWork.Instructor_Name,
      department: newWork.Department,
      academicYear: newWork.Academic_Year,
      title: newWork.Title,
      category: newWork.Category,
      workType: newWork.Work_Type,
      fileOrLinkUrl: newWork.File_Or_Link_URL,
      description: newWork.Description,
      isPublic: newWork.Is_Public,
      base64Data: workFormState.base64Data,
      fileName: workFormState.fileName,
    });

    setEditingWorkId(null);
    setWorkFormState({
      Academic_Year: 2570,
      Title: "",
      Category: "ตำรา / E-Book",
      Work_Type: "PDF",
      File_Or_Link_URL: "",
      Description: "",
      Is_Public: true,
      base64Data: "",
      fileName: "",
    });
    showToast(newWork.Is_Public ? "อัปโหลดและเปิดเผยแพร่สู่คลังสาธารณะแล้ว" : "บันทึกผลงานแบบส่วนตัวแล้ว");
  };

  const toggleWorkVisibility = (work: PortfolioWork) => {
    const nextPublic = !work.Is_Public;
    setPortfolioWorks((prev) =>
      prev.map((w) => (w.Work_ID === work.Work_ID ? { ...w, Is_Public: nextPublic } : w))
    );
    postToGAS({ action: "toggleWorkPublic", workId: work.Work_ID, isPublic: nextPublic });
    showToast(nextPublic ? "เปิดเผยแพร่ผลงานสู่คลังสาธารณะแล้ว" : "ซ่อนผลงานจากคลังสาธารณะแล้ว");
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPassword.length < 4) {
      showToast("กรุณาตั้งรหัสผ่านอย่างน้อย 4 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("รหัสผ่านยืนยันไม่ตรงกัน");
      return;
    }

    setStaffList((prev) =>
      prev.map((s) => (s.Staff_ID === currentUser.Staff_ID ? { ...s, Password: newPassword, Is_Default_Pwd: false } : s))
    );
    setCurrentUser({ ...currentUser, Password: newPassword, Is_Default_Pwd: false });
    postToGAS({ action: "changePassword", staffId: currentUser.Staff_ID, newPassword });
    setNewPassword("");
    setConfirmPassword("");
    showToast("เปลี่ยนรหัสผ่านสำเร็จแล้ว!");
  };

  // Save Executive Form
  const handleSaveExecutiveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const execId = editingExecId || `PLAN-EXEC-${Date.now().toString().slice(-4)}`;
    const newExec: ExecutivePlanRecord = {
      Exec_ID: execId,
      Staff_ID: currentUser.Staff_ID,
      Executive_Name: currentUser.Full_Name,
      Department: currentUser.Department,
      Academic_Year: Number(execFormState.Academic_Year),
      Curriculum_Status: execFormState.Curriculum_Status,
      Faculty_Count: Number(execFormState.Faculty_Count),
      Total_Graduates: Number(execFormState.Total_Graduates),
      Quality_Score: Number(execFormState.Quality_Score),
      Strategic_Plan_2570_2574: execFormState.Strategic_Plan_2570_2574,
      Budget_Needs: execFormState.Budget_Needs,
      Issues_Found: execFormState.Issues_Found,
      Updated_At: new Date().toISOString().split("T")[0],
    };

    setExecutiveForms((prev) => {
      const exists = prev.some((r) => r.Exec_ID === execId);
      return exists ? prev.map((r) => (r.Exec_ID === execId ? newExec : r)) : [newExec, ...prev];
    });

    postToGAS({
      action: "upsertExecutiveForm",
      execId: newExec.Exec_ID,
      staffId: newExec.Staff_ID,
      executiveName: newExec.Executive_Name,
      department: newExec.Department,
      academicYear: newExec.Academic_Year,
      curriculumStatus: newExec.Curriculum_Status,
      facultyCount: newExec.Faculty_Count,
      totalGraduates: newExec.Total_Graduates,
      qualityScore: newExec.Quality_Score,
      strategicPlan: newExec.Strategic_Plan_2570_2574,
      budgetNeeds: newExec.Budget_Needs,
      issuesFound: newExec.Issues_Found,
    });

    setEditingExecId(null);
    showToast(`บันทึกรายงานสรุปของ ${currentUser.Department} เรียบร้อยแล้ว`);
  };

  // Filters for Public Hub
  const availableTeachers = useMemo(() => {
    if (publicDeptFilter === "ALL") return teachersList;
    return teachersList.filter((t) => t.program === publicDeptFilter);
  }, [teachersList, publicDeptFilter]);

  const publicWorksFiltered = useMemo(() => {
    return portfolioWorks.filter((w) => {
      if (!w.Is_Public) return false;
      const matchDept = publicDeptFilter === "ALL" || w.Department === publicDeptFilter;
      const matchTeacher =
        publicTeacherFilter === "ALL" ||
        w.Instructor_Name.trim().toLowerCase().includes(publicTeacherFilter.trim().toLowerCase());
      const q = publicSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        w.Instructor_Name.toLowerCase().includes(q) ||
        w.Title.toLowerCase().includes(q) ||
        w.Department.toLowerCase().includes(q) ||
        String(w.Academic_Year).includes(q);
      return matchDept && matchTeacher && matchQuery;
    });
  }, [portfolioWorks, publicSearch, publicDeptFilter, publicTeacherFilter]);

  const publicTeachersFiltered = useMemo(() => {
    return teachersList.filter((t) => {
      const matchDept = publicDeptFilter === "ALL" || t.program === publicDeptFilter;
      const matchTeacher =
        publicTeacherFilter === "ALL" ||
        t.name.trim().toLowerCase() === publicTeacherFilter.trim().toLowerCase();
      const q = publicSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.program.toLowerCase().includes(q) ||
        t.degrees.some((d) => d.major.toLowerCase().includes(q) || d.institution.toLowerCase().includes(q));
      return matchDept && matchTeacher && matchQuery;
    });
  }, [teachersList, publicSearch, publicDeptFilter, publicTeacherFilter]);

  // Admin Chart Calculations
  const adminChartData = useMemo(() => {
    if (adminYearMode === "RANGE_2570_2574") {
      const years = [2570, 2571, 2572, 2573, 2574];
      return years.map((yr) => ({
        label: `พ.ศ. ${yr}`,
        formsCount: instructorForms.filter((f) => Number(f.Academic_Year) === yr).length,
        worksCount: portfolioWorks.filter((w) => Number(w.Academic_Year) === yr).length,
      }));
    }
    if (adminYearMode === "EVERY_5_YEARS") {
      const intervals = [
        { label: "2565-2569", start: 2565, end: 2569 },
        { label: "2570-2574", start: 2570, end: 2574 },
        { label: "2575-2579", start: 2575, end: 2579 },
      ];
      return intervals.map((intv) => ({
        label: intv.label,
        formsCount: instructorForms.filter(
          (f) => Number(f.Academic_Year) >= intv.start && Number(f.Academic_Year) <= intv.end
        ).length,
        worksCount: portfolioWorks.filter(
          (w) => Number(w.Academic_Year) >= intv.start && Number(w.Academic_Year) <= intv.end
        ).length,
      }));
    }
    return EDUCATION_PROGRAMS.map((prog) => ({
      label: prog.replace(/^สาขาวิชา/, ""),
      formsCount: instructorForms.filter(
        (f) => f.Department === prog && Number(f.Academic_Year) === Number(adminSelectedYear)
      ).length,
      worksCount: portfolioWorks.filter(
        (w) => w.Department === prog && Number(w.Academic_Year) === Number(adminSelectedYear)
      ).length,
    }));
  }, [adminYearMode, adminSelectedYear, instructorForms, portfolioWorks]);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDark 
        ? "bg-[#0C061F] text-purple-100 selection:bg-purple-900 selection:text-purple-100" 
        : "bg-[#FAF8FF] text-slate-900 selection:bg-purple-200 selection:text-purple-950"
    } antialiased`}>
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-purple-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-purple-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium tracking-wide">{toastMsg}</span>
        </div>
      )}

      {/* ====================================================================
          HEADER: Responsive Modern Royal Purple Theme Header
         ==================================================================== */}
      {activeView !== "ADMIN" && (
        <header className={`sticky top-0 z-30 transition-colors duration-300 ${
          isDark 
            ? "bg-[#0C061F]/90 backdrop-blur-md border-b border-purple-900/60 text-purple-100 shadow-[0_4px_25px_rgba(0,0,0,0.4)]" 
            : "bg-[#FAF8FF]/90 backdrop-blur-xl border-b border-purple-200/80 text-slate-900 shadow-[0_2px_15px_rgba(109,40,217,0.04)]"
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 py-3 flex items-center justify-between">
            {/* Left: macOS Traffic Lights + Logo & Title */}
            <div
              onClick={() => setActiveView("HOME")}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              {/* macOS Window Controls Dot Indicator */}
              <div className="hidden lg:flex items-center gap-1.5 mr-1" title="macOS Style Controls">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50 shadow-xs" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50 shadow-xs" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50 shadow-xs" />
              </div>

              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform ${
                isDark 
                  ? "bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-950 text-purple-200 border border-purple-500/40 shadow-purple-600/30" 
                  : "bg-gradient-to-br from-violet-600 to-purple-800 text-white border border-purple-400/30 shadow-purple-500/25"
              }`}>
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`font-extrabold text-base sm:text-lg tracking-tight font-serif ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}>
                    คณะศึกษาศาสตร์
                  </h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md hidden sm:inline-block ${
                    isDark
                      ? "bg-purple-950/90 text-purple-300 border border-purple-800/80"
                      : "bg-purple-100/80 text-purple-900 border border-purple-200"
                  }`}>
                    พ.ศ. 2570–2574
                  </span>
                </div>
                <p className={`text-xs font-normal truncate max-w-[220px] sm:max-w-none ${
                  isDark ? "text-purple-300/70" : "text-slate-500"
                }`}>
                  ระบบสารสนเทศยุทธศาสตร์ คลังผลงาน E-Book & ทำเนียบคณาจารย์ 12 สาขาวิชา
                </p>
              </div>
            </div>

            {/* Right: Accessibility Font Scaler + Theme Toggle + Auth */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* ปุ่มปรับขยายตัวอักษรสำหรับผู้สูงวัย / สายตาสั้น (Desktop & Tablet) */}
              <div className={`hidden sm:flex items-center rounded-xl p-1 border text-xs ${
                isDark 
                  ? "bg-[#180F35] border-purple-800/80 text-purple-200" 
                  : "bg-white border-purple-200/80 text-purple-900 shadow-xs"
              }`} title="ปรับขนาดตัวอักษรสำหรับผู้สูงอายุ / สายตาสั้น">
                <span className="text-[10px] font-bold px-1.5 text-purple-400 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> อักษร:
                </span>
                <button
                  type="button"
                  onClick={handleDecreaseFontSize}
                  disabled={fontSizeScale === "normal"}
                  className="px-2 py-1 rounded-lg hover:bg-black/10 disabled:opacity-30 font-bold transition-colors"
                  title="ลดขนาดตัวอักษร"
                >
                  ก-
                </button>
                <button
                  type="button"
                  onClick={handleToggleFontSize}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    fontSizeScale !== "normal" 
                      ? "bg-purple-600 text-white shadow-xs" 
                      : "hover:bg-black/10"
                  }`}
                  title="คลิกเพื่อสลับขนาดตัวอักษร (ปกติ -> ใหญ่ -> ใหญ่พิเศษ)"
                >
                  {fontSizeScale === "normal" ? "ปกติ" : fontSizeScale === "large" ? "ใหญ่ (115%)" : "ใหญ่พิเศษ (125%)"}
                </button>
                <button
                  type="button"
                  onClick={handleIncreaseFontSize}
                  disabled={fontSizeScale === "xlarge"}
                  className="px-2 py-1 rounded-lg hover:bg-black/10 disabled:opacity-30 font-bold transition-colors"
                  title="เพิ่มขนาดตัวอักษร"
                >
                  ก+
                </button>
              </div>

              {/* ปุ่มสลับธีม ☀️ สว่าง (Lavender) / 🌙 มืด (Amethyst) */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                  isDark
                    ? "bg-[#180F35] border-purple-800/80 text-amber-300 hover:bg-[#23154C]"
                    : "bg-white border-purple-200/80 text-purple-900 hover:bg-purple-50/80 shadow-xs"
                }`}
                title="สลับธีม สว่าง (Lavender) / มืด (Amethyst)"
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden md:inline">สว่าง (Lavender)</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-purple-600" />
                    <span className="hidden md:inline">มืด (Amethyst)</span>
                  </>
                )}
              </button>

              {/* Login / Dashboard Button */}
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveView(currentUser.Role)}
                    className={`text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors border ${
                      isDark 
                        ? "bg-purple-700 hover:bg-purple-600 text-white border-purple-600" 
                        : "bg-purple-950 hover:bg-purple-900 text-white border-purple-950 shadow-sm"
                    }`}
                  >
                    แดชบอร์ด: {currentUser.Full_Name.split(" ")[0]}
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`p-2 rounded-xl border transition-colors ${
                      isDark 
                        ? "border-purple-800/70 text-purple-300 hover:bg-red-950/60 hover:text-red-400" 
                        : "border-purple-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
                    }`}
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLoginModalRole("ADMIN")}
                  className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl border shadow-xs transition-all ${
                    isDark 
                      ? "border-purple-800/80 bg-[#180F35] hover:bg-[#23154C] text-purple-200" 
                      : "border-purple-200 bg-white hover:bg-purple-50/60 text-purple-950"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span className="hidden sm:inline">เจ้าหน้าที่แอดมิน</span>
                  <span className="sm:hidden">แอดมิน</span>
                </button>
              )}
            </div>
          </div>

          {/* แถบพิเศษสำหรับมือถือ: ปรับขยายตัวอักษร & สลับธีม (Mobile Quick Accessibility Bar) */}
          <div className={`sm:hidden px-4 py-2 border-t flex items-center justify-between text-xs transition-colors ${
            isDark 
              ? "bg-[#130A2A] border-purple-900/80 text-purple-200" 
              : "bg-purple-50/90 border-purple-200/80 text-purple-900"
          }`}>
            <div className="flex items-center gap-1">
              <span className="font-bold text-[11px] text-purple-400 mr-1 flex items-center gap-1">
                <Type className="w-3.5 h-3.5" /> อักษร:
              </span>
              <button
                type="button"
                onClick={handleDecreaseFontSize}
                disabled={fontSizeScale === "normal"}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs disabled:opacity-30 border ${
                  isDark ? "bg-[#1F1240] border-purple-800 text-purple-200" : "bg-white border-purple-200 shadow-xs text-purple-900"
                }`}
                title="ลดขนาดตัวอักษร"
              >
                ก-
              </button>
              <button
                type="button"
                onClick={handleToggleFontSize}
                className={`px-2.5 h-7 rounded-lg font-bold text-[11px] flex items-center justify-center transition-colors ${
                  fontSizeScale !== "normal" 
                    ? "bg-purple-600 text-white shadow-xs" 
                    : isDark ? "bg-[#1F1240] text-purple-300 border border-purple-800" : "bg-white text-purple-900 border border-purple-200"
                }`}
                title="สลับขนาดตัวอักษร"
              >
                {fontSizeScale === "normal" ? "ปกติ" : fontSizeScale === "large" ? "ใหญ่" : "ใหญ่มาก"}
              </button>
              <button
                type="button"
                onClick={handleIncreaseFontSize}
                disabled={fontSizeScale === "xlarge"}
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs disabled:opacity-30 border ${
                  isDark ? "bg-[#1F1240] border-purple-800 text-purple-200" : "bg-white border-purple-200 shadow-xs text-purple-900"
                }`}
                title="เพิ่มขนาดตัวอักษร"
              >
                ก+
              </button>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                isDark ? "bg-[#1F1240] border-purple-800 text-amber-300" : "bg-white border-purple-200 text-purple-900 shadow-xs"
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-purple-600" />}
              <span>{isDark ? "สว่าง" : "มืด"}</span>
            </button>
          </div>
        </header>
      )}

      {/* ====================================================================
          VIEW 1: หน้าหลัก (HOME) - macOS Light / Dark Mode Bento Grid
         ==================================================================== */}
      {activeView === "HOME" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">
          {/* Top Title & Quick Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className={`text-2xl sm:text-3xl font-black tracking-tight font-serif ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  ภาพรวมระบบ
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isSubmissionOpen 
                    ? isDark 
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80" 
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs"
                    : isDark 
                      ? "bg-amber-950/80 text-amber-400 border border-amber-800/80" 
                      : "bg-amber-50 text-amber-800 border border-amber-200 shadow-xs"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isSubmissionOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                  {isSubmissionOpen ? "เปิดรับแบบสำรวจ 2570–2574" : "ปิดรับชั่วคราว"}
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                ระบบสารสนเทศคณะศึกษาศาสตร์ แผนยุทธศาสตร์ พ.ศ. 2570–2574 & คลังผลงานวิชาการ 12 สาขาวิชา
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={SHEET_TEACHER_HISTORY_URL}
                target="_blank"
                rel="noreferrer"
                className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-colors ${
                  isDark 
                    ? "bg-[#162032] hover:bg-[#1E2C44] border-slate-700 text-slate-200" 
                    : "bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700 shadow-xs"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Google Sheet ฐานข้อมูล</span>
              </a>

              <button
                onClick={() => setLoginModalRole("ADMIN")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 ${
                  isDark 
                    ? "bg-white hover:bg-slate-100 text-slate-950" 
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>ผู้ดูแลระบบ</span>
              </button>
            </div>
          </div>

          {/* แถวที่ 1: การ์ด 2 ปุ่มหลักเด่นๆ (อาจารย์ผู้สอน & ผู้บริหาร) ตามรูปแนบ 1 */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* บัตร 1: อาจารย์ผู้สอน (Hero Prominent Card 1 - Royal Amethyst) */}
            <div
              onClick={() => {
                if (currentUser?.Role === "INSTRUCTOR") setActiveView("INSTRUCTOR");
                else setLoginModalRole("INSTRUCTOR");
              }}
              className={`group relative overflow-hidden rounded-3xl p-7 sm:p-8 text-white border-2 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[260px] ${
                isDark 
                  ? "bg-gradient-to-br from-[#4C1D95] via-[#2E1065] to-[#0E0624] border-purple-500/50 hover:border-purple-400 shadow-purple-950/90 hover:shadow-purple-600/30" 
                  : "bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#4C1D95] border-purple-300/60 hover:border-purple-200 shadow-xl shadow-purple-600/25 hover:shadow-purple-600/35"
              }`}
            >
              <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-purple-400/20 pointer-events-none blur-3xl" />
              <div className="absolute right-12 top-6 w-32 h-32 rounded-full bg-violet-400/25 pointer-events-none blur-2xl" />

              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 text-purple-100 flex items-center justify-center border border-white/30 backdrop-blur-xs">
                      <UserCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                        สำหรับอาจารย์ผู้สอน
                      </span>
                      <p className="text-xs text-purple-100/75">Faculty Member Portal</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white text-purple-950 font-black text-xs tracking-wider shadow-md">
                    EDU PASS
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight group-hover:text-purple-100 transition-colors">
                    1. เข้าสู่ระบบอาจารย์ผู้สอน
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-100/90 mt-2 leading-relaxed">
                    บันทึกและตรวจสอบประวัติข้อมูล 5 หมวดหมู่ • กรอกแบบสำรวจแผน 2570–2574 • อัปโหลดตำรา E-Book เผยแพร่สู่คลังสาธารณะ
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-purple-100/90 font-mono text-xs">
                  <span>รหัสบุคลากร:</span>
                  <span className="font-bold text-white bg-black/25 px-2 py-0.5 rounded border border-white/20">
                    EDU-001 ~ EDU-067
                  </span>
                </div>
                <button
                  type="button"
                  className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all group-hover:translate-x-1 ${
                    isDark 
                      ? "bg-purple-500 hover:bg-purple-400 text-white shadow-purple-500/30" 
                      : "bg-white hover:bg-purple-50 text-purple-950 shadow-black/10 font-black"
                  }`}
                >
                  <span>เข้าสู่ระบบอาจารย์</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* บัตร 2: ผู้บริหาร / หัวหน้าสาขา (Hero Prominent Card 2 - Imperial Plum) */}
            <div
              onClick={() => {
                if (currentUser?.Role === "EXECUTIVE") setActiveView("EXECUTIVE");
                else setLoginModalRole("EXECUTIVE");
              }}
              className={`group relative overflow-hidden rounded-3xl p-7 sm:p-8 text-white border-2 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[260px] ${
                isDark 
                  ? "bg-gradient-to-br from-[#701A75] via-[#4A044E] to-[#0E0624] border-fuchsia-500/50 hover:border-fuchsia-400 shadow-fuchsia-950/90 hover:shadow-fuchsia-600/30" 
                  : "bg-gradient-to-br from-[#86198F] via-[#9333EA] to-[#581C87] border-fuchsia-300/60 hover:border-fuchsia-200 shadow-xl shadow-fuchsia-600/25 hover:shadow-fuchsia-600/35"
              }`}
            >
              <div className="absolute -right-10 -bottom-10 w-52 h-52 rounded-full bg-fuchsia-400/20 pointer-events-none blur-3xl" />
              <div className="absolute right-12 top-6 w-32 h-32 rounded-full bg-purple-400/25 pointer-events-none blur-2xl" />

              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white/20 text-fuchsia-100 flex items-center justify-center border border-white/30 backdrop-blur-xs">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-200">
                        สำหรับผู้บริหาร
                      </span>
                      <p className="text-xs text-fuchsia-100/75">Department Executive Portal</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white text-fuchsia-950 font-black text-xs tracking-wider shadow-md">
                    EXEC PASS
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight group-hover:text-fuchsia-100 transition-colors">
                    2. เข้าสู่ระบบผู้บริหาร (หัวหน้าสาขา)
                  </h3>
                  <p className="text-xs sm:text-sm text-fuchsia-100/90 mt-2 leading-relaxed">
                    รายงานสรุปและประเมินผลเฉพาะสาขาวิชาของตนเองเท่านั้น (Department Isolation 100%) ครบทั้ง 12 สาขาวิชา
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-fuchsia-100/90 font-mono text-xs">
                  <span>สิทธิ์การเข้าถึง:</span>
                  <span className="font-bold text-white bg-black/25 px-2 py-0.5 rounded border border-white/20">
                    12 สาขาวิชา (แยกอิสระ)
                  </span>
                </div>
                <button
                  type="button"
                  className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all group-hover:translate-x-1 ${
                    isDark 
                      ? "bg-fuchsia-400 hover:bg-fuchsia-300 text-slate-950 font-black shadow-fuchsia-400/30" 
                      : "bg-white hover:bg-fuchsia-50 text-fuchsia-950 shadow-black/10 font-black"
                  }`}
                >
                  <span>เข้าสู่ระบบผู้บริหาร</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* แถวที่ 2: สถิติภาพรวม 4 บล็อก (ไม่เด่นมาก สุขุมมินิมอล เน้นมือถือ) ตามรูปแนบ 2 */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className={`rounded-2xl p-4 flex flex-col justify-between min-h-[95px] sm:min-h-[105px] border transition-colors ${
              isDark 
                ? "bg-[#160D33]/90 border-purple-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-purple-100" 
                : "bg-white/95 border-purple-100 shadow-[0_2px_12px_rgba(109,40,217,0.03)] text-slate-800"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] sm:text-xs font-medium ${isDark ? "text-purple-300" : "text-slate-500"}`}>หัวข้อแบบสำรวจ</span>
                <span className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
              <div>
                <p className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-purple-950"}`}>5 ด้าน</p>
                <p className={`text-[10px] mt-0.5 truncate ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>การสอน • วิจัย • E-Book</p>
              </div>
            </div>

            <div className={`rounded-2xl p-4 flex flex-col justify-between min-h-[95px] sm:min-h-[105px] border transition-colors ${
              isDark 
                ? "bg-[#160D33]/90 border-purple-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-purple-100" 
                : "bg-white/95 border-purple-100 shadow-[0_2px_12px_rgba(109,40,217,0.03)] text-slate-800"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] sm:text-xs font-medium ${isDark ? "text-purple-300" : "text-slate-500"}`}>คณาจารย์ประจำคณะ</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </div>
              <div>
                <p className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-purple-950"}`}>67 ท่าน</p>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>ครบทั้ง 12 สาขาวิชา</p>
              </div>
            </div>

            <div className={`rounded-2xl p-4 flex flex-col justify-between min-h-[95px] sm:min-h-[105px] border transition-colors ${
              isDark 
                ? "bg-[#160D33]/90 border-purple-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-purple-100" 
                : "bg-white/95 border-purple-100 shadow-[0_2px_12px_rgba(109,40,217,0.03)] text-slate-800"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] sm:text-xs font-medium ${isDark ? "text-purple-300" : "text-slate-500"}`}>คลัง E-Book สาธารณะ</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div>
                <p className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-purple-950"}`}>
                  {portfolioWorks.filter((w) => w.Is_Public).length} เล่ม
                </p>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>เปิดให้อ่าน Flip Reader ฟรี</p>
              </div>
            </div>

            <div className={`rounded-2xl p-4 flex flex-col justify-between min-h-[95px] sm:min-h-[105px] border transition-colors ${
              isDark 
                ? "bg-[#160D33]/90 border-purple-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-purple-100" 
                : "bg-white/95 border-purple-100 shadow-[0_2px_12px_rgba(109,40,217,0.03)] text-slate-800"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] sm:text-xs font-medium ${isDark ? "text-purple-300" : "text-slate-500"}`}>สถานะแบบสำรวจ</span>
                <span className={`w-2 h-2 rounded-full ${isSubmissionOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
              </div>
              <div>
                <p className={`text-lg sm:text-xl font-bold ${isDark ? "text-white" : "text-purple-950"}`}>
                  {isSubmissionOpen ? "เปิดรับข้อมูล" : "ปิดรับชั่วคราว"}
                </p>
                <p className={`text-[10px] mt-0.5 ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>Google Sheets Real-time</p>
              </div>
            </div>
          </section>

          {/* แถวที่ 3: แถบผู้ดูแลระบบ (Admin) แบบกระชับ ไม่เด่นเกินไป ตามรูปแนบ 3 */}
          <div
            onClick={() => setLoginModalRole("ADMIN")}
            className={`p-3 sm:p-3.5 rounded-2xl border flex items-center justify-between text-xs sm:text-sm cursor-pointer transition-all ${
              isDark 
                ? "bg-[#160D33]/90 border-purple-900/60 hover:border-purple-700 hover:bg-[#201447] text-purple-300 hover:text-white" 
                : "bg-white/95 border-purple-200/70 hover:bg-purple-50/60 text-purple-900 hover:text-purple-950 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
              <span className="truncate">
                <strong className={isDark ? "text-purple-100" : "text-purple-950"}>ศูนย์ดูแลระบบ (Admin Command):</strong> จัดการสิทธิ์บุคลากร • เปิด/ปิดรับแบบสำรวจ • วิเคราะห์กราฟสรุปภาพรวม 2570–2574
              </span>
            </div>
            <span className={`text-xs font-bold flex items-center gap-1 shrink-0 ml-2 ${
              isDark ? "text-purple-300" : "text-purple-700"
            }`}>
              เข้าสู่ระบบแอดมิน <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* แถวที่ 4: สรุป 5 หัวข้อ และ แผนปฏิบัติราชการ (มินิมอล เน้นมือถือ) ตามรูปแนบ 4 */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ฝั่งซ้าย: กล่องสรุปประวัติ 5 หัวข้อ */}
            <div className={`lg:col-span-7 rounded-3xl p-5 sm:p-6 border flex flex-col justify-between transition-colors ${
              isDark 
                ? "bg-[#160D33] border-purple-900/60 text-purple-100 shadow-xl" 
                : "bg-white/95 border-purple-200/70 text-slate-900 shadow-sm"
            }`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-extrabold text-base sm:text-lg font-serif ${isDark ? "text-white" : "text-purple-950"}`}>
                    สรุปประวัติข้อมูล 5 หัวข้อยุทธศาสตร์
                  </h3>
                  <a
                    href={SHEET_TEACHER_HISTORY_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs font-bold inline-flex items-center gap-1 ${
                      isDark ? "text-purple-300 hover:text-purple-200" : "text-purple-700 hover:text-purple-900"
                    }`}
                  >
                    <span>ดูชีตประวัติกลาง</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* List Items สะอาดตา เหมาะกับมือถือ */}
                <div className="space-y-2.5">
                  <div className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                    isDark ? "bg-[#1E1242] border-purple-800/50" : "bg-purple-50/50 border-purple-200/60 hover:bg-purple-100/60"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        isDark ? "bg-purple-900/60 text-purple-300 border-purple-700" : "bg-purple-100 text-purple-800 border-purple-300"
                      }`}>
                        1
                      </div>
                      <div>
                        <h4 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          ด้านการจัดการเรียนรู้ Active Learning
                        </h4>
                        <p className={`text-[11px] ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>
                          สถิติรายวิชา, โครงงานฐานวิจัย (PBL) และผลสัมฤทธิ์
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded hidden sm:inline-block ${
                      isDark ? "text-purple-300 bg-purple-950/80 border border-purple-800/80" : "text-purple-800 bg-purple-100/80"
                    }`}>
                      2570–2574
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                    isDark ? "bg-[#1E1242] border-purple-800/50" : "bg-purple-50/50 border-purple-200/60 hover:bg-purple-100/60"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        isDark ? "bg-fuchsia-900/60 text-fuchsia-300 border-fuchsia-700" : "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300"
                      }`}>
                        2
                      </div>
                      <div>
                        <h4 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          ด้านการผลิตตำรา / หนังสือ E-Book
                        </h4>
                        <p className={`text-[11px] ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>
                          แผนการผลิตสื่อตำรา นวัตกรรมดิจิทัลเพื่อการเรียนรู้
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded hidden sm:inline-block ${
                      isDark ? "text-fuchsia-300 bg-fuchsia-950/80 border border-fuchsia-800/80" : "text-fuchsia-800 bg-fuchsia-100/80"
                    }`}>
                      E-Book Store
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                    isDark ? "bg-[#1E1242] border-purple-800/50" : "bg-purple-50/50 border-purple-200/60 hover:bg-purple-100/60"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        isDark ? "bg-indigo-900/60 text-indigo-300 border-indigo-700" : "bg-indigo-100 text-indigo-800 border-indigo-300"
                      }`}>
                        3
                      </div>
                      <div>
                        <h4 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          ด้านงานวิจัยและการตีพิมพ์วิชาการ
                        </h4>
                        <p className={`text-[11px] ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>
                          ระดับชาติและนานาชาติ TCI Tier 1, Scopus
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded hidden sm:inline-block ${
                      isDark ? "text-indigo-300 bg-indigo-950/80 border border-indigo-800/80" : "text-indigo-800 bg-indigo-100/80"
                    }`}>
                      วิจัยคณะ
                    </span>
                  </div>

                  <div className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                    isDark ? "bg-[#1E1242] border-purple-800/50" : "bg-purple-50/50 border-purple-200/60 hover:bg-purple-100/60"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ${
                        isDark ? "bg-violet-900/60 text-violet-300 border-violet-700" : "bg-violet-100 text-violet-800 border-violet-300"
                      }`}>
                        4
                      </div>
                      <div>
                        <h4 className={`text-xs sm:text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          ด้านการพัฒนาตนเองและขอตำแหน่งวิชาการ
                        </h4>
                        <p className={`text-[11px] ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>
                          ผศ., รศ., ศ. และกรอบงบประมาณที่ขอสนับสนุน
                        </p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded hidden sm:inline-block ${
                      isDark ? "text-violet-300 bg-violet-950/80 border border-violet-800/80" : "text-violet-800 bg-violet-100/80"
                    }`}>
                      ยุทธศาสตร์
                    </span>
                  </div>
                </div>
              </div>

              <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                isDark ? "border-purple-900/50" : "border-purple-100"
              }`}>
                <span className={`truncate mr-2 ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>
                  อาจารย์สามารถเข้าสู่ระบบเพื่อดูข้อมูลและแก้ไขประวัติของท่าน
                </span>
                <button
                  onClick={() => setLoginModalRole("INSTRUCTOR")}
                  className="font-bold px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors shrink-0 shadow-xs"
                >
                  เข้าสู่ระบบอาจารย์
                </button>
              </div>
            </div>

            {/* ฝั่งขวา: แผนปฏิบัติราชการ */}
            <div className={`lg:col-span-5 rounded-3xl p-5 sm:p-6 border flex flex-col justify-between relative overflow-hidden transition-colors ${
              isDark 
                ? "bg-[#160D33] border-purple-900/60 text-purple-100 shadow-xl" 
                : "bg-white/95 border-purple-200/70 text-slate-900 shadow-sm"
            }`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1.5 pr-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block border ${
                    isDark 
                      ? "text-purple-300 bg-purple-950/80 border-purple-800/80" 
                      : "text-purple-800 bg-purple-100 border-purple-200"
                  }`}>
                    รอบการจัดทำแผนยุทธศาสตร์
                  </span>
                  <h3 className={`text-xl sm:text-2xl font-black font-serif pt-1 ${isDark ? "text-white" : "text-purple-950"}`}>
                    แผนปฏิบัติราชการ
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-purple-200/70" : "text-slate-600"}`}>
                    แบบสำรวจสำหรับคณาจารย์และหัวหน้าสาขาวิชา 12 สาขาวิชา คณะศึกษาศาสตร์ มหาวิทยาลัย
                  </p>
                </div>

                <div className={`w-16 h-16 rounded-2xl border shadow-xs flex flex-col items-center justify-center shrink-0 ${
                  isDark ? "bg-[#241550] border-purple-700 text-purple-300" : "bg-purple-100/80 border-purple-200 text-purple-900"
                }`}>
                  <span className="text-2xl font-black leading-none">5</span>
                  <span className={`text-[10px] font-bold mt-0.5 ${isDark ? "text-purple-300/70" : "text-purple-600"}`}>ปีการศึกษา</span>
                </div>
              </div>

              <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? "border-purple-900/50" : "border-purple-100"
              }`}>
                <div className={`text-xs ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>
                  <span className={`font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>● Google Apps Script</span> ซิงค์ข้อมูล Real-time
                </div>
                <button
                  onClick={() => {
                    if (currentUser?.Role === "INSTRUCTOR") setActiveView("INSTRUCTOR");
                    else setLoginModalRole("INSTRUCTOR");
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition-all text-center ${
                    isDark 
                      ? "bg-purple-700 hover:bg-purple-600 text-white border-purple-600 shadow-xs" 
                      : "bg-purple-950 hover:bg-purple-900 text-white border-purple-950 shadow-xs"
                  }`}
                >
                  กรอกข้อมูลแผน 2570–2574
                </button>
              </div>
            </div>
          </section>

          {/* ================================================================
              คลังข้อมูลสาธารณะ (PUBLIC REPOSITORY - ไม่ต้องล็อกอิน)
             ================================================================ */}
          {/* ================================================================
              คลังข้อมูลสาธารณะ (PUBLIC REPOSITORY - ไม่ต้องล็อกอิน) ตามรูปแนบ 5
             ================================================================ */}
          <section className={`rounded-3xl p-6 sm:p-8 border shadow-xl space-y-6 transition-colors ${
            isDark 
              ? "bg-[#160D33] border-purple-900/70 text-purple-100 shadow-2xl" 
              : "bg-white/95 border-purple-200/70 text-slate-900 shadow-[0_4px_30px_rgba(109,40,217,0.05)]"
          }`}>
            <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-6 ${
              isDark ? "border-purple-900/60" : "border-purple-100"
            }`}>
              <div>
                <div className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border ${
                  isDark 
                    ? "text-purple-300 bg-purple-950/80 border-purple-800" 
                    : "text-purple-900 bg-purple-100 border-purple-300"
                }`}>
                  <Library className="w-3.5 h-3.5 text-purple-500" />
                  <span>Public Knowledge Repository • เปิดเผยสาธารณะสำหรับนักศึกษาและบุคคลทั่วไป</span>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold mt-2 font-serif ${
                  isDark ? "text-white" : "text-purple-950"
                }`}>
                  คลังผลงานวิชาการ E-Book และทำเนียบคณาจารย์ คณะศึกษาศาสตร์
                </h2>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-purple-300/70" : "text-slate-500"}`}>
                  สืบค้นผลงานวิชาการ ตำรา E-Book และข้อมูลคุณวุฒิคณาจารย์ 67 ท่าน (12 สาขาวิชา) เปิดอ่านหรือดาวน์โหลดได้ทันที
                </p>
              </div>

              {/* แท็บสลับ E-Book vs ทำเนียบคุณวุฒิ */}
              <div className={`flex p-1 rounded-2xl border shrink-0 ${
                isDark ? "bg-[#1F1347] border-purple-900/80" : "bg-purple-50 border-purple-200/80"
              }`}>
                <button
                  onClick={() => setPublicHubTab("EBOOKS")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    publicHubTab === "EBOOKS"
                      ? "bg-purple-600 text-white shadow-sm font-bold"
                      : isDark ? "text-purple-300/70 hover:text-white" : "text-purple-900/70 hover:text-purple-950"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>คลัง E-Book ({publicWorksFiltered.length})</span>
                </button>
                <button
                  onClick={() => setPublicHubTab("FACULTY")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    publicHubTab === "FACULTY"
                      ? "bg-purple-600 text-white shadow-sm font-bold"
                      : isDark ? "text-purple-300/70 hover:text-white" : "text-purple-900/70 hover:text-purple-950"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>ทำเนียบอาจารย์ ({publicTeachersFiltered.length})</span>
                </button>
              </div>
            </div>

            {/* แผงควบคุมการค้นหา 3 ช่องทาง (ตามรูปแนบ 5: ค้นหาง่าย มีให้เลือกรายชื่ออาจารย์ หรือจะเลือกเป็นสาขาก็ได้) */}
            <div className={`space-y-3.5 p-4 sm:p-5 rounded-2xl border ${
              isDark ? "bg-[#1B103E]/80 border-purple-900/70" : "bg-purple-50/50 border-purple-200/70"
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* 1. กล่องพิมพ์ค้นหาอิสระ (4 คอลัมน์) */}
                <div className="md:col-span-4 relative">
                  <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={publicSearch}
                    onChange={(e) => setPublicSearch(e.target.value)}
                    placeholder="พิมพ์คำค้น (ชื่อ, ตำรา, สถาบัน)..."
                    className={`w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      isDark 
                        ? "border-purple-800/80 bg-[#12092C] text-white placeholder-purple-400/50 focus:bg-[#1A0E3C]" 
                        : "border-purple-200 bg-white text-slate-900 placeholder-purple-300 focus:bg-white shadow-xs"
                    }`}
                  />
                  {publicSearch && (
                    <button
                      onClick={() => setPublicSearch("")}
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${
                        isDark ? "text-purple-400 hover:text-white" : "text-purple-400 hover:text-purple-700"
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* 2. ดรอปดาวน์เลือกตามสาขาวิชา (4 คอลัมน์) */}
                <div className="md:col-span-4 relative">
                  <select
                    value={publicDeptFilter}
                    onChange={(e) => {
                      setPublicDeptFilter(e.target.value);
                      setPublicTeacherFilter("ALL");
                    }}
                    className={`w-full pl-3.5 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      isDark 
                        ? "border-purple-800/80 bg-[#12092C] text-white focus:bg-[#1A0E3C]" 
                        : "border-purple-200 bg-white text-slate-900 focus:bg-white shadow-xs"
                    }`}
                  >
                    <option value="ALL">🏢 ทุกสาขาวิชา (12 สาขา)</option>
                    {EDUCATION_PROGRAMS.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. ดรอปดาวน์เลือกรายชื่ออาจารย์ (4 คอลัมน์) */}
                <div className="md:col-span-4 relative">
                  <select
                    value={publicTeacherFilter}
                    onChange={(e) => setPublicTeacherFilter(e.target.value)}
                    className={`w-full pl-3.5 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      isDark 
                        ? "border-purple-800/80 bg-[#12092C] text-white focus:bg-[#1A0E3C]" 
                        : "border-purple-200 bg-white text-slate-900 focus:bg-white shadow-xs"
                    }`}
                  >
                    <option value="ALL">
                      👨‍🏫 เลือกรายชื่ออาจารย์ ({availableTeachers.length} ท่าน)
                    </option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} — {t.program.replace(/^สาขาวิชา/, "")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* แถบปุ่มลัดเลือกสาขาวิชาแบบสไลด์บนมือถือ (Quick Pick Filter Chips) */}
              <div className={`pt-2 border-t ${isDark ? "border-purple-900/60" : "border-purple-200/70"}`}>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
                  <span className={`text-[11px] font-bold shrink-0 mr-1 flex items-center gap-1 ${
                    isDark ? "text-purple-400" : "text-purple-600"
                  }`}>
                    <Filter className="w-3 h-3" /> สาขา:
                  </span>
                  <button
                    onClick={() => {
                      setPublicDeptFilter("ALL");
                      setPublicTeacherFilter("ALL");
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 ${
                      publicDeptFilter === "ALL"
                        ? "bg-purple-600 text-white shadow-xs"
                        : isDark ? "bg-[#12092C] text-purple-300 hover:text-white border border-purple-900" : "bg-white text-purple-900 hover:text-purple-950 border border-purple-200 shadow-xs"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {EDUCATION_PROGRAMS.map((prog) => {
                    const shortName = prog.replace(/^สาขาวิชา/, "");
                    const isSelected = publicDeptFilter === prog;
                    return (
                      <button
                        key={prog}
                        onClick={() => {
                          setPublicDeptFilter(prog);
                          setPublicTeacherFilter("ALL");
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                          isSelected
                            ? "bg-purple-600 text-white font-bold shadow-xs"
                            : isDark ? "bg-[#12092C] text-purple-300 hover:text-white border border-purple-900" : "bg-white text-purple-900 hover:text-purple-950 border border-purple-200 shadow-xs"
                        }`}
                      >
                        {shortName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* แถบแจ้งสถานะการกรอง และปุ่มรีเซ็ตใน 1 คลิก */}
              {(publicDeptFilter !== "ALL" || publicTeacherFilter !== "ALL" || publicSearch) && (
                <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs ${
                  isDark ? "border-purple-900/50 text-purple-200" : "border-purple-200/80 text-purple-900"
                }`}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={isDark ? "text-purple-400" : "text-purple-600"}>กำลังกรอง:</span>
                    {publicDeptFilter !== "ALL" && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${
                        isDark ? "bg-purple-950 text-purple-300 border-purple-800" : "bg-purple-100 text-purple-800 border-purple-200"
                      }`}>
                        สาขา: {publicDeptFilter}
                        <button
                          onClick={() => {
                            setPublicDeptFilter("ALL");
                            setPublicTeacherFilter("ALL");
                          }}
                          className="hover:opacity-75"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                    {publicTeacherFilter !== "ALL" && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${
                        isDark ? "bg-fuchsia-950 text-fuchsia-300 border-fuchsia-800" : "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200"
                      }`}>
                        อาจารย์: {publicTeacherFilter}
                        <button
                          onClick={() => setPublicTeacherFilter("ALL")}
                          className="hover:opacity-75"
                        >
                          ✕
                        </button>
                      </span>
                    )}
                    {publicSearch && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] border ${
                        isDark ? "bg-violet-950 text-violet-300 border-violet-800" : "bg-violet-100 text-violet-800 border-violet-200"
                      }`}>
                        คำค้น: "{publicSearch}"
                        <button onClick={() => setPublicSearch("")} className="hover:opacity-75">
                          ✕
                        </button>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setPublicSearch("");
                      setPublicDeptFilter("ALL");
                      setPublicTeacherFilter("ALL");
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors border ${
                      isDark 
                        ? "bg-[#241550] hover:bg-[#2D1B63] text-purple-200 hover:text-white border-purple-700" 
                        : "bg-white hover:bg-purple-50 text-purple-900 hover:text-purple-950 border-purple-200 shadow-xs"
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>ล้างตัวกรองทั้งหมด</span>
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: E-Books */}
            {publicHubTab === "EBOOKS" && (
              <div>
                {publicWorksFiltered.length === 0 ? (
                  <div className={`text-center py-16 border border-dashed rounded-3xl ${
                    isDark ? "text-purple-400 border-purple-900" : "text-purple-400 border-purple-200"
                  }`}>
                    <BookOpen className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                    <p className={`font-bold text-sm ${isDark ? "text-purple-200" : "text-purple-950"}`}>ไม่พบผลงานที่ตรงกับเงื่อนไข</p>
                    <p className={`text-xs mt-1 ${isDark ? "text-purple-400" : "text-slate-400"}`}>ลองเปลี่ยนคำค้นหา หรือเลือกสาขาวิชาอื่น</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicWorksFiltered.map((work) => (
                      <div
                        key={work.Work_ID}
                        onClick={() => {
                          setSelectedWorkModal(work);
                          setEbookPage(1);
                        }}
                        className={`group rounded-3xl border p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                          isDark 
                            ? "border-purple-900/70 bg-[#1C1141] hover:bg-[#231552] hover:shadow-2xl hover:border-purple-700" 
                            : "border-purple-100 bg-white hover:bg-purple-50/40 hover:shadow-xl hover:border-purple-300 shadow-xs"
                        }`}
                      >
                        <div>
                          {/* ปกหนังสือ E-Book สมจริง */}
                          <div
                            className={`h-44 rounded-2xl p-5 flex flex-col justify-between mb-4 relative overflow-hidden shadow-sm ${
                              work.Work_Type === "PDF"
                                ? "bg-gradient-to-br from-[#2E1065] via-[#4C1D95] to-[#1E1B4B] text-white border border-purple-500/30"
                                : "bg-gradient-to-br from-[#701A75] via-[#86198F] to-[#2E1065] text-white border border-fuchsia-500/30"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm font-semibold">
                                {work.Work_Type === "PDF" ? "📖 PDF E-Book" : "🔗 Live Stream"}
                              </span>
                              <span className="opacity-75 font-mono">พ.ศ. {work.Academic_Year}</span>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-purple-300 font-bold">
                                {work.Department}
                              </p>
                              <h4 className="font-bold text-base line-clamp-2 mt-0.5 leading-snug font-serif text-white">
                                {work.Title}
                              </h4>
                            </div>
                          </div>

                          <div className={`flex items-center gap-2 text-xs font-bold mb-2 ${
                            isDark ? "text-purple-100" : "text-purple-950"
                          }`}>
                            <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>อาจารย์: {work.Instructor_Name}</span>
                          </div>
                          <p className={`text-xs line-clamp-2 leading-relaxed ${
                            isDark ? "text-purple-300/70" : "text-slate-600"
                          }`}>
                            {work.Description}
                          </p>
                        </div>

                        <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                          isDark ? "border-purple-900/50 text-purple-200" : "border-purple-100 text-purple-900"
                        }`}>
                          <span className={`flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ${
                            isDark ? "text-purple-400" : "text-purple-600"
                          }`}>
                            <Eye className="w-3.5 h-3.5" />
                            {work.Work_Type === "PDF" ? "เปิดอ่าน E-Book / ดาวน์โหลด" : "พรีวิวลิงก์"}
                          </span>
                          <span className={`font-normal ${isDark ? "text-purple-400" : "text-slate-400"}`}>
                            โหลด {work.Downloads} ครั้ง
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ทำเนียบคณาจารย์ 67 ท่าน */}
            {publicHubTab === "FACULTY" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {publicTeachersFiltered.map((teacher) => (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacherModal(teacher)}
                    className={`group rounded-3xl border p-5 transition-all cursor-pointer flex flex-col justify-between ${
                      isDark 
                        ? "border-purple-900/70 bg-[#1C1141] hover:bg-[#231552] hover:shadow-2xl hover:border-purple-700" 
                        : "border-purple-100 bg-white hover:bg-purple-50/40 hover:shadow-xl hover:border-purple-300 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm border group-hover:scale-105 transition-transform ${
                          isDark 
                            ? "bg-[#281758] text-purple-300 border-purple-700" 
                            : "bg-purple-100 text-purple-800 border-purple-200/80"
                        }`}>
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                          isDark 
                            ? "bg-[#12092C] text-purple-300 border-purple-800" 
                            : "bg-purple-50 text-purple-800 border-purple-200"
                        }`}>
                          {teacher.id}
                        </span>
                      </div>

                      <h4 className={`font-bold text-base mt-3 font-serif transition-colors ${
                        isDark ? "text-white group-hover:text-purple-300" : "text-slate-900 group-hover:text-purple-700"
                      }`}>
                        {teacher.name}
                      </h4>
                      <p className={`text-xs font-semibold mt-0.5 ${
                        isDark ? "text-purple-300/70" : "text-slate-500"
                      }`}>
                        {teacher.program}
                      </p>

                      <div className={`mt-3 space-y-1.5 border-t pt-3 ${
                        isDark ? "border-purple-900/50" : "border-purple-100"
                      }`}>
                        {teacher.degrees.map((d, idx) => (
                          <div key={idx} className={`text-xs flex items-start gap-1.5 ${
                            isDark ? "text-purple-200/80" : "text-slate-600"
                          }`}>
                            <span className={`font-bold shrink-0 ${isDark ? "text-purple-300" : "text-purple-700"}`}>• {d.level}:</span>
                            <span className="truncate" title={`${d.degree} (${d.major}) - ${d.institution}`}>
                              {d.degree} {d.major ? `(${d.major})` : ""} - {d.institution}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                      isDark ? "border-purple-900/50 text-purple-400" : "border-purple-100 text-purple-600"
                    }`}>
                      <span>ดูประวัติ & ผลงาน E-Book</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* ====================================================================
          VIEW 2: ระบบอาจารย์ผู้สอน (INSTRUCTOR PORTAL)
         ==================================================================== */}
      {activeView === "INSTRUCTOR" && currentUser && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Header อาจารย์ */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-900 text-amber-300">
                  {currentUser.Staff_ID}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                  {currentUser.Department}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-serif">
                {currentUser.Full_Name}
              </h2>

              {currentTeacherProfile && (
                <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                  {currentTeacherProfile.degrees.map((deg, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-600">
                      🎓 {deg.level} ({deg.degree}): {deg.institution}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* แถบเมนูย่อยของอาจารย์ */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInstTab("SUMMARY")}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  instTab === "SUMMARY"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>1. สรุปประวัติที่เคยกรอก ({currentTeacherHistory.length})</span>
              </button>

              {/* ปุ่มกรอกข้อมูล (จะเปิดให้กดได้เมื่อแอดมินเปิดระบบรับข้อมูล) */}
              {isSubmissionOpen ? (
                <button
                  onClick={() => {
                    setEditingRecordId(null);
                    setInstTab("FORM");
                  }}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    instTab === "FORM"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>2. กรอกแบบสำรวจแผน 2570–2574</span>
                </button>
              ) : (
                <div className="px-3.5 py-2 rounded-2xl bg-slate-100 text-slate-400 text-xs font-bold flex items-center gap-1.5 border border-slate-200 cursor-not-allowed">
                  <Lock className="w-3.5 h-3.5" />
                  <span>ระบบปิดรับแบบสำรวจ</span>
                </div>
              )}

              <button
                onClick={() => setInstTab("PORTFOLIO")}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  instTab === "PORTFOLIO"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>3. อัปโหลด E-Book</span>
              </button>

              <button
                onClick={() => setInstTab("PASSWORD")}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  instTab === "PASSWORD"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>เปลี่ยนรหัสผ่าน</span>
              </button>
            </div>
          </div>

          {/* ====================================================================
              แท็บ 1: สรุปข้อมูลประวัติที่อาจารย์เคยกรอกไว้ แยกตาม 5 หัวข้อ
             ==================================================================== */}
          {instTab === "SUMMARY" && (
            <div className="space-y-6">
              {/* แถบหัวเรื่อง + ฟิลเตอร์ปี */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 font-serif">
                    สรุปประวัติข้อมูลแผนและการจัดการเรียนการสอนที่คุณเคยบันทึกไว้
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    จัดหมวดหมู่แยกตามแต่ละหัวข้อของแบบสำรวจ เพื่อให้ตรวจสอบและนำไปใช้อ้างอิงได้สะดวก
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600">กรองปีการศึกษา:</span>
                  <select
                    value={selectedYearFilter}
                    onChange={(e) => setSelectedYearFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                  >
                    <option value="ALL">ทุกปีการศึกษา</option>
                    <option value="2571">พ.ศ. 2571</option>
                    <option value="2570">พ.ศ. 2570</option>
                    <option value="2569">พ.ศ. 2569</option>
                    <option value="2568">พ.ศ. 2568</option>
                  </select>
                </div>
              </div>

              {/* การ์ดแยกแต่ละหัวข้อ 5 หัวข้อหลัก */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SURVEY_TOPICS.map((topic, idx) => {
                  const icons = [BookOpen, Lightbulb, BookMarked, Compass, DollarSign];
                  const Icon = icons[idx] || FileText;

                  return (
                    <div
                      key={topic.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {topic.badge}
                          </span>
                        </div>
                        <h4 className="font-bold text-base text-slate-900 mt-3 font-serif">
                          {topic.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {topic.desc}
                        </p>

                        {/* สรุปข้อมูลย่อในหัวข้อนี้จากประวัติที่เคยกรอก */}
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                          {filteredTeacherHistory.length === 0 ? (
                            <p className="text-slate-400 italic">ยังไม่มีข้อมูลในรอบปีที่เลือก</p>
                          ) : (
                            filteredTeacherHistory.map((rec) => (
                              <div key={rec.Record_ID} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span>พ.ศ. {rec.Academic_Year} ({rec.Course_Code})</span>
                                  <span className="text-[10px] text-slate-400">{rec.Updated_At}</span>
                                </div>
                                {topic.id === "TEACHING" && (
                                  <p className="text-slate-600 line-clamp-2">
                                    {rec.Course_Name}: {rec.Teaching_Method} (KPI: {rec.Target_KPI})
                                  </p>
                                )}
                                {topic.id === "RESEARCH" && (
                                  <p className="text-slate-600 line-clamp-2">
                                    {rec.Research_Output || "ไม่มีข้อมูลวิจัยระบุ"}
                                  </p>
                                )}
                                {topic.id === "EBOOK" && (
                                  <p className="text-slate-600 line-clamp-2">
                                    {rec.Ebook_Planned || "ไม่มีแผนจัดทำสื่อระบุ"}
                                  </p>
                                )}
                                {topic.id === "DEVELOPMENT" && (
                                  <p className="text-slate-600 line-clamp-2">
                                    {rec.Self_Development || "ไม่มีข้อมูลพัฒนาตนเองระบุ"}
                                  </p>
                                )}
                                {topic.id === "BUDGET" && (
                                  <p className="text-slate-600 line-clamp-2">
                                    {rec.Budget_Requested || rec.Additional_Notes || "ไม่มีรายการงบประมาณระบุ"}
                                  </p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ตารางรายละเอียดฉบับเต็ม พร้อมปุ่มแก้ไขข้อมูล */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-base text-slate-900 font-serif">
                    รายการประวัติข้อมูลฉบับเต็มทั้งหมด ({filteredTeacherHistory.length} รายการ)
                  </h4>
                  <span className="text-xs text-slate-500">คลิก "แก้ไข" เพื่อดึงข้อมูลเดิมกลับมาปรับปรุง</span>
                </div>

                <div className="space-y-3">
                  {filteredTeacherHistory.map((rec) => (
                    <div
                      key={rec.Record_ID}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-amber-300">
                            ปี พ.ศ. {rec.Academic_Year}
                          </span>
                          <span className="font-bold text-sm text-slate-900">
                            {rec.Course_Code} — {rec.Course_Name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">อัปเดตเมื่อ: {rec.Updated_At}</span>
                          <button
                            onClick={() => handleEditInstructorForm(rec)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-100 shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-1">
                          <span className="font-bold text-slate-800">1. การจัดการเรียนการสอน:</span>
                          <p className="text-slate-600">{rec.Teaching_Method}</p>
                          <p className="text-slate-500 italic">KPI: {rec.Target_KPI}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-1">
                          <span className="font-bold text-slate-800">2. วิจัย & นวัตกรรม:</span>
                          <p className="text-slate-600">{rec.Research_Output || "-"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-1">
                          <span className="font-bold text-slate-800">3. สื่อดิจิทัล & E-Book:</span>
                          <p className="text-slate-600">{rec.Ebook_Planned || "-"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-1">
                          <span className="font-bold text-slate-800">4. พัฒนาตนเอง / ชุมชน:</span>
                          <p className="text-slate-600">{rec.Self_Development || "-"}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-100 space-y-1 sm:col-span-2">
                          <span className="font-bold text-slate-800">5. ทรัพยากร / งบประมาณที่ขอสนับสนุน:</span>
                          <p className="text-slate-600">{rec.Budget_Requested || rec.Additional_Notes || "-"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              แท็บ 2: แบบสำรวจจัดทำแผน 2570–2574
             ==================================================================== */}
          {instTab === "FORM" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleSaveInstructorForm}
                className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-xl text-slate-900 font-serif">
                      {editingRecordId ? "✏️ แก้ไขข้อมูลแบบสำรวจเดิม" : "📝 แบบสำรวจจัดทำแผน พ.ศ. 2570–2574"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      เนื้อหาอ้างอิงตามแบบสำรวจของคณะศึกษาศาสตร์ (สามารถเปิดดูฟอร์มต้นฉบับได้ที่ด้านบน)
                    </p>
                  </div>
                  {editingRecordId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRecordId(null);
                        setInstTab("SUMMARY");
                      }}
                      className="text-xs text-red-600 font-bold hover:underline"
                    >
                      ยกเลิกแก้ไข
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ปีการศึกษา (พ.ศ.)
                    </label>
                    <select
                      value={instFormState.Academic_Year}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Academic_Year: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    >
                      {[2570, 2571, 2572, 2573, 2574, 2569, 2568].map((y) => (
                        <option key={y} value={y}>
                          พ.ศ. {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      รหัสวิชา
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ED101"
                      value={instFormState.Course_Code}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Course_Code: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ชื่อรายวิชา
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ระบุชื่อวิชาที่รับผิดชอบ..."
                      value={instFormState.Course_Name}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Course_Name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                {/* หมวด 1: การสอน */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-slate-900" />
                    <span>หมวดที่ 1: การจัดการเรียนการสอน & ผลลัพธ์ผู้เรียน</span>
                  </h4>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      รูปแบบการจัดการเรียนการสอน (Active Learning / นวัตกรรมการสอน)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น โครงงานเป็นฐาน (PBL), การสะท้อนคิด (Reflective Thinking)..."
                      value={instFormState.Teaching_Method}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Teaching_Method: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      เป้าหมายผลสัมฤทธิ์ KPI ของผู้เรียนในรายวิชา
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น นักศึกษาร้อยละ 85 มีผลสัมฤทธิ์ระดับ B ขึ้นไป..."
                      value={instFormState.Target_KPI}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Target_KPI: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* หมวด 2 & 3: วิจัย และ สื่อ E-Book */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>หมวดที่ 2: แผนงานวิจัย & บทความ</span>
                    </h4>
                    <textarea
                      rows={3}
                      placeholder="ระบุแผนการตีพิมพ์บทความวิจัย หรือสิทธิบัตร..."
                      value={instFormState.Research_Output}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Research_Output: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookMarked className="w-4 h-4 text-emerald-600" />
                      <span>หมวดที่ 3: แผนผลิตสื่อ & หนังสือ E-Book</span>
                    </h4>
                    <textarea
                      rows={3}
                      placeholder="ระบุแผนการจัดทำตำรา เอกสารสอน หรือหนังสือ E-Book..."
                      value={instFormState.Ebook_Planned}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Ebook_Planned: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {/* หมวด 4 & 5: พัฒนาตนเอง และ งบประมาณ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-blue-600" />
                      <span>หมวดที่ 4: พัฒนาตนเอง / บริการวิชาการ</span>
                    </h4>
                    <textarea
                      rows={2}
                      placeholder="เช่น อบรมวิชาชีพครู หรือบริการวิชาการแก่โรงเรียนในพื้นที่..."
                      value={instFormState.Self_Development}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Self_Development: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-slate-700" />
                      <span>หมวดที่ 5: งบประมาณที่ขอรับการสนับสนุน</span>
                    </h4>
                    <textarea
                      rows={2}
                      placeholder="ระบุรายการครุภัณฑ์ งบประมาณสนับสนุนที่ต้องการจากคณะ..."
                      value={instFormState.Budget_Requested}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Budget_Requested: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <a
                    href={GOOGLE_FORM_INSTRUCTOR_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    <span>เปิดแบบสำรวจ Google Form ต้นฉบับ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
                  >
                    {editingRecordId ? "บันทึกการแก้ไข" : "บันทึกข้อมูลแผนเข้าสู่ระบบ"}
                  </button>
                </div>
              </form>

              {/* คอลัมน์ขวา: คำแนะนำและลิงก์ประวัติ */}
              <div className="lg:col-span-4 space-y-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-600" />
                    <span>คำแนะนำในการกรอกข้อมูล</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ข้อมูลที่คุณบันทึกจะถูกจัดเก็บลงในฐานข้อมูลกลางของคณะ และจะนำไปประมวลผลเป็นแผนพัฒนา พ.ศ. 2570–2574
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    คุณสามารถกลับมาแก้ไขข้อมูลได้ตลอดเวลา โดยระบบจะทำการอัปเดตแบบเรียลไทม์
                  </p>
                </div>

                <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200/80 space-y-3 text-xs">
                  <span className="font-bold text-amber-900 block">📊 ต้องการดูประวัติเดิมใน Google Sheet?</span>
                  <p className="text-amber-800">
                    สามารถเปิดดูตารางการตอบกลับทั้งหมดของคณาจารย์ในคณะได้ที่ลิงก์ชีตกลาง
                  </p>
                  <a
                    href={SHEET_TEACHER_HISTORY_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>เปิด Google Sheet ประวัติเดิม</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              แท็บ 3: อัปโหลดผลงาน E-Book
             ==================================================================== */}
          {instTab === "PORTFOLIO" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleSavePortfolioWork}
                className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4"
              >
                <h3 className="font-extrabold text-lg text-slate-900 font-serif border-b border-slate-100 pb-3">
                  📤 อัปโหลดผลงานวิชาการ / หนังสือ E-Book
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ปีการศึกษา (พ.ศ.)
                    </label>
                    <select
                      value={workFormState.Academic_Year}
                      onChange={(e) =>
                        setWorkFormState({ ...workFormState, Academic_Year: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    >
                      {[2570, 2571, 2572, 2573, 2574, 2569, 2568].map((y) => (
                        <option key={y} value={y}>
                          พ.ศ. {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      รูปแบบผลงาน
                    </label>
                    <select
                      value={workFormState.Work_Type}
                      onChange={(e) =>
                        setWorkFormState({ ...workFormState, Work_Type: e.target.value as "PDF" | "LINK" })
                      }
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 font-bold"
                    >
                      <option value="PDF">ไฟล์ PDF (อ่านแบบ E-Book)</option>
                      <option value="LINK">ลิงก์ไลฟ์สด / วิดีโอ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ชื่อผลงาน / ชื่อหนังสือ E-Book
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ระบุชื่อผลงาน..."
                    value={workFormState.Title}
                    onChange={(e) => setWorkFormState({ ...workFormState, Title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                {workFormState.Work_Type === "PDF" ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      อัปโหลดไฟล์ PDF (ระบบบันทึกลง Google Drive ให้เสร็จสรรพ)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200"
                    />
                    <input
                      type="url"
                      placeholder="หรือวาง URL ของไฟล์ PDF โดยตรง..."
                      value={workFormState.File_Or_Link_URL}
                      onChange={(e) =>
                        setWorkFormState({ ...workFormState, File_Or_Link_URL: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ลิงก์ไลฟ์สด / วิดีโอ / เว็บไซต์ภายนอก
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={workFormState.File_Or_Link_URL}
                      onChange={(e) =>
                        setWorkFormState({ ...workFormState, File_Or_Link_URL: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คำอธิบายผลงานโดยย่อ
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="สรุปเนื้อหาและประโยชน์ของผลงาน..."
                    value={workFormState.Description}
                    onChange={(e) =>
                      setWorkFormState({ ...workFormState, Description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      เผยแพร่ผลงานนี้สู่คลังสาธารณะ
                    </p>
                    <p className="text-[11px] text-slate-500">
                      หากเปิด นักศึกษาและบุคคลภายนอกจะสามารถเปิดอ่านได้ในคลัง E-Book
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={workFormState.Is_Public}
                    onChange={(e) =>
                      setWorkFormState({ ...workFormState, Is_Public: e.target.checked })
                    }
                    className="w-5 h-5 accent-slate-900 rounded cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all"
                >
                  อัปโหลดและบันทึกผลงาน
                </button>
              </form>

              {/* รายการผลงานทั้งหมด */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-extrabold text-lg text-slate-900 font-serif border-b border-slate-100 pb-3">
                  📚 ผลงานทั้งหมดของคุณ ({portfolioWorks.filter((w) => w.Staff_ID === currentUser.Staff_ID).length} รายการ)
                </h3>

                <div className="space-y-3">
                  {portfolioWorks.filter((w) => w.Staff_ID === currentUser.Staff_ID).length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      ยังไม่มีผลงานที่อัปโหลด คุณสามารถอัปโหลดไฟล์ PDF ทางด้านซ้าย
                    </div>
                  ) : (
                    portfolioWorks
                      .filter((w) => w.Staff_ID === currentUser.Staff_ID)
                      .map((w) => (
                        <div
                          key={w.Work_ID}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                                {w.Work_Type === "PDF" ? "📖 PDF E-Book" : "🔗 External Link"}
                              </span>
                              <span className="text-xs text-slate-500">พ.ศ. {w.Academic_Year}</span>
                              {w.Is_Public ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                                  <Globe className="w-3 h-3" /> สาธารณะ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                                  <Lock className="w-3 h-3" /> ส่วนตัว
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-sm text-slate-900">{w.Title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-1">{w.Description}</p>
                          </div>

                          <button
                            onClick={() => toggleWorkVisibility(w)}
                            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                              w.Is_Public
                                ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                : "border-slate-800 bg-slate-900 text-white hover:bg-slate-800"
                            }`}
                          >
                            {w.Is_Public ? "ซ่อนเป็นส่วนตัว" : "เปิดเผยแพร่"}
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* แท็บ 4: เปลี่ยนรหัสผ่าน */}
          {instTab === "PASSWORD" && (
            <form
              onSubmit={handleChangePassword}
              className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4"
            >
              <h3 className="font-extrabold text-lg text-slate-900 font-serif">🔐 เปลี่ยนรหัสผ่านประจำตัว</h3>
              <p className="text-xs text-slate-500">
                คุณสามารถตั้งรหัสผ่านใหม่เพื่อความปลอดภัยในการเข้าใช้งาน
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  required
                  placeholder="รหัสผ่านใหม่อย่างน้อย 4 ตัวอักษร"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านใหม่อีกครั้ง
                </label>
                <input
                  type="password"
                  required
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
              >
                บันทึกรหัสผ่านใหม่
              </button>
            </form>
          )}
        </main>
      )}

      {/* ====================================================================
          VIEW 3: ระบบสำหรับผู้บริหาร (EXECUTIVE PORTAL) - DEPARTMENT ISOLATION
         ==================================================================== */}
      {activeView === "EXECUTIVE" && currentUser && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                สิทธิ์ระดับหัวหน้าสาขา • ดูข้อมูลเฉพาะ {currentUser.Department} เท่านั้น
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 font-serif">
                รายงานผลลัพธ์และแผนยุทธศาสตร์: {currentUser.Department}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                ผู้บริหาร: {currentUser.Full_Name} ({currentUser.Staff_ID}) • คณะศึกษาศาสตร์
              </p>
            </div>
            <div>
              <a
                href={GOOGLE_FORM_EXECUTIVE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700"
              >
                <span>เปิดแบบสำรวจผู้บริหาร Google Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* สถิติ Bento ของสาขานี้เท่านั้น */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500">อาจารย์ประจำหลักสูตร ({currentUser.Department})</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {teachersList.filter((t) => t.program === currentUser.Department).length}{" "}
                <span className="text-xs font-normal text-slate-500">ท่าน</span>
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500">แบบสำรวจแผนที่อาจารย์ส่งแล้ว</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {instructorForms.filter((f) => f.Department === currentUser.Department).length}{" "}
                <span className="text-xs font-normal text-slate-500">วิชา</span>
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500">ผลงาน E-Book & สื่อการสอนในสาขา</p>
              <p className="text-3xl font-extrabold text-emerald-700 mt-2">
                {portfolioWorks.filter((w) => w.Department === currentUser.Department).length}{" "}
                <span className="text-xs font-normal text-slate-500">รายการ</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleSaveExecutiveForm}
              className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4"
            >
              <h3 className="font-extrabold text-lg border-b border-slate-100 pb-3 text-slate-900 font-serif">
                📊 แบบรายงานแผนพัฒนาหลักสูตร ({currentUser.Department})
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ปีการศึกษา (พ.ศ.)
                  </label>
                  <select
                    value={execFormState.Academic_Year}
                    onChange={(e) =>
                      setExecFormState({ ...execFormState, Academic_Year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  >
                    {[2570, 2571, 2572, 2573, 2574].map((y) => (
                      <option key={y} value={y}>
                        พ.ศ. {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    คะแนนประกันคุณภาพ (เต็ม 5.00)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="5"
                    required
                    value={execFormState.Quality_Score}
                    onChange={(e) =>
                      setExecFormState({ ...execFormState, Quality_Score: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ทิศทางแผนพัฒนาเชิงกลยุทธ์ของหลักสูตร (2570–2574)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="ระบุจุดเน้นเชิงกลยุทธ์ การพัฒนา E-Book หรือการเปิดหลักสูตรใหม่..."
                  value={execFormState.Strategic_Plan_2570_2574}
                  onChange={(e) =>
                    setExecFormState({ ...execFormState, Strategic_Plan_2570_2574: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  งบประมาณและความต้องการสนับสนุนจากคณะ
                </label>
                <input
                  type="text"
                  placeholder="เช่น งบสนับสนุนการผลิตตำรา หรืออุปกรณ์เฉพาะทาง..."
                  value={execFormState.Budget_Needs}
                  onChange={(e) =>
                    setExecFormState({ ...execFormState, Budget_Needs: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-colors"
              >
                บันทึกรายงานแผนพัฒนาสาขาวิชา
              </button>
            </form>

            <div className="lg:col-span-7 space-y-6">
              {/* รายชื่อคณาจารย์ในสาขา */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-base text-slate-900 font-serif">
                  👩‍🏫 รายนามอาจารย์ประจำ{currentUser.Department} ({teachersList.filter((t) => t.program === currentUser.Department).length} ท่าน)
                </h3>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {teachersList
                    .filter((t) => t.program === currentUser.Department)
                    .map((t) => (
                      <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{t.name}</span>
                          <span className="text-slate-400 font-mono ml-2">({t.id})</span>
                        </div>
                        <span className="text-slate-600 font-medium">
                          {t.degrees[0]?.degree || "อาจารย์ประจำหลักสูตร"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          VIEW 4: ระบบสำหรับแอดมิน (ADMIN COMMAND CENTER)
         ==================================================================== */}
      {activeView === "ADMIN" && (
        <div className="min-h-screen flex bg-slate-100">
          <aside className="w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between min-h-screen sticky top-0 left-0 select-none shadow-2xl">
            <div>
              <div className="p-5 border-b border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight">Admin Command</h2>
                  <p className="text-[11px] text-slate-400">คณะศึกษาศาสตร์</p>
                </div>
              </div>

              <nav className="p-3 space-y-1">
                {[
                  { id: "DASHBOARD", label: "แดชบอร์ดสถิติ Bento", icon: LayoutDashboard },
                  { id: "SETTINGS", label: "เปิด/ปิดรับแบบสำรวจ & ซิงค์ชีต", icon: Settings },
                  { id: "INSTRUCTORS", label: "ข้อมูลแผนอาจารย์ (2570–2574)", icon: FileText },
                  { id: "PORTFOLIO", label: "จัดการคลัง E-Book", icon: FolderKanban },
                  { id: "EXECUTIVES", label: "รายงานหัวหน้าสาขา (12 สาขา)", icon: Building2 },
                  { id: "FACULTY", label: "ทำเนียบคณาจารย์ (67 ท่าน)", icon: GraduationCap },
                  { id: "STAFF", label: "จัดการรหัสและบัญชี", icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminMenu(item.id as typeof adminMenu)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        adminMenu === item.id
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => setActiveView("HOME")}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
              >
                กลับหน้าหลักสาธารณะ
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600 text-xs font-bold text-red-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบแอดมิน</span>
              </button>
            </div>
          </aside>

          <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
            {/* เมนูตั้งค่าระบบ: เปิด/ปิดการกรอกข้อมูล */}
            {adminMenu === "SETTINGS" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 font-serif">
                    ⚙️ ตั้งค่าระบบการเปิดรับข้อมูล และซิงค์ฐานข้อมูล
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    แอดมินสามารถเปิดหรือปิดรับการกรอกแบบสำรวจแผน 2570–2574 ได้ด้วยคลิกเดียว
                  </p>
                </div>

                {/* สวิตช์เปิด-ปิดรับการกรอกข้อมูล */}
                <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSubmissionOpen ? "bg-emerald-50/70 border-emerald-200" : "bg-amber-50/70 border-amber-200"
                }`}>
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      สถานะระบบการรับข้อมูลปัจจุบัน
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {isSubmissionOpen
                        ? "🟢 เปิดรับการกรอกแบบสำรวจแผน 2570–2574 อยู่"
                        : "🔒 ปิดรับการกรอกข้อมูลชั่วคราว (อาจารย์จะกดกรอกไม่ได้)"}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {isSubmissionOpen
                        ? "เมื่อเปิด: อาจารย์จะเห็นปุ่ม 'กรอกแบบสำรวจแผน 2570–2574' ในหน้าพอร์ทัลของตนเอง"
                        : "เมื่อปิด: ปุ่มกรอกข้อมูลจะถูกล็อกไว้ แต่อาจารย์ยังคงดูประวัติที่เคยกรอกและอัปโหลด E-Book ได้"}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const next = !isSubmissionOpen;
                      setIsSubmissionOpen(next);
                      showToast(next ? "เปิดรับการกรอกข้อมูลแล้ว" : "ปิดรับการกรอกข้อมูลชั่วคราวแล้ว");
                    }}
                    className={`px-6 py-3 rounded-2xl text-xs font-bold shadow-sm transition-all ${
                      isSubmissionOpen
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {isSubmissionOpen ? "สั่งปิดรับการกรอกข้อมูล" : "สั่งเปิดรับการกรอกข้อมูล"}
                  </button>
                </div>

                {/* ซิงค์ Google Sheets */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900">ฐานข้อมูล Google Sheets & Apps Script</h4>
                  <p className="text-xs text-slate-600 font-mono break-all">
                    URL: {GAS_API_URL}
                  </p>
                  <button
                    onClick={syncWithGAS}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>ดึงข้อมูลล่าสุดจาก Google Sheets</span>
                  </button>
                </div>
              </div>
            )}

            {/* แดชบอร์ด Bento Analytics */}
            {adminMenu === "DASHBOARD" && (
              <>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                      Bento Analytics Command Center
                    </span>
                    <h1 className="text-2xl font-bold mt-1 text-slate-900 font-serif">
                      สถิติภาพรวมแผนพัฒนา พ.ศ. 2570–2574
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setAdminYearMode("RANGE_2570_2574")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        adminYearMode === "RANGE_2570_2574"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      ช่วงปี พ.ศ. 2570–2574
                    </button>
                    <button
                      onClick={() => setAdminYearMode("EVERY_5_YEARS")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        adminYearMode === "EVERY_5_YEARS"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      เปรียบเทียบทุกๆ 5 ปี
                    </button>
                    <button
                      onClick={() => setAdminYearMode("SINGLE_YEAR")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        adminYearMode === "SINGLE_YEAR"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      ดูรายปีแยก 12 สาขาวิชา
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">คณาจารย์ในระบบ (12 สาขา)</p>
                    <p className="text-3xl font-extrabold mt-2 text-slate-900">{teachersList.length} ท่าน</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">แผนการสอนที่อาจารย์ส่งแล้ว</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-2">{instructorForms.length} รายการ</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">ผลงาน E-Book ในคลัง (สาธารณะ)</p>
                    <p className="text-3xl font-extrabold text-emerald-700 mt-2">
                      {portfolioWorks.filter((w) => w.Is_Public).length} / {portfolioWorks.length}
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">รายงานจากหัวหน้าสาขา</p>
                    <p className="text-3xl font-extrabold text-amber-600 mt-2">{executiveForms.length} ฉบับ</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* กราฟแท่ง */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 font-serif">
                      <BarChart3 className="w-5 h-5 text-slate-800" />
                      <span>กราฟแท่งเปรียบเทียบจำนวนแผนการสอนและผลงาน E-Book</span>
                    </h3>

                    <div className="h-56 flex items-end justify-around gap-2 pt-8 pb-2 px-2 border-b border-slate-100">
                      {adminChartData.map((d, idx) => {
                        const maxVal = Math.max(
                          ...adminChartData.map((x) => Math.max(x.formsCount, x.worksCount, 1)),
                          4
                        );
                        const hForm = Math.max((d.formsCount / maxVal) * 140, 10);
                        const hWork = Math.max((d.worksCount / maxVal) * 140, 10);
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                            <div className="flex items-end gap-1.5 h-40">
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-slate-900 mb-0.5">
                                  {d.formsCount}
                                </span>
                                <div
                                  style={{ height: `${hForm}px` }}
                                  className="w-5 sm:w-7 rounded-t-lg bg-slate-900 transition-all duration-500"
                                  title={`แผนการสอน: ${d.formsCount}`}
                                />
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-amber-600 mb-0.5">
                                  {d.worksCount}
                                </span>
                                <div
                                  style={{ height: `${hWork}px` }}
                                  className="w-5 sm:w-7 rounded-t-lg bg-amber-500 transition-all duration-500"
                                  title={`ผลงาน E-Book: ${d.worksCount}`}
                                />
                              </div>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 text-center truncate max-w-[80px]">
                              {d.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* กราฟเส้น */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 font-serif">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span>กราฟเส้นแนวโน้มการเติบโตของข้อมูลรวม (Line Trend)</span>
                    </h3>

                    <div className="h-56 flex flex-col justify-between pt-4 pb-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <svg viewBox="0 0 400 150" className="w-full h-40 overflow-visible">
                        {[30, 75, 120].map((y) => (
                          <line
                            key={y}
                            x1="20"
                            y1={y}
                            x2="380"
                            y2={y}
                            stroke="#E2E8F0"
                            strokeDasharray="4 4"
                          />
                        ))}
                        {(() => {
                          const maxTotal = Math.max(
                            ...adminChartData.map((d) => d.formsCount + d.worksCount),
                            4
                          );
                          const pts = adminChartData.map((d, i) => {
                            const x =
                              adminChartData.length > 1
                                ? 40 + (i * 320) / (adminChartData.length - 1)
                                : 200;
                            const total = d.formsCount + d.worksCount;
                            const y = 130 - (total / maxTotal) * 100;
                            return { x, y, total, label: d.label };
                          });
                          const polylinePoints = pts.map((p) => `${p.x},${p.y}`).join(" ");
                          return (
                            <>
                              <polyline
                                fill="none"
                                stroke="#0F172A"
                                strokeWidth="3.5"
                                points={polylinePoints}
                              />
                              {pts.map((p, idx) => (
                                <g key={idx}>
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="6"
                                    className="fill-white stroke-slate-900"
                                    strokeWidth="3"
                                  />
                                  <text
                                    x={p.x}
                                    y={p.y - 12}
                                    textAnchor="middle"
                                    className="text-[11px] font-bold fill-slate-800"
                                  >
                                    {p.total}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                      <div className="flex justify-around text-xs font-semibold text-slate-600 truncate">
                        {adminChartData.map((d, i) => (
                          <span key={i} className="truncate max-w-[60px] text-center">
                            {d.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* เมนูอื่นๆ ของแอดมิน */}
            {adminMenu === "INSTRUCTORS" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-serif">รายการข้อมูลแผน 2570–2574 ของอาจารย์ผู้สอน</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 px-2">ปี พ.ศ.</th>
                        <th className="py-3 px-2">รหัส/ชื่ออาจารย์</th>
                        <th className="py-3 px-2">สาขาวิชา</th>
                        <th className="py-3 px-2">รายวิชา</th>
                        <th className="py-3 px-2">วิธีสอน</th>
                        <th className="py-3 px-2">สื่อ E-Book</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {instructorForms.map((f) => (
                        <tr key={f.Record_ID}>
                          <td className="py-3 px-2 font-bold text-slate-900">{f.Academic_Year}</td>
                          <td className="py-3 px-2 font-semibold">{f.Staff_ID} • {f.Full_Name}</td>
                          <td className="py-3 px-2">{f.Department}</td>
                          <td className="py-3 px-2">{f.Course_Code} {f.Course_Name}</td>
                          <td className="py-3 px-2 text-slate-600">{f.Teaching_Method}</td>
                          <td className="py-3 px-2 text-slate-600">{f.Ebook_Planned || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {adminMenu === "FACULTY" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-serif">ทำเนียบคุณวุฒิคณาจารย์ คณะศึกษาศาสตร์ (67 ท่าน)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 px-2">รหัส</th>
                        <th className="py-2 px-2">ชื่อ-สกุล</th>
                        <th className="py-2 px-2">ประจำหลักสูตร</th>
                        <th className="py-2 px-2">คุณวุฒิสูงสุด</th>
                        <th className="py-2 px-2">สถาบันที่จบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachersList.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2 px-2 font-mono font-bold text-slate-900">{t.id}</td>
                          <td className="py-2 px-2 font-semibold text-slate-900">{t.name}</td>
                          <td className="py-2 px-2 text-slate-600">{t.program}</td>
                          <td className="py-2 px-2 font-medium text-emerald-800">
                            {t.degrees[0]?.level || "-"} ({t.degrees[0]?.degree || "-"})
                          </td>
                          <td className="py-2 px-2 text-slate-500">{t.degrees[0]?.institution || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALS: Login, E-Book Reader, Teacher Profile (Luxurious Purple Styling)
         ==================================================================== */}
      {loginModalRole && (
        <div className="fixed inset-0 z-50 bg-[#0C061F]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-md w-full p-6 sm:p-8 border shadow-2xl space-y-5 transition-colors ${
            isDark 
              ? "bg-[#160D33] border-purple-800/80 text-purple-100 shadow-[0_20px_50px_rgba(76,29,149,0.35)]" 
              : "bg-white border-purple-200 text-purple-950 shadow-2xl"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                  isDark 
                    ? "bg-[#251454] text-purple-300 border-purple-700" 
                    : "bg-purple-100 text-purple-800 border-purple-200"
                }`}>
                  {loginModalRole} LOGIN
                </span>
                <h3 className={`text-xl font-bold mt-2 font-serif ${isDark ? "text-white" : "text-purple-950"}`}>
                  {loginModalRole === "INSTRUCTOR"
                    ? "เข้าสู่ระบบอาจารย์ผู้สอน"
                    : loginModalRole === "EXECUTIVE"
                    ? "เข้าสู่ระบบหัวหน้าสาขาวิชา"
                    : "เข้าสู่ระบบแอดมิน"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setLoginModalRole(null);
                  setLoginError("");
                }}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? "hover:bg-purple-900/50 text-purple-400 hover:text-white" : "hover:bg-purple-100 text-slate-400 hover:text-purple-900"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-xs text-red-300 font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? "text-purple-200" : "text-purple-900"}`}>
                  รหัสบุคลากร (Staff ID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น EDU-001, HEAD-01 หรือ ADMIN"
                  value={loginStaffId}
                  onChange={(e) => setLoginStaffId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                    isDark 
                      ? "border-purple-800 bg-[#211347] text-white focus:bg-[#281757]" 
                      : "border-purple-200 bg-purple-50/50 text-purple-950 focus:bg-white"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? "text-purple-200" : "text-purple-900"}`}>
                  รหัสผ่าน (Password)
                </label>
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่าน..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                    isDark 
                      ? "border-purple-800 bg-[#211347] text-white focus:bg-[#281757]" 
                      : "border-purple-200 bg-purple-50/50 text-purple-950 focus:bg-white"
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30 active:scale-95"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            {/* ปุ่มคลิกเดียวเติมรหัสทดสอบ */}
            <div className={`p-3.5 rounded-2xl border text-xs space-y-2 ${
              isDark ? "bg-[#211347]/80 border-purple-800/80" : "bg-purple-50/70 border-purple-200/80"
            }`}>
              <p className={`font-bold ${isDark ? "text-purple-300" : "text-purple-900"}`}>💡 คลิกเพื่อเติมรหัสทดสอบอัตโนมัติ:</p>
              <div className="flex flex-wrap gap-1.5">
                {loginModalRole === "INSTRUCTOR" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("EDU-001");
                        setLoginPassword("123456");
                      }}
                      className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        isDark 
                          ? "bg-[#160D33] border-purple-800 hover:border-purple-500 text-purple-200 hover:text-white" 
                          : "bg-white border-purple-200 hover:border-purple-500 text-purple-900 shadow-xs"
                      }`}
                    >
                      อาจารย์ EDU-001 (ซอลีฮะห์)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("EDU-002");
                        setLoginPassword("123456");
                      }}
                      className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        isDark 
                          ? "bg-[#160D33] border-purple-800 hover:border-purple-500 text-purple-200 hover:text-white" 
                          : "bg-white border-purple-200 hover:border-purple-500 text-purple-900 shadow-xs"
                      }`}
                    >
                      อาจารย์ EDU-002 (มะซีดิ)
                    </button>
                  </>
                )}
                {loginModalRole === "EXECUTIVE" && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStaffId("HEAD-01");
                      setLoginPassword("exec123");
                    }}
                    className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                      isDark 
                        ? "bg-[#160D33] border-purple-800 hover:border-purple-500 text-purple-200 hover:text-white" 
                        : "bg-white border-purple-200 hover:border-purple-500 text-purple-900 shadow-xs"
                    }`}
                  >
                    หน.อิสลามศึกษา (HEAD-01)
                  </button>
                )}
                {loginModalRole === "ADMIN" && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStaffId("ADMIN");
                      setLoginPassword("admin999");
                    }}
                    className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                      isDark 
                        ? "bg-[#160D33] border-purple-800 hover:border-purple-500 text-purple-200 hover:text-white" 
                        : "bg-white border-purple-200 hover:border-purple-500 text-purple-900 shadow-xs"
                    }`}
                  >
                    แอดมิน ADMIN (admin999)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E-Book Modal */}
      {selectedWorkModal && (
        <div className="fixed inset-0 z-50 bg-[#0C061F]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border transition-colors ${
            isDark 
              ? "bg-[#160D33] border-purple-800/80 text-purple-100 shadow-[0_20px_50px_rgba(76,29,149,0.35)]" 
              : "bg-white border-purple-200 text-purple-950 shadow-2xl"
          }`}>
            <div className={`px-6 py-4 flex items-center justify-between ${
              isDark ? "bg-[#110729] text-white border-b border-purple-800/80" : "bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white"
            }`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/15 text-amber-300">
                  {selectedWorkModal.Work_Type === "PDF" ? "Interactive E-Book Reader" : "External Live Link"}
                </span>
                <h3 className="font-bold text-base sm:text-lg mt-0.5 truncate max-w-md sm:max-w-xl font-serif">
                  {selectedWorkModal.Title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedWorkModal(null)}
                className="p-2 rounded-full hover:bg-white/10 text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {selectedWorkModal.Work_Type === "PDF" ? (
                <div className="space-y-4">
                  <div className={`rounded-2xl p-4 sm:p-6 border min-h-[380px] flex flex-col justify-between transition-colors ${
                    isDark ? "bg-[#1e1147] border-purple-800/80" : "bg-purple-50/60 border-purple-200"
                  }`}>
                    <div className={`flex items-center justify-between border-b pb-3 text-xs font-semibold ${
                      isDark ? "border-purple-800/80 text-purple-300" : "border-purple-200 text-purple-700"
                    }`}>
                      <span>ผู้แต่ง: {selectedWorkModal.Instructor_Name} • {selectedWorkModal.Department}</span>
                      <span>หน้าที่ {ebookPage} จาก 3 (พรีวิว E-Book)</span>
                    </div>

                    <div className={`my-auto py-6 px-4 sm:px-10 rounded-xl shadow-inner border min-h-[250px] flex flex-col justify-center transition-colors ${
                      isDark ? "bg-[#130A2A] border-purple-800 text-purple-100" : "bg-white border-purple-200/80 text-purple-950 shadow-sm"
                    }`}>
                      {ebookPage === 1 && (
                        <div className="text-center space-y-3">
                          <BookOpen className={`w-12 h-12 mx-auto ${isDark ? "text-purple-400" : "text-purple-700"}`} />
                          <h4 className={`text-xl font-bold font-serif ${isDark ? "text-white" : "text-purple-950"}`}>
                            {selectedWorkModal.Title}
                          </h4>
                          <p className={`text-sm ${isDark ? "text-purple-200" : "text-purple-800"}`}>
                            โดย {selectedWorkModal.Instructor_Name} ({selectedWorkModal.Department})
                          </p>
                          <p className={`text-xs max-w-lg mx-auto leading-relaxed ${isDark ? "text-purple-300/70" : "text-purple-600"}`}>
                            {selectedWorkModal.Description}
                          </p>
                        </div>
                      )}
                      {ebookPage === 2 && (
                        <div className="space-y-3">
                          <h5 className={`font-bold text-base font-serif ${isDark ? "text-white" : "text-purple-950"}`}>
                            สาระสำคัญและโครงสร้างเอกสาร
                          </h5>
                          <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-purple-200" : "text-purple-900"}`}>
                            {selectedWorkModal.Description} เอกสารฉบับนี้ถูกแปลงเป็นรูปแบบหนังสืออิเล็กทรอนิกส์ (E-Book) เพื่อให้นักศึกษาและบุคลากรเข้าถึงได้สะดวก
                          </p>
                          <iframe
                            src={selectedWorkModal.File_Or_Link_URL}
                            className={`w-full h-56 rounded-lg border mt-2 ${isDark ? "border-purple-800" : "border-purple-200"}`}
                            title="PDF Preview"
                          />
                        </div>
                      )}
                      {ebookPage === 3 && (
                        <div className="text-center space-y-3">
                          <Download className="w-12 h-12 text-emerald-400 mx-auto" />
                          <h5 className={`font-bold text-base font-serif ${isDark ? "text-white" : "text-purple-950"}`}>
                            ต้องการอ่านฉบับเต็มหรือบันทึกเก็บไว้ในอุปกรณ์?
                          </h5>
                          <p className={`text-xs ${isDark ? "text-purple-300/80" : "text-purple-700"}`}>
                            สามารถคลิกปุ่มดาวน์โหลดไฟล์ PDF ด้านล่างเพื่อนำไปอ่านแบบออฟไลน์ได้ทันที
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <button
                        disabled={ebookPage <= 1}
                        onClick={() => setEbookPage((p) => Math.max(1, p - 1))}
                        className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border text-xs font-bold disabled:opacity-40 transition-colors ${
                          isDark ? "bg-[#160D33] border-purple-800 text-purple-200 hover:bg-purple-900/60" : "bg-white border-purple-200 text-purple-900 hover:bg-purple-50 shadow-xs"
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" /> หน้าก่อนหน้า
                      </button>
                      <button
                        disabled={ebookPage >= 3}
                        onClick={() => setEbookPage((p) => Math.min(3, p + 1))}
                        className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border text-xs font-bold disabled:opacity-40 transition-colors ${
                          isDark ? "bg-[#160D33] border-purple-800 text-purple-200 hover:bg-purple-900/60" : "bg-white border-purple-200 text-purple-900 hover:bg-purple-50 shadow-xs"
                        }`}
                      >
                        หน้าถัดไป <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className={`text-xs ${isDark ? "text-purple-300" : "text-purple-700"}`}>
                      พ.ศ. {selectedWorkModal.Academic_Year} • ยอดดาวน์โหลด {selectedWorkModal.Downloads} ครั้ง
                    </div>
                    <a
                      href={selectedWorkModal.File_Or_Link_URL}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => {
                        setPortfolioWorks((prev) =>
                          prev.map((w) =>
                            w.Work_ID === selectedWorkModal.Work_ID ? { ...w, Downloads: w.Downloads + 1 } : w
                          )
                        );
                      }}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
                        isDark ? "bg-purple-100 hover:bg-white text-purple-950" : "bg-gradient-to-r from-purple-700 to-violet-700 hover:from-purple-600 hover:to-violet-600 text-white"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span>เปิดอ่านเต็มจอ / ดาวน์โหลดไฟล์ PDF</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl border space-y-4 ${
                  isDark ? "bg-[#1e1147] border-purple-800" : "bg-purple-50/60 border-purple-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>พรีวิวลิงก์สื่อการสอนภายนอก</p>
                      <h4 className={`font-bold text-lg font-serif ${isDark ? "text-white" : "text-purple-950"}`}>{selectedWorkModal.Title}</h4>
                    </div>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-purple-200" : "text-purple-900"}`}>{selectedWorkModal.Description}</p>
                  <div className={`p-3.5 rounded-xl border text-xs break-all font-mono ${
                    isDark ? "bg-[#130A2A] border-purple-800 text-purple-300" : "bg-white border-purple-200 text-purple-700"
                  }`}>
                    ลิงก์ปลายทาง: {selectedWorkModal.File_Or_Link_URL}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <a
                      href={selectedWorkModal.File_Or_Link_URL}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-md ${
                        isDark ? "bg-purple-100 hover:bg-white text-purple-950" : "bg-gradient-to-r from-purple-700 to-violet-700 hover:from-purple-600 hover:to-violet-600 text-white"
                      }`}
                    >
                      <span>ไปยังเว็บไซต์ต้นทาง</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Teacher Profile Modal */}
      {selectedTeacherModal && (
        <div className="fixed inset-0 z-50 bg-[#0C061F]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-2xl w-full p-6 sm:p-8 border shadow-2xl space-y-5 transition-colors ${
            isDark ? "bg-[#160D33] border-purple-800/80 text-purple-100 shadow-[0_20px_50px_rgba(76,29,149,0.35)]" : "bg-white border-purple-200 text-purple-950 shadow-2xl"
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md ${
                  isDark ? "bg-[#251454] text-amber-300 border border-purple-700" : "bg-gradient-to-br from-purple-900 to-violet-950 text-amber-300"
                }`}>
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold font-serif ${isDark ? "text-white" : "text-purple-950"}`}>{selectedTeacherModal.name}</h3>
                  <p className={`text-xs font-semibold mt-0.5 ${isDark ? "text-purple-300/80" : "text-purple-700"}`}>{selectedTeacherModal.program}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherModal(null)}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? "hover:bg-purple-900/50 text-purple-400 hover:text-white" : "hover:bg-purple-100 text-slate-400 hover:text-purple-900"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className={`font-bold text-sm flex items-center gap-2 border-b pb-2 ${
                isDark ? "border-purple-800 text-purple-200" : "border-purple-200 text-purple-900"
              }`}>
                <Award className={`w-4 h-4 ${isDark ? "text-amber-400" : "text-purple-700"}`} />
                <span>ประวัติและคุณวุฒิการศึกษา (จากฐานข้อมูลคณะศึกษาศาสตร์)</span>
              </h4>

              <div className="space-y-2.5">
                {selectedTeacherModal.degrees.map((deg, i) => (
                  <div key={i} className={`p-3.5 rounded-2xl border space-y-1 transition-colors ${
                    isDark ? "bg-[#1f1246] border-purple-800/80" : "bg-purple-50/50 border-purple-200/80"
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold px-2.5 py-0.5 rounded ${
                        isDark ? "bg-[#2d1b61] text-purple-200" : "bg-purple-200/80 text-purple-900"
                      }`}>
                        {deg.level}
                      </span>
                      {deg.year && <span className={isDark ? "text-purple-400" : "text-purple-600"}>จบปี พ.ศ. {deg.year}</span>}
                    </div>
                    <p className={`text-sm font-semibold font-serif ${isDark ? "text-white" : "text-purple-950"}`}>
                      {deg.degree} {deg.major ? `(${deg.major})` : ""}
                    </p>
                    <p className={`text-xs ${isDark ? "text-purple-300/70" : "text-purple-700/80"}`}>{deg.institution}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setPublicSearch(selectedTeacherModal.name);
                    setPublicHubTab("EBOOKS");
                    setSelectedTeacherModal(null);
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                    isDark ? "bg-purple-100 hover:bg-white text-purple-950" : "bg-gradient-to-r from-purple-700 to-violet-700 hover:from-purple-600 hover:to-violet-600 text-white"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ค้นหาผลงาน E-Book ของอาจารย์ท่านนี้</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}