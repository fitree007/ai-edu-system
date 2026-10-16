"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  UserCheck,
  Building2,
  ShieldCheck,
  BookOpen,
  Search,
  Edit3,
  Lock,
  KeyRound,
  LogOut,
  BarChart3,
  TrendingUp,
  FileText,
  ExternalLink,
  Download,
  ChevronLeft,
  CheckCircle2,
  RefreshCw,
  Settings,
  LayoutDashboard,
  Eye,
  GraduationCap,
  X,
  Lightbulb,
  Sun,
  Moon,
  Type,
  HandHelping,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Copy,
  Sparkles,
} from "lucide-react";

import {
  EDUCATION_PROGRAMS,
  INITIAL_TEACHERS,
  INITIAL_STAFF,
  INITIAL_PORTFOLIO_WORKS,
  INITIAL_INSTRUCTOR_FORMS,
  INITIAL_EXECUTIVE_FORMS,
  INITIAL_TEACHER_SURVEYS,
  createDefaultSurvey,
  SURVEY_YEARS,
  TEACHING_LOAD_SEMESTERS,
  FIELDWORK_SEMESTERS,
  RESEARCH_FUND_OPTIONS,
  RESEARCH_BUDGET_RANGES,
  TEACHING_LOAD_OPTIONS,
  FIELDWORK_AGENCY_OPTIONS,
  TARGET_COMMUNITY_OPTIONS,
  CRITERIA_PERCENTAGE_OPTIONS,
  GOOGLE_FORM_EXECUTIVE_URL,
  SHEET_TEACHER_HISTORY_URL,
  type StaffMember,
  type TeacherInfo,
  type DegreeInfo,
  type InstructorPlanRecord,
  type ExecutivePlanRecord,
  type PortfolioWork,
  type TeacherSurveyPlan,
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

  // Theme & Accessibility State (Default: Light macOS style)
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [fontSizeScale, setFontSizeScale] = useState<"normal" | "large" | "xlarge">("normal");
  const isDark = themeMode === "dark";

  // System Settings: เปิด/ปิดการกรอกข้อมูลโดยแอดมิน
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(true);

  // Database State
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [teachersList, setTeachersList] = useState<TeacherInfo[]>(INITIAL_TEACHERS);
  const [instructorForms, setInstructorForms] = useState<InstructorPlanRecord[]>(INITIAL_INSTRUCTOR_FORMS);
  const [teacherSurveys, setTeacherSurveys] = useState<TeacherSurveyPlan[]>(INITIAL_TEACHER_SURVEYS);
  const [portfolioWorks, setPortfolioWorks] = useState<PortfolioWork[]>(INITIAL_PORTFOLIO_WORKS);
  const [executiveForms, setExecutiveForms] = useState<ExecutivePlanRecord[]>(INITIAL_EXECUTIVE_FORMS);
  const [lastRealtimeSavedAt, setLastRealtimeSavedAt] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Public Hub State
  const [publicHubTab, setPublicHubTab] = useState<"FACULTY" | "EBOOKS">("FACULTY");
  const [publicSearch, setPublicSearch] = useState("");
  const [publicDeptFilter, setPublicDeptFilter] = useState("ALL");
  const [publicTeacherFilter, setPublicTeacherFilter] = useState("ALL");
  const [selectedWorkModal, setSelectedWorkModal] = useState<PortfolioWork | null>(null);
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<TeacherInfo | null>(null);

  // Instructor Per-Section Edit Mode State
  // อาจารย์ทุกคนเมื่อล็อกอินเข้ามาจะเห็นข้อมูลทั้งหมดของตัวเองทันที และกดแก้ไขแยกแต่ละส่วนได้แบบเรียลไทม์
  const [editingSection, setEditingSection] = useState<
    "NONE" | "PROFILE" | "RESEARCH" | "TEACHING" | "SERVICE"
  >("NONE");
  const [adminEditingStaffId, setAdminEditingStaffId] = useState<string | null>(null);
  const [adminViewingSurvey, setAdminViewingSurvey] = useState<TeacherSurveyPlan | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
    Quality_Score: 4.8,
    Strategic_Plan_2570_2574: "",
    Budget_Needs: "",
    Issues_Found: "",
  });

  // Admin Portal State
  const [adminMenu, setAdminMenu] = useState<"INSTRUCTORS" | "DASHBOARD" | "FACULTY" | "SETTINGS">("INSTRUCTORS");
  const [adminYearMode] = useState<"RANGE_2570_2574" | "EVERY_5_YEARS" | "SINGLE_YEAR">("RANGE_2570_2574");
  const [adminSelectedYear] = useState<number>(2570);
  const [adminTeacherSearch, setAdminTeacherSearch] = useState("");
  const [adminTeacherDeptFilter, setAdminTeacherDeptFilter] = useState("ALL");
  const [adminTeacherStatusFilter, setAdminTeacherStatusFilter] = useState<"ALL" | "SUBMITTED" | "PENDING">("ALL");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Load from LocalStorage
  useEffect(() => {
    try {
      const cachedStaff = localStorage.getItem("edu_staff_v3");
      const cachedTeachers = localStorage.getItem("edu_teachers_v1");
      const cachedInst = localStorage.getItem("edu_inst_v3");
      const cachedWorks = localStorage.getItem("edu_works_v3");
      const cachedExec = localStorage.getItem("edu_exec_v3");
      const cachedSub = localStorage.getItem("edu_submission_open");
      const cachedTheme = localStorage.getItem("edu_theme_v3");
      const cachedScale = localStorage.getItem("edu_scale_v3");
      const cachedSurveys = localStorage.getItem("edu_surveys_v1");

      if (cachedStaff) setStaffList(JSON.parse(cachedStaff));
      if (cachedTeachers) setTeachersList(JSON.parse(cachedTeachers));
      if (cachedInst) setInstructorForms(JSON.parse(cachedInst));
      if (cachedSurveys) setTeacherSurveys(JSON.parse(cachedSurveys));
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

  // Real-time Persistence to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("edu_staff_v3", JSON.stringify(staffList));
      localStorage.setItem("edu_teachers_v1", JSON.stringify(teachersList));
      localStorage.setItem("edu_inst_v3", JSON.stringify(instructorForms));
      localStorage.setItem("edu_surveys_v1", JSON.stringify(teacherSurveys));
      localStorage.setItem("edu_works_v3", JSON.stringify(portfolioWorks));
      localStorage.setItem("edu_exec_v3", JSON.stringify(executiveForms));
      localStorage.setItem("edu_submission_open", JSON.stringify(isSubmissionOpen));
    } catch (e) {
      console.warn("Failed to persist to localStorage", e);
    }
  }, [staffList, teachersList, instructorForms, teacherSurveys, portfolioWorks, executiveForms, isSubmissionOpen]);

  useEffect(() => {
    try {
      localStorage.setItem("edu_theme_v3", themeMode);
    } catch {}
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem("edu_scale_v3", fontSizeScale);
      if (typeof document !== "undefined") {
        if (fontSizeScale === "xlarge") {
          document.documentElement.style.fontSize = "18.5px";
        } else if (fontSizeScale === "large") {
          document.documentElement.style.fontSize = "17px";
        } else {
          document.documentElement.style.fontSize = "15.5px";
        }
      }
    } catch {}
  }, [fontSizeScale]);

  const handleToggleFontSize = () => {
    if (fontSizeScale === "normal") {
      setFontSizeScale("large");
      showToast("ขนาดตัวอักษร: ใหญ่ (115%)");
    } else if (fontSizeScale === "large") {
      setFontSizeScale("xlarge");
      showToast("ขนาดตัวอักษร: ใหญ่พิเศษ (125%)");
    } else {
      setFontSizeScale("normal");
      showToast("ขนาดตัวอักษร: ปกติ (100%)");
    }
  };

  const handleDecreaseFontSize = () => {
    if (fontSizeScale === "xlarge") setFontSizeScale("large");
    else if (fontSizeScale === "large") setFontSizeScale("normal");
  };

  const handleIncreaseFontSize = () => {
    if (fontSizeScale === "normal") setFontSizeScale("large");
    else if (fontSizeScale === "large") setFontSizeScale("xlarge");
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const syncWithGAS = async () => {
    if (!GAS_API_URL) return;
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
    } catch {}
  };

  const postToGAS = async (payload: Record<string, unknown>) => {
    if (!GAS_API_URL) return;
    try {
      await fetch(GAS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
    } catch {}
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
      setLoginError("รหัสบุคลากรหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    if (loginModalRole && user.Role !== loginModalRole && user.Role !== "ADMIN") {
      setLoginError("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานในส่วนนี้");
      return;
    }

    setCurrentUser(user);
    const target = loginModalRole || user.Role;
    setActiveView(target);
    setEditingSection("NONE");
    setLoginModalRole(null);
    setLoginStaffId("");
    setLoginPassword("");
    showToast(`เข้าสู่ระบบสำเร็จ: ${user.Full_Name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAdminEditingStaffId(null);
    setEditingSection("NONE");
    setActiveView("HOME");
    showToast("ออกจากระบบแล้ว");
  };

  // Active Teacher ID (either logged-in teacher or admin-selected teacher)
  const activeStaffId = useMemo(() => {
    if (adminEditingStaffId) return adminEditingStaffId;
    return currentUser?.Staff_ID || "";
  }, [adminEditingStaffId, currentUser]);

  const currentTeacherProfile = useMemo(() => {
    if (!activeStaffId) return null;
    return (
      teachersList.find((t) => t.id.toUpperCase() === activeStaffId.toUpperCase()) || {
        id: activeStaffId,
        name: currentUser?.Full_Name || activeStaffId,
        program: currentUser?.Department || EDUCATION_PROGRAMS[0],
        degrees: [],
      }
    );
  }, [activeStaffId, teachersList, currentUser]);

  // ข้อมูลแบบสำรวจของอาจารย์ท่านนี้ (มีข้อมูลพร้อมแสดงทันทีสำหรับอาจารย์ทุกคน)
  const currentTeacherSurvey = useMemo(() => {
    if (!activeStaffId) return null;
    const found = teacherSurveys.find(
      (s) => s.Staff_ID.trim().toUpperCase() === activeStaffId.trim().toUpperCase()
    );
    if (found) return found;
    if (currentTeacherProfile) {
      return createDefaultSurvey(currentTeacherProfile, false);
    }
    return null;
  }, [activeStaffId, teacherSurveys, currentTeacherProfile]);

  // บันทึกการเปลี่ยนแปลงแบบเรียลไทม์ (Real-time Database Update)
  const updateSurveyRealtime = (updater: (prev: TeacherSurveyPlan) => TeacherSurveyPlan) => {
    if (!currentTeacherSurvey) return;
    const nowTime = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const todayStr = new Date().toISOString().split("T")[0];

    const updated: TeacherSurveyPlan = {
      ...updater(currentTeacherSurvey),
      Updated_At: todayStr,
    };

    setTeacherSurveys((prev) => {
      const idx = prev.findIndex(
        (s) => s.Staff_ID.trim().toUpperCase() === updated.Staff_ID.trim().toUpperCase()
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    setLastRealtimeSavedAt(nowTime);
    postToGAS({ action: "upsertTeacherSurvey", survey: updated });
  };

  // อัปเดตข้อมูลประวัติอาจารย์แบบเรียลไทม์ (ชื่อ, สาขา, วุฒิการศึกษา)
  const updateTeacherProfileRealtime = (updater: (prev: TeacherInfo) => TeacherInfo) => {
    if (!currentTeacherProfile) return;
    const nowTime = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const updatedProfile = updater(currentTeacherProfile);

    setTeachersList((prev) => {
      const idx = prev.findIndex((t) => t.id.toUpperCase() === updatedProfile.id.toUpperCase());
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedProfile;
        return copy;
      }
      return [updatedProfile, ...prev];
    });

    // Sync Name & Department to StaffList & Survey
    setStaffList((prev) =>
      prev.map((s) =>
        s.Staff_ID.toUpperCase() === updatedProfile.id.toUpperCase()
          ? { ...s, Full_Name: updatedProfile.name, Department: updatedProfile.program }
          : s
      )
    );

    if (currentUser && currentUser.Staff_ID.toUpperCase() === updatedProfile.id.toUpperCase()) {
      setCurrentUser((prev) =>
        prev ? { ...prev, Full_Name: updatedProfile.name, Department: updatedProfile.program } : null
      );
    }

    const highestDeg = updatedProfile.degrees[0];
    const degSummary = highestDeg
      ? `${highestDeg.level} (${highestDeg.degree}) - ${highestDeg.institution}`
      : "อาจารย์ประจำคณะศึกษาศาสตร์";

    updateSurveyRealtime((prev) => ({
      ...prev,
      Full_Name: updatedProfile.name,
      Department: updatedProfile.program,
      Degree_Level: degSummary,
    }));

    setLastRealtimeSavedAt(nowTime);
  };

  // ยืนยันข้อมูลทั้งหมดในครั้งเดียว (One-Click Confirmation)
  const handleConfirmAllData = () => {
    if (!currentTeacherSurvey) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

    const confirmedRecord: TeacherSurveyPlan = {
      ...currentTeacherSurvey,
      Is_Submitted: true,
      Updated_At: todayStr,
    };

    setTeacherSurveys((prev) => {
      const idx = prev.findIndex(
        (s) => s.Staff_ID.trim().toUpperCase() === confirmedRecord.Staff_ID.trim().toUpperCase()
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = confirmedRecord;
        return copy;
      }
      return [confirmedRecord, ...prev];
    });

    setEditingSection("NONE");
    setLastRealtimeSavedAt(nowTime);
    postToGAS({ action: "upsertTeacherSurvey", survey: confirmedRecord });
    showToast("ยืนยันความถูกต้องและบันทึกข้อมูลลงฐานข้อมูลเรียบร้อยแล้ว");
  };

  // Toggle เลือกแหล่งทุนวิจัย (Checkbox + เลือกปี)
  const toggleFundSourceSelection = (fundName: string) => {
    updateSurveyRealtime((prev) => {
      const currentYears = prev.research_funding_sources[fundName] || [];
      const nextYears = currentYears.length > 0 ? [] : [2570];
      return {
        ...prev,
        research_funding_sources: {
          ...prev.research_funding_sources,
          [fundName]: nextYears,
        },
      };
    });
  };

  const toggleResearchFundYear = (fundName: string, year: number) => {
    updateSurveyRealtime((prev) => {
      const currentYears = prev.research_funding_sources[fundName] || [];
      const nextYears = currentYears.includes(year)
        ? currentYears.filter((y) => y !== year)
        : [...currentYears, year].sort();
      return {
        ...prev,
        research_funding_sources: {
          ...prev.research_funding_sources,
          [fundName]: nextYears,
        },
      };
    });
  };

  // Toggle เลือกกลุ่มเป้าหมายบริการวิชาการ (Checkbox + เลือกปี)
  const toggleCommunitySelection = (commName: string) => {
    updateSurveyRealtime((prev) => {
      const currentYears = prev.target_communities[commName] || [];
      const nextYears = currentYears.length > 0 ? [] : [2570];
      return {
        ...prev,
        target_communities: {
          ...prev.target_communities,
          [commName]: nextYears,
        },
      };
    });
  };

  const toggleTargetCommunityYear = (commName: string, year: number) => {
    updateSurveyRealtime((prev) => {
      const currentYears = prev.target_communities[commName] || [];
      const nextYears = currentYears.includes(year)
        ? currentYears.filter((y) => y !== year)
        : [...currentYears, year].sort();
      return {
        ...prev,
        target_communities: {
          ...prev.target_communities,
          [commName]: nextYears,
        },
      };
    });
  };

  const toggleWorkVisibility = (work: PortfolioWork) => {
    const nextPublic = !work.Is_Public;
    setPortfolioWorks((prev) =>
      prev.map((w) => (w.Work_ID === work.Work_ID ? { ...w, Is_Public: nextPublic } : w))
    );
    postToGAS({ action: "toggleWorkPublic", workId: work.Work_ID, isPublic: nextPublic });
    showToast(nextPublic ? "เปิดเผยแพร่ผลงานแล้ว" : "ซ่อนผลงานแล้ว");
  };

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
      prev.map((s) =>
        s.Staff_ID === currentUser.Staff_ID ? { ...s, Password: newPassword, Is_Default_Pwd: false } : s
      )
    );
    setCurrentUser({ ...currentUser, Password: newPassword, Is_Default_Pwd: false });
    postToGAS({ action: "changePassword", staffId: currentUser.Staff_ID, newPassword });
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(false);
    showToast("เปลี่ยนรหัสผ่านสำเร็จ");
  };

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
    showToast(`บันทึกรายงานของ ${currentUser.Department} แล้ว`);
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

  const adminTeachersFiltered = useMemo(() => {
    return teachersList.filter((t) => {
      const matchDept = adminTeacherDeptFilter === "ALL" || t.program === adminTeacherDeptFilter;
      const survey = teacherSurveys.find((s) => s.Staff_ID.trim().toUpperCase() === t.id.trim().toUpperCase());
      const isSubmitted = !!survey?.Is_Submitted;
      const matchStatus =
        adminTeacherStatusFilter === "ALL" ||
        (adminTeacherStatusFilter === "SUBMITTED" && isSubmitted) ||
        (adminTeacherStatusFilter === "PENDING" && !isSubmitted);

      const q = adminTeacherSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.program.toLowerCase().includes(q);

      return matchDept && matchStatus && matchQuery;
    });
  }, [teachersList, teacherSurveys, adminTeacherDeptFilter, adminTeacherStatusFilter, adminTeacherSearch]);

  const adminChartData = useMemo(() => {
    if (adminYearMode === "RANGE_2570_2574") {
      const years = [2570, 2571, 2572, 2573, 2574];
      return years.map((yr) => ({
        label: `${yr}`,
        formsCount: instructorForms.filter((f) => Number(f.Academic_Year) === yr).length,
        worksCount: portfolioWorks.filter((w) => Number(w.Academic_Year) === yr).length,
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

  const canEditSurvey = isSubmissionOpen || !!adminEditingStaffId;

  return (
    <div
      className={`min-h-screen overflow-x-hidden font-sans transition-colors duration-300 antialiased ${
        isDark
          ? "bg-[#0D081D] text-purple-50 selection:bg-purple-800 selection:text-white"
          : "bg-[#F2F2F7] text-slate-900 selection:bg-purple-200 selection:text-purple-950"
      }`}
    >
      {/* Toast Notification (macOS Floating Pill) */}
      {toastMsg && (
        <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 z-50 flex items-center justify-center sm:justify-start gap-2.5 bg-slate-900/95 dark:bg-purple-950/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/15 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">{toastMsg}</span>
        </div>
      )}

      {/* ====================================================================
          GLOBAL HEADER: macOS Top Menu Bar (100% Mobile-Safe, Never Wraps/Overflows)
         ==================================================================== */}
      {activeView !== "ADMIN" && (
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-2xl transition-colors ${
            isDark
              ? "bg-[#130B29]/85 border-white/10 text-white"
              : "bg-white/80 border-slate-200/80 text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
          }`}
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
            {/* Left: macOS Dots + Back Button / Brand Title */}
            <div className="flex items-center gap-2 min-w-0">
              {/* macOS Traffic Lights */}
              <div className="hidden md:flex items-center gap-1.5 mr-1 shrink-0">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10" />
              </div>

              {activeView !== "HOME" ? (
                <button
                  type="button"
                  onClick={() => {
                    setAdminEditingStaffId(null);
                    setEditingSection("NONE");
                    setActiveView("HOME");
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 h-9 rounded-xl text-xs font-bold border whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                    isDark
                      ? "bg-white/10 border-white/15 text-white hover:bg-white/15"
                      : "bg-slate-100 border-slate-200/90 text-slate-800 hover:bg-slate-200/70"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>หน้าหลัก</span>
                </button>
              ) : null}

              <div
                onClick={() => {
                  setAdminEditingStaffId(null);
                  setEditingSection("NONE");
                  setActiveView("HOME");
                }}
                className="flex items-center gap-2 cursor-pointer min-w-0"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm sm:text-base tracking-tight whitespace-nowrap truncate">
                  คณะศึกษาศาสตร์
                </span>
              </div>
            </div>

            {/* Right: Mobile-First Compact Controls (Never wraps text vertically) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mobile Font Size Button (Single 1-tap button on mobile, 3-segment on desktop) */}
              <button
                type="button"
                onClick={handleToggleFontSize}
                className={`sm:hidden px-2.5 h-9 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-1 ${
                  fontSizeScale !== "normal"
                    ? "bg-purple-600 text-white border-purple-500"
                    : isDark
                    ? "bg-white/10 border-white/15 text-purple-100"
                    : "bg-slate-100 border-slate-200/90 text-slate-800"
                }`}
                title="ปรับขนาดตัวอักษร"
              >
                <span>ก+</span>
                <span className="text-[10px] opacity-80">
                  {fontSizeScale === "normal" ? "100%" : fontSizeScale === "large" ? "115%" : "125%"}
                </span>
              </button>

              {/* Desktop Font Size Control */}
              <div
                className={`hidden sm:flex items-center rounded-xl p-0.5 border text-xs ${
                  isDark
                    ? "bg-white/5 border-white/10 text-purple-100"
                    : "bg-slate-100 border-slate-200/80 text-slate-800"
                }`}
              >
                <button
                  type="button"
                  onClick={handleDecreaseFontSize}
                  disabled={fontSizeScale === "normal"}
                  className="px-2 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 font-bold whitespace-nowrap"
                >
                  ก-
                </button>
                <button
                  type="button"
                  onClick={handleToggleFontSize}
                  className={`px-2.5 h-8 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors ${
                    fontSizeScale !== "normal"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  <Type className="w-3.5 h-3.5 inline mr-1" />
                  <span>
                    {fontSizeScale === "normal" ? "100%" : fontSizeScale === "large" ? "115%" : "125%"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleIncreaseFontSize}
                  disabled={fontSizeScale === "xlarge"}
                  className="px-2 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 font-bold whitespace-nowrap"
                >
                  ก+
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                  isDark
                    ? "bg-white/10 border-white/15 text-amber-300 hover:bg-white/15"
                    : "bg-slate-100 border-slate-200/90 text-slate-700 hover:bg-slate-200/70"
                }`}
                title={isDark ? "สลับเป็นธีมสว่าง" : "สลับเป็นธีมมืด"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Auth / User Pill */}
              {currentUser ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveView(currentUser.Role)}
                    className="h-9 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold whitespace-nowrap max-w-[110px] sm:max-w-[160px] truncate shadow-xs"
                  >
                    {currentUser.Full_Name.split(" ")[0]}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                      isDark
                        ? "border-white/15 bg-white/5 text-purple-200 hover:bg-red-500/20 hover:text-red-300"
                        : "border-slate-200/90 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                    }`}
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginModalRole("ADMIN")}
                  className={`h-9 px-3 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-colors ${
                    isDark
                      ? "border-white/15 bg-white/10 hover:bg-white/15 text-purple-100"
                      : "border-slate-200/90 bg-slate-100 hover:bg-slate-200/70 text-slate-800"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>แอดมิน</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ====================================================================
          VIEW 1: หน้าหลัก (HOME) - macOS Sequoia Clean Bento Workspace
         ==================================================================== */}
      {activeView === "HOME" && (
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
          {/* 1. ปุ่มหลัก 2 ปุ่มเด่นๆ (สำหรับอาจารย์ผู้สอน & สำหรับผู้บริหาร) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* การ์ด 1: เข้าสู่ระบบอาจารย์ผู้สอน */}
            <div
              onClick={() => {
                if (currentUser?.Role === "INSTRUCTOR") setActiveView("INSTRUCTOR");
                else setLoginModalRole("INSTRUCTOR");
              }}
              className={`group relative overflow-hidden rounded-3xl p-5 sm:p-7 text-white border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[175px] sm:min-h-[200px] ${
                isDark
                  ? "bg-gradient-to-br from-[#5B21B6] via-[#3B0764] to-[#1E0938] border-purple-400/30 shadow-xl"
                  : "bg-gradient-to-br from-[#6D28D9] via-[#5B21B6] to-[#4C1D95] border-purple-300/40 shadow-[0_12px_30px_rgba(109,40,217,0.22)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-md shrink-0">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${
                    isSubmissionOpen
                      ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/30"
                      : "bg-amber-500/20 text-amber-100 border-amber-400/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSubmissionOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {isSubmissionOpen ? "เปิดรับข้อมูล" : "ปิดรับชั่วคราว"}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight text-balance">
                    เข้าสู่ระบบอาจารย์ผู้สอน
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-100/90 mt-1 line-clamp-2">
                    ตรวจสอบประวัติและยืนยันข้อมูลแผนประจำปีการศึกษา 2570–2574
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white text-purple-950 flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* การ์ด 2: เข้าสู่ระบบผู้บริหาร */}
            <div
              onClick={() => {
                if (currentUser?.Role === "EXECUTIVE") setActiveView("EXECUTIVE");
                else setLoginModalRole("EXECUTIVE");
              }}
              className={`group relative overflow-hidden rounded-3xl p-5 sm:p-7 text-white border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[175px] sm:min-h-[200px] ${
                isDark
                  ? "bg-gradient-to-br from-[#701A75] via-[#4A044E] to-[#1F082B] border-fuchsia-400/30 shadow-xl"
                  : "bg-gradient-to-br from-[#7E22CE] via-[#6B21A8] to-[#4A044E] border-fuchsia-300/40 shadow-[0_12px_30px_rgba(126,34,206,0.2)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-md shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-purple-100 whitespace-nowrap">
                  12 สาขาวิชา
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-black tracking-tight text-balance">
                    เข้าสู่ระบบผู้บริหาร
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-100/90 mt-1 line-clamp-2">
                    สำหรับหัวหน้าสาขาวิชา ติดตามและรายงานแผนพัฒนาหลักสูตร
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white text-purple-950 flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </section>

          {/* 2. แถบสถิติจากฐานข้อมูล (Compact macOS Widgets - เหมาะกับมือถือ 2x2) */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`rounded-2xl p-3.5 sm:p-4 border ${
                isDark
                  ? "bg-[#181030] border-white/10"
                  : "bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              }`}
            >
              <span className="text-[11px] sm:text-xs opacity-65 block">คณาจารย์ทั้งหมด</span>
              <p className="text-lg sm:text-2xl font-black mt-0.5">
                {teachersList.length} <span className="text-xs font-normal opacity-65">ท่าน</span>
              </p>
            </div>

            <div
              className={`rounded-2xl p-3.5 sm:p-4 border ${
                isDark
                  ? "bg-[#181030] border-white/10"
                  : "bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              }`}
            >
              <span className="text-[11px] sm:text-xs opacity-65 block">สาขาวิชา</span>
              <p className="text-lg sm:text-2xl font-black mt-0.5">
                {EDUCATION_PROGRAMS.length} <span className="text-xs font-normal opacity-65">สาขา</span>
              </p>
            </div>

            <div
              className={`rounded-2xl p-3.5 sm:p-4 border ${
                isDark
                  ? "bg-[#181030] border-white/10"
                  : "bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              }`}
            >
              <span className="text-[11px] sm:text-xs opacity-65 block">ยืนยันข้อมูลแล้ว</span>
              <p className="text-lg sm:text-2xl font-black mt-0.5 text-emerald-500">
                {teacherSurveys.filter((s) => s.Is_Submitted).length}{" "}
                <span className="text-xs font-normal opacity-65">ท่าน</span>
              </p>
            </div>

            <div
              className={`rounded-2xl p-3.5 sm:p-4 border ${
                isDark
                  ? "bg-[#181030] border-white/10"
                  : "bg-white border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              }`}
            >
              <span className="text-[11px] sm:text-xs opacity-65 block">คลัง E-Book</span>
              <p className="text-lg sm:text-2xl font-black mt-0.5">
                {portfolioWorks.filter((w) => w.Is_Public).length}{" "}
                <span className="text-xs font-normal opacity-65">เล่ม</span>
              </p>
            </div>
          </section>

          {/* 3. ระบบค้นหาทำเนียบอาจารย์ & คลัง E-Book (macOS Window Card) */}
          <section
            className={`rounded-3xl border overflow-hidden ${
              isDark
                ? "bg-[#181030] border-white/10"
                : "bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            }`}
          >
            {/* macOS Window Title Bar */}
            <div
              className={`px-4 sm:px-6 py-3.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/80 border-slate-200/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <h3 className="text-sm sm:text-base font-bold">
                  สืบค้นทำเนียบอาจารย์และคลัง E-Book
                </h3>
              </div>

              {/* macOS Segmented Control */}
              <div
                className={`grid grid-cols-2 sm:inline-flex p-1 rounded-xl border ${
                  isDark ? "bg-[#0D081D] border-white/10" : "bg-slate-200/70 border-slate-300/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPublicHubTab("FACULTY")}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    publicHubTab === "FACULTY"
                      ? isDark
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-900 shadow-xs"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span>อาจารย์ ({publicTeachersFiltered.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPublicHubTab("EBOOKS")}
                  className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    publicHubTab === "EBOOKS"
                      ? isDark
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-900 shadow-xs"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>E-Book ({publicWorksFiltered.length})</span>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* 3 ช่องค้นหา: พิมพ์ค้นหา / เลือกสาขาวิชา / เลือกรายชื่ออาจารย์ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={publicSearch}
                    onChange={(e) => setPublicSearch(e.target.value)}
                    placeholder="ค้นหาชื่ออาจารย์, สาขา, วุฒิ..."
                    className={`w-full pl-10 pr-8 h-10 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark
                        ? "border-white/15 bg-[#0D081D] text-white placeholder-purple-300/40"
                        : "border-slate-200 bg-slate-50/70 text-slate-900 placeholder-slate-400 focus:bg-white"
                    }`}
                  />
                  {publicSearch && (
                    <button
                      type="button"
                      onClick={() => setPublicSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <select
                    value={publicDeptFilter}
                    onChange={(e) => {
                      setPublicDeptFilter(e.target.value);
                      setPublicTeacherFilter("ALL");
                    }}
                    className={`w-full px-3 h-10 text-xs sm:text-sm rounded-xl border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark
                        ? "border-white/15 bg-[#0D081D] text-white"
                        : "border-slate-200 bg-slate-50/70 text-slate-900"
                    }`}
                  >
                    <option value="ALL">เลือกตามสาขาวิชา (12 สาขา)</option>
                    {EDUCATION_PROGRAMS.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={publicTeacherFilter}
                    onChange={(e) => setPublicTeacherFilter(e.target.value)}
                    className={`w-full px-3 h-10 text-xs sm:text-sm rounded-xl border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark
                        ? "border-white/15 bg-[#0D081D] text-white"
                        : "border-slate-200 bg-slate-50/70 text-slate-900"
                    }`}
                  >
                    <option value="ALL">เลือกรายชื่ออาจารย์ ({availableTeachers.length} ท่าน)</option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.program.replace(/^สาขาวิชา/, "")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(publicDeptFilter !== "ALL" || publicTeacherFilter !== "ALL" || publicSearch) && (
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="opacity-75">
                    พบข้อมูล{" "}
                    <strong>
                      {publicHubTab === "FACULTY"
                        ? `${publicTeachersFiltered.length} ท่าน`
                        : `${publicWorksFiltered.length} เล่ม`}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPublicSearch("");
                      setPublicDeptFilter("ALL");
                      setPublicTeacherFilter("ALL");
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-purple-600 dark:text-purple-300 bg-purple-500/10"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>ล้างตัวกรอง</span>
                  </button>
                </div>
              )}

              {/* TAB 1: ทำเนียบอาจารย์ */}
              {publicHubTab === "FACULTY" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {publicTeachersFiltered.map((teacher) => (
                    <div
                      key={teacher.id}
                      onClick={() => setSelectedTeacherModal(teacher)}
                      className={`group rounded-2xl border p-4 transition-all cursor-pointer ${
                        isDark
                          ? "border-white/10 bg-white/[0.03] hover:border-purple-500/50"
                          : "border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-purple-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg truncate ${
                            isDark ? "bg-purple-900/60 text-purple-200" : "bg-purple-100 text-purple-900"
                          }`}
                        >
                          {teacher.program}
                        </span>
                        <span className="text-[11px] font-mono opacity-50 shrink-0">{teacher.id}</span>
                      </div>

                      <h4 className="font-bold text-sm sm:text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {teacher.name}
                      </h4>

                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 dark:border-white/10 space-y-1">
                        {teacher.degrees.map((d, idx) => (
                          <div key={idx} className="text-xs flex items-start gap-1.5 opacity-80">
                            <span className="font-bold shrink-0">• {d.level}:</span>
                            <span className="truncate">
                              {d.degree} {d.major ? `(${d.major})` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: คลัง E-Book */}
              {publicHubTab === "EBOOKS" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {publicWorksFiltered.map((work) => (
                    <div
                      key={work.Work_ID}
                      onClick={() => setSelectedWorkModal(work)}
                      className={`group rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                        isDark
                          ? "border-white/10 bg-white/[0.03] hover:border-purple-500/50"
                          : "border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-purple-300 hover:shadow-md"
                      }`}
                    >
                      <div>
                        <div className="h-32 rounded-xl p-3.5 flex flex-col justify-between mb-3 bg-gradient-to-br from-[#4C1D95] to-[#1E1B4B] text-white">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-white/15 font-semibold">
                              {work.Category}
                            </span>
                            <span className="font-mono opacity-80">พ.ศ. {work.Academic_Year}</span>
                          </div>
                          <h4 className="font-bold text-sm line-clamp-2">{work.Title}</h4>
                        </div>
                        <p className="text-xs font-bold">{work.Instructor_Name}</p>
                        <p className="text-[11px] opacity-65 mt-0.5">{work.Department}</p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-300">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> เปิดอ่าน
                        </span>
                        <span className="font-normal opacity-65">{work.Downloads} ครั้ง</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {/* ====================================================================
          VIEW 2: ระบบอาจารย์ผู้สอน (INSTRUCTOR PORTAL)
          - โชว์ข้อมูลทั้งหมดของอาจารย์ทันทีเมื่อล็อกอิน (ประวัติ + ข้อมูลแบบสำรวจทั้ง 3 หมวดที่กรอกไว้)
          - มีปุ่มกดยืนยันความถูกต้องในครั้งแรกและครั้งเดียว (One-Click Verification)
          - กดแก้ไขแยกแต่ละส่วนได้ด้วยตนเอง บันทึกฐานข้อมูลแบบเรียลไทม์ (Real-time Save)
         ==================================================================== */}
      {activeView === "INSTRUCTOR" && currentUser && currentTeacherSurvey && currentTeacherProfile && (
        <main className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5">
          {/* แบนเนอร์เมื่อแอดมินกำลังแก้ไขข้อมูลให้อาจารย์ */}
          {adminEditingStaffId && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/15 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm font-bold">
                โหมดแอดมิน: กำลังตรวจสอบและแก้ไขข้อมูลของ{" "}
                <span className="underline">
                  {currentTeacherProfile.name} ({adminEditingStaffId})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminEditingStaffId(null);
                  setEditingSection("NONE");
                  setActiveView("ADMIN");
                  setAdminMenu("INSTRUCTORS");
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs whitespace-nowrap self-start sm:self-auto"
              >
                ← กลับหน้าแอดมิน
              </button>
            </div>
          )}

          {/* ====================================================================
              TOP VERIFICATION BANNER (ยืนยันข้อมูลครั้งแรกและครั้งเดียว + สถานะ Real-time)
             ==================================================================== */}
          <div
            className={`rounded-3xl p-5 sm:p-6 border transition-all ${
              currentTeacherSurvey.Is_Submitted
                ? isDark
                  ? "bg-emerald-950/30 border-emerald-500/40 text-white"
                  : "bg-emerald-50/90 border-emerald-300/80 text-slate-900"
                : isDark
                ? "bg-gradient-to-br from-[#3B0764] via-[#270949] to-[#16072C] border-purple-400/40 text-white shadow-xl"
                : "bg-gradient-to-br from-[#5B21B6] via-[#4C1D95] to-[#3B0764] border-purple-400/30 text-white shadow-lg"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {currentTeacherSurvey.Is_Submitted ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ยืนยันข้อมูลเรียบร้อยแล้ว</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-purple-950">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>รอการยืนยันข้อมูลครั้งแรก</span>
                    </span>
                  )}

                  <span className="text-xs opacity-80 font-mono">
                    {lastRealtimeSavedAt
                      ? `● บันทึกเรียลไทม์ล่าสุดเมื่อ ${lastRealtimeSavedAt} น.`
                      : `● อัปเดตล่าสุด: ${currentTeacherSurvey.Updated_At}`}
                  </span>
                </div>

                <h2 className="text-base sm:text-xl font-black text-balance pt-1">
                  {currentTeacherSurvey.Is_Submitted
                    ? "ข้อมูลประวัติและแผนประจำปีการศึกษา 2570–2574 ของท่านได้รับการยืนยันแล้ว"
                    : "กรุณาตรวจสอบข้อมูลประวัติและข้อมูลแบบสำรวจ 2570–2574 ของท่านด้านล่าง"}
                </h2>
                <p className="text-xs sm:text-sm opacity-85">
                  {currentTeacherSurvey.Is_Submitted
                    ? "หากต้องการแก้ไขเพิ่มเติม สามารถกดปุ่ม 'แก้ไขส่วนนี้' ในแต่ละหัวข้อได้ทันที ระบบจะบันทึกอัตโนมัติแบบเรียลไทม์"
                    : "ตรวจสอบข้อมูลทั้ง 4 ส่วนด้านล่าง หากส่วนใดไม่ถูกต้องสามารถกด 'แก้ไขส่วนนี้' ได้ทันที เมื่อถูกต้องครบถ้วนแล้วกดปุ่มยืนยันเพียงครั้งเดียว"}
                </p>
              </div>

              {!currentTeacherSurvey.Is_Submitted && canEditSurvey && (
                <button
                  type="button"
                  onClick={handleConfirmAllData}
                  className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-purple-950 font-black text-xs sm:text-sm shadow-lg whitespace-nowrap flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>ยืนยันข้อมูลถูกต้องทั้งหมด</span>
                </button>
              )}
            </div>
          </div>

          {/* ====================================================================
              ส่วนที่ 1: ข้อมูลประวัติและคุณวุฒิการศึกษา (Profile & Qualifications)
             ==================================================================== */}
          <section
            className={`rounded-3xl border overflow-hidden transition-all ${
              isDark
                ? "bg-[#181030] border-white/10"
                : "bg-white border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            }`}
          >
            {/* macOS Window Header */}
            <div
              className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-2 ${
                isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/90 border-slate-200/80"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <h3 className="font-bold text-sm sm:text-base truncate">
                  ข้อมูลประวัติและคุณวุฒิการศึกษา
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 whitespace-nowrap ${
                    isDark
                      ? "border-white/15 bg-white/5 text-purple-200 hover:bg-white/10"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="hidden sm:inline">รหัสผ่าน</span>
                </button>

                {canEditSurvey && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditingSection(editingSection === "PROFILE" ? "NONE" : "PROFILE")
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      editingSection === "PROFILE"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {editingSection === "PROFILE" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>เสร็จสิ้น</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไขส่วนนี้</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              {editingSection !== "PROFILE" ? (
                /* VIEW MODE: ส่วนที่ 1 */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/80 border-slate-200/70"
                      }`}
                    >
                      <span className="opacity-60 block mb-0.5">ชื่อ-สกุล</span>
                      <p className="text-sm sm:text-base font-bold">{currentTeacherProfile.name}</p>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl border ${
                        isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/80 border-slate-200/70"
                      }`}
                    >
                      <span className="opacity-60 block mb-0.5">รหัสบุคลากร</span>
                      <p className="text-sm sm:text-base font-mono font-bold text-purple-600 dark:text-purple-400">
                        {currentTeacherProfile.id}
                      </p>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl border ${
                        isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/80 border-slate-200/70"
                      }`}
                    >
                      <span className="opacity-60 block mb-0.5">สังกัดหน่วยงาน / สาขาวิชา</span>
                      <p className="text-sm font-bold">{currentTeacherProfile.program}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold opacity-70 block mb-2">
                      ระดับการศึกษาและคุณวุฒิ ({currentTeacherProfile.degrees.length} รายการ)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentTeacherProfile.degrees.map((deg, i) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-2xl border ${
                            isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/80 border-slate-200/70"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-purple-600 dark:text-purple-300">
                              {deg.level}
                            </span>
                            {deg.year && <span className="font-mono opacity-60">พ.ศ. {deg.year}</span>}
                          </div>
                          <p className="text-xs sm:text-sm font-bold">
                            {deg.degree} {deg.major ? `(${deg.major})` : ""}
                          </p>
                          <p className="text-xs opacity-70 mt-0.5">{deg.institution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE: ส่วนที่ 1 (บันทึกเรียลไทม์ทันทีที่พิมพ์) */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold mb-1">ชื่อ-สกุล</label>
                      <input
                        type="text"
                        value={currentTeacherProfile.name}
                        onChange={(e) =>
                          updateTeacherProfileRealtime((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className={`w-full px-3.5 h-10 rounded-xl border font-bold text-sm ${
                          isDark
                            ? "bg-[#0D081D] border-white/15 text-white"
                            : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">สังกัดสาขาวิชา</label>
                      <select
                        value={currentTeacherProfile.program}
                        onChange={(e) =>
                          updateTeacherProfileRealtime((prev) => ({
                            ...prev,
                            program: e.target.value,
                          }))
                        }
                        className={`w-full px-3 h-10 rounded-xl border font-bold text-sm ${
                          isDark
                            ? "bg-[#0D081D] border-white/15 text-white"
                            : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      >
                        {EDUCATION_PROGRAMS.map((prog) => (
                          <option key={prog} value={prog}>
                            {prog}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold">รายการวุฒิการศึกษา</label>
                      <button
                        type="button"
                        onClick={() =>
                          updateTeacherProfileRealtime((prev) => ({
                            ...prev,
                            degrees: [
                              ...prev.degrees,
                              {
                                level: "ปริญญาเอก",
                                year: "",
                                degree: "",
                                major: "",
                                institution: "",
                              },
                            ],
                          }))
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" /> เพิ่มวุฒิการศึกษา
                      </button>
                    </div>

                    {currentTeacherProfile.degrees.map((deg: DegreeInfo, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end text-xs ${
                          isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="sm:col-span-2">
                          <label className="block opacity-70 mb-1">ระดับ</label>
                          <select
                            value={deg.level}
                            onChange={(e) => {
                              const next = [...currentTeacherProfile.degrees];
                              next[idx] = { ...next[idx], level: e.target.value };
                              updateTeacherProfileRealtime((prev) => ({ ...prev, degrees: next }));
                            }}
                            className={`w-full px-2.5 h-9 rounded-lg border font-bold ${
                              isDark ? "bg-[#0D081D] border-white/15" : "bg-white border-slate-300"
                            }`}
                          >
                            <option value="ปริญญาเอก">ปริญญาเอก</option>
                            <option value="ปริญญาโท">ปริญญาโท</option>
                            <option value="ปริญญาตรี">ปริญญาตรี</option>
                          </select>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block opacity-70 mb-1">ชื่อวุฒิ (เช่น ปร.ด., ศษ.ม.)</label>
                          <input
                            type="text"
                            value={deg.degree}
                            onChange={(e) => {
                              const next = [...currentTeacherProfile.degrees];
                              next[idx] = { ...next[idx], degree: e.target.value };
                              updateTeacherProfileRealtime((prev) => ({ ...prev, degrees: next }));
                            }}
                            className={`w-full px-2.5 h-9 rounded-lg border ${
                              isDark ? "bg-[#0D081D] border-white/15" : "bg-white border-slate-300"
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block opacity-70 mb-1">สาขาวิชา</label>
                          <input
                            type="text"
                            value={deg.major}
                            onChange={(e) => {
                              const next = [...currentTeacherProfile.degrees];
                              next[idx] = { ...next[idx], major: e.target.value };
                              updateTeacherProfileRealtime((prev) => ({ ...prev, degrees: next }));
                            }}
                            className={`w-full px-2.5 h-9 rounded-lg border ${
                              isDark ? "bg-[#0D081D] border-white/15" : "bg-white border-slate-300"
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block opacity-70 mb-1">สถาบัน</label>
                          <input
                            type="text"
                            value={deg.institution}
                            onChange={(e) => {
                              const next = [...currentTeacherProfile.degrees];
                              next[idx] = { ...next[idx], institution: e.target.value };
                              updateTeacherProfileRealtime((prev) => ({ ...prev, degrees: next }));
                            }}
                            className={`w-full px-2.5 h-9 rounded-lg border ${
                              isDark ? "bg-[#0D081D] border-white/15" : "bg-white border-slate-300"
                            }`}
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const next = currentTeacherProfile.degrees.filter((_, i) => i !== idx);
                              updateTeacherProfileRealtime((prev) => ({ ...prev, degrees: next }));
                            }}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-500/10"
                            title="ลบวุฒินี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ====================================================================
              ส่วนที่ 2: ข้อมูลด้านงานวิจัย (พ.ศ. 2570–2574)
             ==================================================================== */}
          <section
            className={`rounded-3xl border overflow-hidden transition-all ${
              isDark
                ? "bg-[#181030] border-white/10"
                : "bg-white border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            }`}
          >
            {/* Header */}
            <div
              className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-2 ${
                isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/90 border-slate-200/80"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <Lightbulb className="w-4 h-4 text-purple-500 shrink-0 hidden sm:inline" />
                <h3 className="font-bold text-sm sm:text-base truncate">
                  ข้อมูลด้านงานวิจัย (พ.ศ. 2570–2574)
                </h3>
              </div>

              {canEditSurvey && (
                <button
                  type="button"
                  onClick={() =>
                    setEditingSection(editingSection === "RESEARCH" ? "NONE" : "RESEARCH")
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                    editingSection === "RESEARCH"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 hover:bg-purple-600 hover:text-white"
                  }`}
                >
                  {editingSection === "RESEARCH" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>เสร็จสิ้น</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไขส่วนนี้</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {editingSection !== "RESEARCH" ? (
                /* VIEW MODE: ส่วนที่ 2 (แสดงข้อมูลงานวิจัยที่กรอกไว้ชัดเจน) */
                <div className="space-y-5">
                  {/* 2.1 จำนวนงานวิจัย */}
                  <div>
                    <span className="text-xs font-bold opacity-70 block mb-2.5">
                      1. จำนวนงานวิจัยที่คาดว่าจะทำในปีการศึกษา 2570–2574
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: "วิจัยในชั้นเรียน", val: currentTeacherSurvey.research_classroom },
                        { label: "วิจัยเพื่อการศึกษา", val: currentTeacherSurvey.research_education },
                        { label: "วิจัยเพื่อการพัฒนา", val: currentTeacherSurvey.research_development },
                        { label: "อื่นๆ", val: currentTeacherSurvey.research_other },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-2xl border ${
                            isDark
                              ? "bg-white/[0.03] border-white/10"
                              : "bg-slate-50/80 border-slate-200/70"
                          }`}
                        >
                          <span className="opacity-70 block">{item.label}</span>
                          <p className="text-lg sm:text-xl font-black mt-1 text-purple-600 dark:text-purple-300">
                            {item.val} <span className="text-xs font-normal opacity-70">เรื่อง</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2.2 แหล่งทุนวิจัยที่เลือก */}
                  <div>
                    <span className="text-xs font-bold opacity-70 block mb-2.5">
                      2. แหล่งทุนที่คาดว่าจะเสนอโครงการวิจัย (2570–2574)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      {Object.entries(currentTeacherSurvey.research_funding_sources || {})
                        .filter(([, years]) => Array.isArray(years) && years.length > 0)
                        .map(([fundName, years]) => (
                          <div
                            key={fundName}
                            className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              isDark
                                ? "bg-white/[0.03] border-white/10"
                                : "bg-slate-50/80 border-slate-200/70"
                            }`}
                          >
                            <span className="font-bold leading-snug">{fundName}</span>
                            <div className="flex flex-wrap gap-1 shrink-0">
                              {years.map((y) => (
                                <span
                                  key={y}
                                  className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-bold text-[11px] whitespace-nowrap"
                                >
                                  พ.ศ. {y}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* 2.3 งบประมาณวิจัยรายปี */}
                  <div>
                    <span className="text-xs font-bold opacity-70 block mb-2.5">
                      3. งบประมาณที่คาดว่าจะได้รับจากโครงการวิจัย (บาท/ปี)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      {SURVEY_YEARS.map((y) => (
                        <div
                          key={y}
                          className={`p-3 rounded-2xl border ${
                            isDark
                              ? "bg-white/[0.03] border-white/10"
                              : "bg-slate-50/80 border-slate-200/70"
                          }`}
                        >
                          <span className="font-bold text-purple-600 dark:text-purple-300 block">
                            พ.ศ. {y}
                          </span>
                          <p className="font-bold text-xs sm:text-sm mt-1">
                            {currentTeacherSurvey.research_budgets?.[String(y)] || "-"}
                          </p>
                          <span className="text-[10px] opacity-60">บาท</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE: ส่วนที่ 2 (ออกแบบใหม่ให้เข้าใจง่าย กดง่ายบนมือถือ) */
                <div className="space-y-6">
                  {/* ข้อ 1: จำนวนงานวิจัย */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold">
                        1. จำนวนงานวิจัยที่ท่านคาดว่าจะทำในปีการศึกษา 2570–2574
                      </label>
                      <p className="text-xs opacity-70 mt-0.5">
                        กดเลือกจำนวน 1–5 เรื่อง หรือกดปุ่ม +/- หากมีมากกว่า 5 เรื่อง (หากไม่มีเลือก 0)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {[
                        { key: "research_classroom", label: "โครงการวิจัยในชั้นเรียน" },
                        { key: "research_education", label: "โครงการวิจัยเพื่อการศึกษา" },
                        { key: "research_development", label: "โครงการวิจัยเพื่อการพัฒนา" },
                        { key: "research_other", label: "อื่นๆ" },
                      ].map((item) => {
                        const val = Number(
                          currentTeacherSurvey[item.key as keyof TeacherSurveyPlan] || 0
                        );
                        return (
                          <div
                            key={item.key}
                            className={`p-4 rounded-2xl border space-y-3 ${
                              isDark ? "bg-white/[0.03] border-white/15" : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm">{item.label}</span>
                              <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-bold text-xs">
                                {val} เรื่อง
                              </span>
                            </div>

                            {/* ปุ่มเลือกด่วน 0 - 5 + ปุ่มเพิ่มลด */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-1">
                                {[0, 1, 2, 3, 4, 5].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() =>
                                      updateSurveyRealtime((prev) => ({
                                        ...prev,
                                        [item.key]: num,
                                      }))
                                    }
                                    className={`w-8 h-8 rounded-lg font-bold text-xs border transition-all ${
                                      val === num
                                        ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                                        : isDark
                                        ? "bg-[#0D081D] border-white/15 text-purple-200"
                                        : "bg-white border-slate-300 text-slate-700"
                                    }`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSurveyRealtime((prev) => ({
                                      ...prev,
                                      [item.key]: val + 1,
                                    }))
                                  }
                                  className="px-2.5 h-8 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-300 font-bold text-xs whitespace-nowrap"
                                >
                                  + เพิ่ม ({val})
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {currentTeacherSurvey.research_other > 0 && (
                      <input
                        type="text"
                        placeholder="ระบุรายละเอียดโครงการวิจัยอื่นๆ..."
                        value={currentTeacherSurvey.research_other_specify || ""}
                        onChange={(e) =>
                          updateSurveyRealtime((prev) => ({
                            ...prev,
                            research_other_specify: e.target.value,
                          }))
                        }
                        className={`w-full px-3.5 h-10 text-xs rounded-xl border ${
                          isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-white border-slate-300"
                        }`}
                      />
                    )}
                  </div>

                  {/* ข้อ 2: แหล่งทุนวิจัย (ออกแบบเป็น Checklist กดเลือกแหล่งทุนก่อน แล้วเลือกปี) */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-white/10">
                    <div>
                      <label className="block text-sm font-bold">
                        2. แหล่งทุนที่ท่านคาดว่าจะเสนอทุนโครงการวิจัยระหว่างปีการศึกษา 2570–2574
                      </label>
                      <p className="text-xs opacity-70 mt-0.5">
                        แตะเพื่อติ๊กเลือกแหล่งทุนที่สนใจ จากนั้นกดเลือกปี พ.ศ. ที่ต้องการยื่นขอทุน (เลือกได้หลายปี)
                      </p>
                    </div>

                    <div className="space-y-2">
                      {RESEARCH_FUND_OPTIONS.map((fund) => {
                        const activeYears =
                          currentTeacherSurvey.research_funding_sources?.[fund] || [];
                        const isSelected = activeYears.length > 0;

                        return (
                          <div
                            key={fund}
                            className={`rounded-2xl border p-3.5 transition-all ${
                              isSelected
                                ? isDark
                                  ? "bg-purple-950/40 border-purple-500/60"
                                  : "bg-purple-50/70 border-purple-300"
                                : isDark
                                ? "bg-white/[0.02] border-white/10 opacity-75"
                                : "bg-slate-50/60 border-slate-200/80 opacity-80"
                            }`}
                          >
                            <div
                              onClick={() => toggleFundSourceSelection(fund)}
                              className="flex items-start gap-3 cursor-pointer select-none"
                            >
                              <div
                                className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                                  isSelected
                                    ? "bg-purple-600 border-purple-600 text-white"
                                    : "border-slate-400 bg-transparent"
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs sm:text-sm font-bold leading-snug flex-1">
                                {fund}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="mt-3 pl-8 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] opacity-70 mr-1">เลือกปี พ.ศ.:</span>
                                {SURVEY_YEARS.map((y) => {
                                  const isYearActive = activeYears.includes(y);
                                  return (
                                    <button
                                      key={y}
                                      type="button"
                                      onClick={() => toggleResearchFundYear(fund, y)}
                                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border whitespace-nowrap transition-all ${
                                        isYearActive
                                          ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                                          : isDark
                                          ? "bg-[#0D081D] border-white/15 text-purple-200"
                                          : "bg-white border-slate-300 text-slate-700"
                                      }`}
                                    >
                                      {isYearActive ? `✓ ${y}` : y}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ข้อ 3: งบประมาณวิจัย */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-sm font-bold">
                          3. งบประมาณที่ท่านคาดว่าจะได้จากโครงการวิจัย (พ.ศ. 2570–2574)
                        </label>
                        <p className="text-xs opacity-70 mt-0.5">
                          เลือกช่วงงบประมาณ (บาท) ในแต่ละปีการศึกษา
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const firstVal =
                            currentTeacherSurvey.research_budgets?.["2570"] ||
                            RESEARCH_BUDGET_RANGES[1];
                          updateSurveyRealtime((prev) => ({
                            ...prev,
                            research_budgets: {
                              "2570": firstVal,
                              "2571": firstVal,
                              "2572": firstVal,
                              "2573": firstVal,
                              "2574": firstVal,
                            },
                          }));
                          showToast(`คัดลอกงบประมาณ (${firstVal} บาท) ไปยังทุกปีแล้ว`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-bold whitespace-nowrap self-start sm:self-auto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>ใช้งบเท่าปี 2570 ทุกปี</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs">
                      {SURVEY_YEARS.map((y) => {
                        const currentRange =
                          currentTeacherSurvey.research_budgets?.[String(y)] ||
                          RESEARCH_BUDGET_RANGES[1];
                        return (
                          <div
                            key={y}
                            className={`p-3 rounded-2xl border space-y-1.5 ${
                              isDark ? "bg-white/[0.03] border-white/15" : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <span className="font-bold block text-purple-600 dark:text-purple-300">
                              ปี พ.ศ. {y}
                            </span>
                            <select
                              value={currentRange}
                              onChange={(e) =>
                                updateSurveyRealtime((prev) => ({
                                  ...prev,
                                  research_budgets: {
                                    ...prev.research_budgets,
                                    [String(y)]: e.target.value,
                                  },
                                }))
                              }
                              className={`w-full px-2.5 h-9 rounded-xl text-xs font-bold border ${
                                isDark
                                  ? "bg-[#0D081D] border-white/15 text-white"
                                  : "bg-white border-slate-300 text-slate-900"
                              }`}
                            >
                              {RESEARCH_BUDGET_RANGES.map((rng) => (
                                <option key={rng} value={rng}>
                                  {rng} บาท
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ====================================================================
              ส่วนที่ 3: ข้อมูลด้านการเรียนการสอน (พ.ศ. 2568–2570)
             ==================================================================== */}
          <section
            className={`rounded-3xl border overflow-hidden transition-all ${
              isDark
                ? "bg-[#181030] border-white/10"
                : "bg-white border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            }`}
          >
            {/* Header */}
            <div
              className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-2 ${
                isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/90 border-slate-200/80"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <BookOpen className="w-4 h-4 text-purple-500 shrink-0 hidden sm:inline" />
                <h3 className="font-bold text-sm sm:text-base truncate">
                  ข้อมูลด้านการเรียนการสอน
                </h3>
              </div>

              {canEditSurvey && (
                <button
                  type="button"
                  onClick={() =>
                    setEditingSection(editingSection === "TEACHING" ? "NONE" : "TEACHING")
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                    editingSection === "TEACHING"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 hover:bg-purple-600 hover:text-white"
                  }`}
                >
                  {editingSection === "TEACHING" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>เสร็จสิ้น</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไขส่วนนี้</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {editingSection !== "TEACHING" ? (
                /* VIEW MODE: ส่วนที่ 3 */
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold opacity-70 block mb-2.5">
                      1. จำนวนโหลดชั่วโมงที่สอนระหว่างปีการศึกษา 2568–2569
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {TEACHING_LOAD_SEMESTERS.map((sem) => (
                        <div
                          key={sem}
                          className={`p-3.5 rounded-2xl border ${
                            isDark
                              ? "bg-white/[0.03] border-white/10"
                              : "bg-slate-50/80 border-slate-200/70"
                          }`}
                        >
                          <span className="font-bold text-purple-600 dark:text-purple-300 block">
                            ภาคเรียน {sem}
                          </span>
                          <p className="font-bold text-xs sm:text-sm mt-1">
                            {currentTeacherSurvey.teaching_load?.[sem] || "-"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold opacity-70 block mb-2.5">
                      2 & 3. กิจกรรมให้นักศึกษาลงพื้นที่ และหน่วยงานที่จัดกิจกรรม (ภาคเรียน 1/2568 – 2/2570)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {FIELDWORK_SEMESTERS.map((sem) => {
                        const hasField = currentTeacherSurvey.fieldwork_presence?.[sem] === "มี";
                        return (
                          <div
                            key={sem}
                            className={`p-3.5 rounded-2xl border ${
                              isDark
                                ? "bg-white/[0.03] border-white/10"
                                : "bg-slate-50/80 border-slate-200/70"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold">ภาค {sem}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                  hasField
                                    ? "bg-emerald-500/15 text-emerald-500"
                                    : "bg-slate-500/15 opacity-60"
                                }`}
                              >
                                {hasField ? "มีลงพื้นที่" : "ไม่มี"}
                              </span>
                            </div>
                            <p className="text-xs font-bold truncate">
                              {hasField
                                ? currentTeacherSurvey.fieldwork_agencies?.[sem] || "-"
                                : "-"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT MODE: ส่วนที่ 3 */
                <div className="space-y-6">
                  {/* ข้อ 1: โหลดชั่วโมงสอน */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-sm font-bold">
                          1. จำนวนโหลดชั่วโมงที่ท่านสอนระหว่างปีการศึกษา 2568–2569
                        </label>
                        <p className="text-xs opacity-70 mt-0.5">
                          เลือกจำนวนชั่วโมงสอนต่อสัปดาห์ในแต่ละภาคเรียน
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const firstLoad =
                            currentTeacherSurvey.teaching_load?.["1/2568"] ||
                            TEACHING_LOAD_OPTIONS[2];
                          updateSurveyRealtime((prev) => ({
                            ...prev,
                            teaching_load: {
                              "1/2568": firstLoad,
                              "2/2568": firstLoad,
                              "1/2569": firstLoad,
                              "2/2569": firstLoad,
                            },
                          }));
                          showToast(`คัดลอกโหลดการสอน (${firstLoad}) ไปยังทุกภาคเรียนแล้ว`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-bold whitespace-nowrap self-start sm:self-auto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>ใช้ชั่วโมงเท่าเทอม 1/2568 ทุกเทอม</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {TEACHING_LOAD_SEMESTERS.map((sem) => {
                        const currentVal =
                          currentTeacherSurvey.teaching_load?.[sem] || TEACHING_LOAD_OPTIONS[2];
                        return (
                          <div
                            key={sem}
                            className={`p-3.5 rounded-2xl border space-y-1.5 ${
                              isDark ? "bg-white/[0.03] border-white/15" : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <span className="font-bold block text-purple-600 dark:text-purple-300">
                              ภาคเรียน {sem}
                            </span>
                            <select
                              value={currentVal}
                              onChange={(e) =>
                                updateSurveyRealtime((prev) => ({
                                  ...prev,
                                  teaching_load: {
                                    ...prev.teaching_load,
                                    [sem]: e.target.value,
                                  },
                                }))
                              }
                              className={`w-full px-2.5 h-9 rounded-xl text-xs font-bold border ${
                                isDark
                                  ? "bg-[#0D081D] border-white/15 text-white"
                                  : "bg-white border-slate-300 text-slate-900"
                              }`}
                            >
                              {TEACHING_LOAD_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ข้อ 2 & 3: ลงพื้นที่ + หน่วยงาน */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-white/10">
                    <div>
                      <label className="block text-sm font-bold">
                        2 & 3. กิจกรรมให้นักศึกษาลงพื้นที่ และหน่วยงานที่จัดกิจกรรม
                      </label>
                      <p className="text-xs opacity-70 mt-0.5">
                        กดเลือก &quot;มี&quot; หรือ &quot;ไม่มี&quot; ในแต่ละภาคเรียน และหาก &quot;มี&quot; ให้เลือกประเภทหน่วยงานด้านล่าง
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {FIELDWORK_SEMESTERS.map((sem) => {
                        const hasField = currentTeacherSurvey.fieldwork_presence?.[sem] === "มี";
                        const currentAgency =
                          currentTeacherSurvey.fieldwork_agencies?.[sem] ||
                          FIELDWORK_AGENCY_OPTIONS[0];

                        return (
                          <div
                            key={sem}
                            className={`p-3.5 rounded-2xl border space-y-2.5 ${
                              isDark ? "bg-white/[0.03] border-white/15" : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-purple-600 dark:text-purple-300">
                                ภาคเรียน {sem}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSurveyRealtime((prev) => ({
                                      ...prev,
                                      fieldwork_presence: {
                                        ...prev.fieldwork_presence,
                                        [sem]: "มี",
                                      },
                                    }))
                                  }
                                  className={`px-3 py-1 rounded-lg font-bold border whitespace-nowrap transition-colors ${
                                    hasField
                                      ? "bg-emerald-600 text-white border-emerald-500"
                                      : isDark
                                      ? "bg-[#0D081D] border-white/15 text-purple-200"
                                      : "bg-white border-slate-300 text-slate-600"
                                  }`}
                                >
                                  มี
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSurveyRealtime((prev) => ({
                                      ...prev,
                                      fieldwork_presence: {
                                        ...prev.fieldwork_presence,
                                        [sem]: "ไม่มี",
                                      },
                                    }))
                                  }
                                  className={`px-3 py-1 rounded-lg font-bold border whitespace-nowrap transition-colors ${
                                    !hasField
                                      ? "bg-slate-700 text-white border-slate-600"
                                      : isDark
                                      ? "bg-[#0D081D] border-white/15 text-purple-200"
                                      : "bg-white border-slate-300 text-slate-600"
                                  }`}
                                >
                                  ไม่มี
                                </button>
                              </div>
                            </div>

                            {hasField && (
                              <select
                                value={currentAgency}
                                onChange={(e) =>
                                  updateSurveyRealtime((prev) => ({
                                    ...prev,
                                    fieldwork_agencies: {
                                      ...prev.fieldwork_agencies,
                                      [sem]: e.target.value,
                                    },
                                  }))
                                }
                                className={`w-full px-2.5 h-9 rounded-xl text-xs font-bold border ${
                                  isDark
                                    ? "bg-[#0D081D] border-white/15 text-white"
                                    : "bg-white border-slate-300 text-slate-900"
                                }`}
                              >
                                {FIELDWORK_AGENCY_OPTIONS.map((agency) => (
                                  <option key={agency} value={agency}>
                                    {agency}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ====================================================================
              ส่วนที่ 4: ข้อมูลด้านบริการวิชาการ (พ.ศ. 2570–2574)
             ==================================================================== */}
          <section
            className={`rounded-3xl border overflow-hidden transition-all ${
              isDark
                ? "bg-[#181030] border-white/10"
                : "bg-white border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
            }`}
          >
            {/* Header */}
            <div
              className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-2 ${
                isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50/90 border-slate-200/80"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <HandHelping className="w-4 h-4 text-purple-500 shrink-0 hidden sm:inline" />
                <h3 className="font-bold text-sm sm:text-base truncate">
                  ข้อมูลด้านบริการวิชาการ (พ.ศ. 2570–2574)
                </h3>
              </div>

              {canEditSurvey && (
                <button
                  type="button"
                  onClick={() =>
                    setEditingSection(editingSection === "SERVICE" ? "NONE" : "SERVICE")
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                    editingSection === "SERVICE"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 hover:bg-purple-600 hover:text-white"
                  }`}
                >
                  {editingSection === "SERVICE" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>เสร็จสิ้น</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>แก้ไขส่วนนี้</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {editingSection !== "SERVICE" ? (
                /* VIEW MODE: ส่วนที่ 4 */
                <div className="space-y-5">
                  <div>
                    <span className="text-xs font-bold opacity-70 block mb-2.5">
                      4. จำนวนกิจกรรมบริการวิชาการที่คาดว่าจะดำเนินการ (พ.ศ. 2570–2574)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      {SURVEY_YEARS.map((y) => (
                        <div
                          key={y}
                          className={`p-3 rounded-2xl border ${
                            isDark
                              ? "bg-white/[0.03] border-white/10"
                              : "bg-slate-50/80 border-slate-200/70"
                          }`}
                        >
                          <span className="font-bold text-purple-600 dark:text-purple-300 block">
                            พ.ศ. {y}
                          </span>
                          <p className="text-base sm:text-lg font-black mt-1">
                            {currentTeacherSurvey.academic_services_count?.[String(y)] || 0}{" "}
                            <span className="text-xs font-normal opacity-70">กิจกรรม</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold opacity-70 block mb-2.5">
                      5. ชุมชนหรือกลุ่มเป้าหมายสำหรับการบริการวิชาการ (2570–2574)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      {Object.entries(currentTeacherSurvey.target_communities || {})
                        .filter(([, years]) => Array.isArray(years) && years.length > 0)
                        .map(([commName, years]) => (
                          <div
                            key={commName}
                            className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              isDark
                                ? "bg-white/[0.03] border-white/10"
                                : "bg-slate-50/80 border-slate-200/70"
                            }`}
                          >
                            <span className="font-bold">{commName}</span>
                            <div className="flex flex-wrap gap-1 shrink-0">
                              {years.map((y) => (
                                <span
                                  key={y}
                                  className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[11px] whitespace-nowrap"
                                >
                                  พ.ศ. {y}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-4 text-xs ${
                      isDark
                        ? "bg-white/[0.03] border-white/10"
                        : "bg-slate-50/80 border-slate-200/70"
                    }`}
                  >
                    <span className="font-bold">
                      6. หลักเกณฑ์ในการคัดเลือกชุมชนหรือกลุ่มเป้าหมาย
                    </span>
                    <span className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-black text-sm whitespace-nowrap">
                      {currentTeacherSurvey.selection_criteria_percentage}
                    </span>
                  </div>
                </div>
              ) : (
                /* EDIT MODE: ส่วนที่ 4 */
                <div className="space-y-6">
                  {/* ข้อ 4: จำนวนกิจกรรมรายปี */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold">
                        4. จำนวนกิจกรรมบริการวิชาการระหว่างปีการศึกษา 2570–2574
                      </label>
                      <p className="text-xs opacity-70 mt-0.5">
                        กดปุ่ม - / + เพื่อระบุจำนวนกิจกรรมในแต่ละปี พ.ศ.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      {SURVEY_YEARS.map((y) => {
                        const val = Number(
                          currentTeacherSurvey.academic_services_count?.[String(y)] || 0
                        );
                        return (
                          <div
                            key={y}
                            className={`p-3 rounded-2xl border text-center space-y-2 ${
                              isDark ? "bg-white/[0.03] border-white/15" : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <span className="font-bold block text-purple-600 dark:text-purple-300">
                              พ.ศ. {y}
                            </span>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  updateSurveyRealtime((prev) => ({
                                    ...prev,
                                    academic_services_count: {
                                      ...prev.academic_services_count,
                                      [String(y)]: Math.max(0, val - 1),
                                    },
                                  }))
                                }
                                className={`w-8 h-8 rounded-lg font-bold border ${
                                  isDark
                                    ? "bg-[#0D081D] border-white/15 text-white"
                                    : "bg-white border-slate-300 text-slate-900"
                                }`}
                              >
                                -
                              </button>
                              <span className="w-8 font-black text-sm">{val}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateSurveyRealtime((prev) => ({
                                    ...prev,
                                    academic_services_count: {
                                      ...prev.academic_services_count,
                                      [String(y)]: val + 1,
                                    },
                                  }))
                                }
                                className={`w-8 h-8 rounded-lg font-bold border ${
                                  isDark
                                    ? "bg-[#0D081D] border-white/15 text-white"
                                    : "bg-white border-slate-300 text-slate-900"
                                }`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ข้อ 5: ชุมชนหรือกลุ่มเป้าหมาย (Interactive Checklist) */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-white/10">
                    <div>
                      <label className="block text-sm font-bold">
                        5. ชุมชนหรือกลุ่มเป้าหมายที่คาดหวังสำหรับการบริการวิชาการ (พ.ศ. 2570–2574)
                      </label>
                      <p className="text-xs opacity-70 mt-0.5">
                        แตะเพื่อติ๊กเลือกกลุ่มเป้าหมายที่ต้องการดำเนินการ แล้วกดเลือกปี พ.ศ.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {TARGET_COMMUNITY_OPTIONS.map((comm) => {
                        const activeYears = currentTeacherSurvey.target_communities?.[comm] || [];
                        const isSelected = activeYears.length > 0;

                        return (
                          <div
                            key={comm}
                            className={`rounded-2xl border p-3.5 transition-all ${
                              isSelected
                                ? isDark
                                  ? "bg-emerald-950/30 border-emerald-500/60"
                                  : "bg-emerald-50/70 border-emerald-300"
                                : isDark
                                ? "bg-white/[0.02] border-white/10 opacity-75"
                                : "bg-slate-50/60 border-slate-200/80 opacity-80"
                            }`}
                          >
                            <div
                              onClick={() => toggleCommunitySelection(comm)}
                              className="flex items-start gap-3 cursor-pointer select-none"
                            >
                              <div
                                className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                                  isSelected
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "border-slate-400 bg-transparent"
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className="text-xs sm:text-sm font-bold leading-snug flex-1">
                                {comm}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="mt-3 pl-8 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] opacity-70 mr-1">เลือกปี พ.ศ.:</span>
                                {SURVEY_YEARS.map((y) => {
                                  const isYearActive = activeYears.includes(y);
                                  return (
                                    <button
                                      key={y}
                                      type="button"
                                      onClick={() => toggleTargetCommunityYear(comm, y)}
                                      className={`px-3 py-1.5 rounded-xl font-bold text-xs border whitespace-nowrap transition-all ${
                                        isYearActive
                                          ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                                          : isDark
                                          ? "bg-[#0D081D] border-white/15 text-purple-200"
                                          : "bg-white border-slate-300 text-slate-700"
                                      }`}
                                    >
                                      {isYearActive ? `✓ ${y}` : y}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ข้อ 6: หลักเกณฑ์ในการคัดเลือก */}
                  <div className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-white/10">
                    <div>
                      <label className="block text-sm font-bold">
                        6. หลักเกณฑ์ในการคัดเลือกชุมชนหรือกลุ่มเป้าหมาย
                      </label>
                      <p className="text-xs opacity-70 mt-0.5">
                        เลือกสัดส่วนความพร้อม/เกณฑ์การคัดเลือกกลุ่มเป้าหมาย (10% – 100%)
                      </p>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                      {CRITERIA_PERCENTAGE_OPTIONS.map((pct) => {
                        const isSelected =
                          currentTeacherSurvey.selection_criteria_percentage === pct;
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() =>
                              updateSurveyRealtime((prev) => ({
                                ...prev,
                                selection_criteria_percentage: pct,
                              }))
                            }
                            className={`h-10 rounded-xl text-xs font-black border whitespace-nowrap transition-all ${
                              isSelected
                                ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                                : isDark
                                ? "bg-[#0D081D] border-white/15 text-purple-200"
                                : "bg-white border-slate-300 text-slate-700"
                            }`}
                          >
                            {pct}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ====================================================================
              BOTTOM CONFIRMATION BAR (สำหรับกดยืนยันเมื่อไล่ตรวจครบทั้ง 4 ส่วน)
             ==================================================================== */}
          {canEditSurvey && (
            <div
              className={`rounded-3xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDark
                  ? "bg-[#181030] border-white/10"
                  : "bg-white border-slate-200/90 shadow-sm"
              }`}
            >
              <div>
                <p className="font-bold text-sm">
                  {currentTeacherSurvey.Is_Submitted
                    ? "✅ ข้อมูลของท่านได้รับการยืนยันและบันทึกในระบบแบบเรียลไทม์แล้ว"
                    : "ตรวจสอบข้อมูลครบทั้ง 4 ส่วนแล้วใช่หรือไม่?"}
                </p>
                <p className="text-xs opacity-70 mt-0.5">
                  ทุกการแก้ไขจะถูกบันทึกลงฐานข้อมูลแบบเรียลไทม์โดยอัตโนมัติ
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmAllData}
                className="px-6 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs sm:text-sm shadow-lg whitespace-nowrap flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {currentTeacherSurvey.Is_Submitted
                    ? "บันทึกและยืนยันข้อมูลล่าสุดอีกครั้ง"
                    : "ยืนยันข้อมูลถูกต้องทั้งหมด (ครั้งเดียว)"}
                </span>
              </button>
            </div>
          )}
        </main>
      )}

      {/* ====================================================================
          VIEW 3: ระบบสำหรับผู้บริหาร (EXECUTIVE PORTAL)
         ==================================================================== */}
      {activeView === "EXECUTIVE" && currentUser && (
        <main className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5">
          <div
            className={`rounded-3xl p-5 sm:p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark
                ? "bg-[#181030] border-white/10 text-white"
                : "bg-white border-slate-200/80 text-slate-900 shadow-xs"
            }`}
          >
            <div>
              <span className="text-xs font-bold text-purple-500">{currentUser.Department}</span>
              <h2 className="text-lg sm:text-2xl font-black mt-0.5">{currentUser.Full_Name}</h2>
            </div>
            <a
              href={GOOGLE_FORM_EXECUTIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white whitespace-nowrap shrink-0"
            >
              <span>แบบสำรวจผู้บริหาร</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div
              className={`p-4 sm:p-5 rounded-3xl border ${
                isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"
              }`}
            >
              <span className="text-xs opacity-70">อาจารย์ในสาขา</span>
              <p className="text-2xl font-black mt-1">
                {teachersList.filter((t) => t.program === currentUser.Department).length} ท่าน
              </p>
            </div>
            <div
              className={`p-4 sm:p-5 rounded-3xl border ${
                isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"
              }`}
            >
              <span className="text-xs opacity-70">ยืนยันข้อมูลแล้ว</span>
              <p className="text-2xl font-black mt-1 text-emerald-500">
                {
                  teacherSurveys.filter(
                    (s) => s.Department === currentUser.Department && s.Is_Submitted
                  ).length
                }{" "}
                ท่าน
              </p>
            </div>
            <div
              className={`p-4 sm:p-5 rounded-3xl border ${
                isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"
              }`}
            >
              <span className="text-xs opacity-70">ผลงาน E-Book ในสาขา</span>
              <p className="text-2xl font-black mt-1">
                {portfolioWorks.filter((w) => w.Department === currentUser.Department).length} เล่ม
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <form
              onSubmit={handleSaveExecutiveForm}
              className={`lg:col-span-5 rounded-3xl p-5 sm:p-6 border space-y-4 ${
                isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"
              }`}
            >
              <h3 className="font-bold text-base">บันทึกแผนพัฒนาหลักสูตร</h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">ปีการศึกษา</label>
                  <select
                    value={execFormState.Academic_Year}
                    onChange={(e) =>
                      setExecFormState({ ...execFormState, Academic_Year: Number(e.target.value) })
                    }
                    className={`w-full px-3 h-10 rounded-xl border font-bold ${
                      isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
                    }`}
                  >
                    {SURVEY_YEARS.map((y) => (
                      <option key={y} value={y}>
                        พ.ศ. {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">คะแนนประกันคุณภาพ</label>
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
                    className={`w-full px-3 h-10 rounded-xl border font-bold ${
                      isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
                    }`}
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold mb-1">แผนพัฒนาหลักสูตร (2570–2574)</label>
                <textarea
                  rows={3}
                  required
                  value={execFormState.Strategic_Plan_2570_2574}
                  onChange={(e) =>
                    setExecFormState({ ...execFormState, Strategic_Plan_2570_2574: e.target.value })
                  }
                  className={`w-full p-3 rounded-xl border ${
                    isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                บันทึกรายงาน
              </button>
            </form>

            <div
              className={`lg:col-span-7 rounded-3xl p-5 sm:p-6 border space-y-3 ${
                isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"
              }`}
            >
              <h3 className="font-bold text-base">รายชื่ออาจารย์ประจำ{currentUser.Department}</h3>
              <div className="divide-y divide-slate-200/60 dark:divide-white/10">
                {teachersList
                  .filter((t) => t.program === currentUser.Department)
                  .map((t) => {
                    const survey = teacherSurveys.find((s) => s.Staff_ID === t.id);
                    return (
                      <div key={t.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <span className="font-bold block sm:inline truncate">{t.name}</span>
                          <span className="opacity-60 font-mono sm:ml-2">({t.id})</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 ${
                            survey?.Is_Submitted
                              ? "bg-emerald-500/15 text-emerald-500"
                              : "bg-amber-500/15 text-amber-500"
                          }`}
                        >
                          {survey?.Is_Submitted ? "ยืนยันแล้ว" : "รอยืนยัน"}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          VIEW 4: ระบบแอดมิน (ADMIN COMMAND CENTER - Mobile & Desktop Ready)
         ==================================================================== */}
      {activeView === "ADMIN" && (
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Sidebar / Mobile Top Bar */}
          <aside
            className={`lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r p-3.5 sm:p-4 flex flex-col justify-between ${
              isDark ? "bg-[#130B29] border-white/10" : "bg-white border-slate-200/80"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm truncate">ผู้ดูแลระบบ</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-8 h-8 rounded-lg border border-purple-500/20 flex items-center justify-center"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView("HOME")}
                    className="lg:hidden px-2.5 h-8 rounded-lg border border-purple-500/20 text-xs font-bold whitespace-nowrap"
                  >
                    หน้าหลัก
                  </button>
                </div>
              </div>

              <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {[
                  { id: "INSTRUCTORS", label: "ข้อมูลอาจารย์", icon: FileText },
                  { id: "DASHBOARD", label: "สถิติภาพรวม", icon: LayoutDashboard },
                  { id: "FACULTY", label: "ทำเนียบ 67 ท่าน", icon: GraduationCap },
                  { id: "SETTINGS", label: "ตั้งค่าระบบ", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAdminMenu(item.id as typeof adminMenu)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                        adminMenu === item.id
                          ? "bg-purple-600 text-white shadow-xs"
                          : isDark
                          ? "text-purple-200 hover:bg-white/5"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="hidden lg:flex flex-col gap-2 pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveView("HOME")}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold border border-purple-500/20"
              >
                กลับหน้าหลัก
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-red-500/15 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </aside>

          {/* Main Admin Content */}
          <div className="flex-1 p-3.5 sm:p-8 space-y-5 max-w-6xl min-w-0">
            {adminMenu === "INSTRUCTORS" && (
              <div className="space-y-4">
                <div
                  className={`rounded-3xl p-4 sm:p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"
                  }`}
                >
                  <div>
                    <h2 className="text-base sm:text-xl font-bold">
                      แบบสำรวจแผนประจำปีการศึกษา 2570–2574
                    </h2>
                    <p className="text-xs opacity-70 mt-0.5">
                      ยืนยันแล้ว {teacherSurveys.filter((s) => s.Is_Submitted).length} จาก{" "}
                      {teachersList.length} ท่าน
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap ${
                        isSubmissionOpen
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-amber-500/15 text-amber-500"
                      }`}
                    >
                      {isSubmissionOpen ? "● เปิดรับข้อมูล" : "● ปิดรับข้อมูล"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isSubmissionOpen;
                        setIsSubmissionOpen(next);
                        showToast(next ? "เปิดรับแบบสำรวจแล้ว" : "ปิดรับแบบสำรวจแล้ว");
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap ${
                        isSubmissionOpen ? "bg-red-600" : "bg-emerald-600"
                      }`}
                    >
                      {isSubmissionOpen ? "สั่งปิด" : "สั่งเปิด"}
                    </button>
                  </div>
                </div>

                {/* Search & Filter */}
                <div
                  className={`rounded-3xl p-4 sm:p-5 border space-y-4 ${
                    isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                    <div className="md:col-span-5 relative">
                      <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ค้นหาชื่ออาจารย์ หรือ รหัส..."
                        value={adminTeacherSearch}
                        onChange={(e) => setAdminTeacherSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 h-10 rounded-xl border text-xs ${
                          isDark
                            ? "bg-[#0D081D] border-white/15 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>

                    <div className="md:col-span-4">
                      <select
                        value={adminTeacherDeptFilter}
                        onChange={(e) => setAdminTeacherDeptFilter(e.target.value)}
                        className={`w-full px-3 h-10 rounded-xl border text-xs font-medium ${
                          isDark
                            ? "bg-[#0D081D] border-white/15 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      >
                        <option value="ALL">ทุกสาขาวิชา (12 สาขา)</option>
                        {EDUCATION_PROGRAMS.map((prog) => (
                          <option key={prog} value={prog}>
                            {prog}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-3 grid grid-cols-3 rounded-xl p-1 border border-purple-500/20">
                      {(["ALL", "SUBMITTED", "PENDING"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAdminTeacherStatusFilter(st)}
                          className={`py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                            adminTeacherStatusFilter === st
                              ? "bg-purple-600 text-white"
                              : "opacity-70"
                          }`}
                        >
                          {st === "ALL" ? "ทั้งหมด" : st === "SUBMITTED" ? "ยืนยันแล้ว" : "รอยืนยัน"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile-Friendly Card List + Desktop Table */}
                  <div className="divide-y divide-slate-200/60 dark:divide-white/10">
                    {adminTeachersFiltered.map((teacher) => {
                      const survey = teacherSurveys.find(
                        (s) => s.Staff_ID.trim().toUpperCase() === teacher.id.trim().toUpperCase()
                      );
                      const isSubmitted = !!survey?.Is_Submitted;

                      return (
                        <div
                          key={teacher.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-purple-500">
                                {teacher.id}
                              </span>
                              <span className="font-bold text-sm truncate">{teacher.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                  isSubmitted
                                    ? "bg-emerald-500/15 text-emerald-500"
                                    : "bg-amber-500/15 text-amber-500"
                                }`}
                              >
                                {isSubmitted ? "ยืนยันแล้ว" : "รอยืนยัน"}
                              </span>
                            </div>
                            <p className="opacity-70 mt-0.5 truncate">{teacher.program}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {survey && (
                              <button
                                type="button"
                                onClick={() => setAdminViewingSurvey(survey)}
                                className="px-3 py-1.5 rounded-xl bg-purple-500/15 text-purple-500 dark:text-purple-300 font-bold whitespace-nowrap"
                              >
                                ดูข้อมูล
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setAdminEditingStaffId(teacher.id);
                                setEditingSection("NONE");
                                setActiveView("INSTRUCTOR");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold whitespace-nowrap"
                            >
                              แก้ไขข้อมูล
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {adminMenu === "DASHBOARD" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className={`p-4 rounded-3xl border ${isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"}`}>
                    <span className="text-xs opacity-70">คณาจารย์ทั้งหมด</span>
                    <p className="text-2xl font-black mt-1">{teachersList.length} ท่าน</p>
                  </div>
                  <div className={`p-4 rounded-3xl border ${isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"}`}>
                    <span className="text-xs opacity-70">ยืนยันแล้ว</span>
                    <p className="text-2xl font-black mt-1 text-emerald-500">
                      {teacherSurveys.filter((s) => s.Is_Submitted).length} ท่าน
                    </p>
                  </div>
                  <div className={`p-4 rounded-3xl border ${isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"}`}>
                    <span className="text-xs opacity-70">คลัง E-Book</span>
                    <p className="text-2xl font-black mt-1">{portfolioWorks.length} เล่ม</p>
                  </div>
                  <div className={`p-4 rounded-3xl border ${isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"}`}>
                    <span className="text-xs opacity-70">รายงานสาขาวิชา</span>
                    <p className="text-2xl font-black mt-1">{executiveForms.length} ฉบับ</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className={`p-5 rounded-3xl border space-y-4 ${isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"}`}>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <span>สถิติแผนและผลงาน (2570–2574)</span>
                    </h3>
                    <div className="h-44 flex items-end justify-around gap-2 pt-6 pb-2 border-b border-purple-500/15">
                      {adminChartData.map((d, idx) => {
                        const maxVal = Math.max(
                          ...adminChartData.map((x) => Math.max(x.formsCount, x.worksCount, 1)),
                          4
                        );
                        const hForm = Math.max((d.formsCount / maxVal) * 110, 8);
                        const hWork = Math.max((d.worksCount / maxVal) * 110, 8);
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                            <div className="flex items-end gap-1 h-28">
                              <div
                                style={{ height: `${hForm}px` }}
                                className="w-4 sm:w-6 rounded-t-md bg-purple-600"
                              />
                              <div
                                style={{ height: `${hWork}px` }}
                                className="w-4 sm:w-6 rounded-t-md bg-amber-400"
                              />
                            </div>
                            <span className="text-[11px] font-bold opacity-75">{d.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`p-5 rounded-3xl border space-y-4 ${isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"}`}>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span>จัดการคลัง E-Book</span>
                    </h3>
                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {portfolioWorks.map((w) => (
                        <div
                          key={w.Work_ID}
                          className="p-2.5 rounded-xl border border-purple-500/15 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="truncate">
                            <p className="font-bold truncate">{w.Title}</p>
                            <p className="opacity-60 text-[11px]">{w.Instructor_Name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleWorkVisibility(w)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap shrink-0 ${
                              w.Is_Public
                                ? "bg-emerald-500/15 text-emerald-500"
                                : "bg-slate-500/15 text-slate-400"
                            }`}
                          >
                            {w.Is_Public ? "สาธารณะ" : "ซ่อน"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {adminMenu === "FACULTY" && (
              <div className={`rounded-3xl p-5 border space-y-4 ${isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"}`}>
                <h2 className="text-base sm:text-lg font-bold">
                  ทำเนียบคณาจารย์ ({teachersList.length} ท่าน)
                </h2>
                <div className="divide-y divide-slate-200/60 dark:divide-white/10 text-xs">
                  {teachersList.map((t) => (
                    <div key={t.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="font-mono font-bold text-purple-500 mr-2">{t.id}</span>
                        <span className="font-bold">{t.name}</span>
                        <span className="opacity-70 ml-2">({t.program})</span>
                      </div>
                      <span className="opacity-80">
                        {t.degrees[0]?.level} ({t.degrees[0]?.degree})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminMenu === "SETTINGS" && (
              <div className={`rounded-3xl p-5 border space-y-4 ${isDark ? "bg-[#181030] border-white/10" : "bg-white border-slate-200/80"}`}>
                <h2 className="text-base sm:text-lg font-bold">ตั้งค่าระบบ</h2>
                <div className="p-4 rounded-2xl border border-purple-500/20 flex items-center justify-between gap-4">
                  <span className="font-bold text-xs sm:text-sm">
                    {isSubmissionOpen ? "เปิดรับแบบสำรวจแผน 2570–2574" : "ปิดรับแบบสำรวจชั่วคราว"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isSubmissionOpen;
                      setIsSubmissionOpen(next);
                      showToast(next ? "เปิดรับข้อมูลแล้ว" : "ปิดรับข้อมูลแล้ว");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap ${
                      isSubmissionOpen ? "bg-red-600" : "bg-emerald-600"
                    }`}
                  >
                    {isSubmissionOpen ? "สั่งปิด" : "สั่งเปิด"}
                  </button>
                </div>

                <a
                  href={SHEET_TEACHER_HISTORY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-500/30 text-xs font-bold"
                >
                  <span>เปิดฐานข้อมูล Google Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALS: ล็อกอิน, ประวัติอาจารย์, E-Book, ดูผลสำรวจ, เปลี่ยนรหัสผ่าน
         ==================================================================== */}
      {loginModalRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`rounded-3xl max-w-sm w-full p-5 sm:p-6 border shadow-2xl space-y-4 ${
              isDark
                ? "bg-[#181030] border-white/15 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 mr-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>
                <h3 className="text-base font-bold">
                  {loginModalRole === "INSTRUCTOR"
                    ? "เข้าสู่ระบบอาจารย์ผู้สอน"
                    : loginModalRole === "EXECUTIVE"
                    ? "เข้าสู่ระบบผู้บริหาร"
                    : "เข้าสู่ระบบแอดมิน"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginModalRole(null);
                  setLoginError("");
                }}
                className="p-1.5 rounded-full hover:bg-purple-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400 font-bold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1">รหัสผู้ใช้งาน</label>
                <input
                  type="text"
                  required
                  placeholder={
                    loginModalRole === "INSTRUCTOR"
                      ? "EDU-001"
                      : loginModalRole === "EXECUTIVE"
                      ? "HEAD-01"
                      : "ADMIN"
                  }
                  value={loginStaffId}
                  onChange={(e) => setLoginStaffId(e.target.value)}
                  className={`w-full px-3.5 h-10 text-sm rounded-xl border font-mono ${
                    isDark
                      ? "border-white/15 bg-[#0D081D] text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className={`w-full px-3.5 h-10 text-sm rounded-xl border ${
                    isDark
                      ? "border-white/15 bg-[#0D081D] text-white"
                      : "border-slate-200 bg-slate-50 text-slate-900"
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            {/* ปุ่มคลิกเดียวเติมรหัสทดสอบ */}
            <div className="pt-3 border-t border-slate-200/70 dark:border-white/10 space-y-1.5 text-xs">
              <span className="opacity-65 block">คลิกเพื่อใช้รหัสทดสอบ:</span>
              <div className="flex flex-wrap gap-1.5">
                {loginModalRole === "INSTRUCTOR" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("EDU-001");
                        setLoginPassword("123456");
                      }}
                      className="px-2.5 py-1 rounded-lg border border-purple-500/30 font-medium"
                    >
                      EDU-001 (ซอลีฮะห์)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("EDU-002");
                        setLoginPassword("123456");
                      }}
                      className="px-2.5 py-1 rounded-lg border border-purple-500/30 font-medium"
                    >
                      EDU-002 (มะซีดิ)
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
                    className="px-2.5 py-1 rounded-lg border border-purple-500/30 font-medium"
                  >
                    HEAD-01
                  </button>
                )}
                {loginModalRole === "ADMIN" && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStaffId("ADMIN");
                      setLoginPassword("admin999");
                    }}
                    className="px-2.5 py-1 rounded-lg border border-purple-500/30 font-medium"
                  >
                    ADMIN
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: ดูรายละเอียดอาจารย์ */}
      {selectedTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`rounded-3xl max-w-lg w-full p-5 sm:p-6 border shadow-2xl space-y-4 ${
              isDark
                ? "bg-[#181030] border-white/15 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-purple-500">
                  {selectedTeacherModal.id} • {selectedTeacherModal.program}
                </span>
                <h3 className="text-lg font-bold mt-0.5">{selectedTeacherModal.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacherModal(null)}
                className="p-1.5 rounded-full hover:bg-purple-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {selectedTeacherModal.degrees.map((deg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border space-y-0.5 ${
                    isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-500">{deg.level}</span>
                    {deg.year && <span className="opacity-70">พ.ศ. {deg.year}</span>}
                  </div>
                  <p className="text-xs sm:text-sm font-bold">
                    {deg.degree} {deg.major ? `(${deg.major})` : ""}
                  </p>
                  <p className="text-xs opacity-75">{deg.institution}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPublicTeacherFilter(selectedTeacherModal.name);
                  setPublicHubTab("EBOOKS");
                  setSelectedTeacherModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                ดูผลงาน E-Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: เปิดอ่าน E-Book */}
      {selectedWorkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`rounded-3xl max-w-2xl w-full p-5 sm:p-6 border shadow-2xl space-y-4 ${
              isDark
                ? "bg-[#181030] border-white/15 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b pb-3 border-slate-200/70 dark:border-white/10">
              <div>
                <span className="text-xs font-bold text-purple-500">
                  {selectedWorkModal.Category} • พ.ศ. {selectedWorkModal.Academic_Year}
                </span>
                <h3 className="font-bold text-base sm:text-lg">{selectedWorkModal.Title}</h3>
                <p className="text-xs opacity-75">
                  {selectedWorkModal.Instructor_Name} ({selectedWorkModal.Department})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWorkModal(null)}
                className="p-1.5 rounded-full hover:bg-purple-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed">{selectedWorkModal.Description}</p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/70 dark:border-white/10">
              <span className="text-xs opacity-70">ดาวน์โหลด {selectedWorkModal.Downloads} ครั้ง</span>
              <a
                href={selectedWorkModal.File_Or_Link_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setPortfolioWorks((prev) =>
                    prev.map((w) =>
                      w.Work_ID === selectedWorkModal.Work_ID
                        ? { ...w, Downloads: w.Downloads + 1 }
                        : w
                    )
                  );
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
              >
                <Download className="w-4 h-4" />
                <span>เปิดไฟล์ / ดาวน์โหลด</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal: แอดมินดูผลสำรวจ */}
      {adminViewingSurvey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 border shadow-2xl space-y-4 ${
              isDark
                ? "bg-[#181030] border-white/15 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between border-b pb-3 border-slate-200/70 dark:border-white/10">
              <div>
                <h3 className="text-base sm:text-lg font-bold">{adminViewingSurvey.Full_Name}</h3>
                <p className="text-xs opacity-75">
                  {adminViewingSurvey.Staff_ID} • {adminViewingSurvey.Department}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminViewingSurvey(null)}
                className="p-1.5 rounded-full hover:bg-purple-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl border border-purple-500/20">
                <span className="opacity-70 block">วิจัยในชั้นเรียน</span>
                <strong className="text-base">{adminViewingSurvey.research_classroom} เรื่อง</strong>
              </div>
              <div className="p-3 rounded-xl border border-purple-500/20">
                <span className="opacity-70 block">วิจัยเพื่อการศึกษา</span>
                <strong className="text-base">{adminViewingSurvey.research_education} เรื่อง</strong>
              </div>
              <div className="p-3 rounded-xl border border-purple-500/20">
                <span className="opacity-70 block">วิจัยเพื่อการพัฒนา</span>
                <strong className="text-base">{adminViewingSurvey.research_development} เรื่อง</strong>
              </div>
              <div className="p-3 rounded-xl border border-purple-500/20">
                <span className="opacity-70 block">อื่นๆ</span>
                <strong className="text-base">{adminViewingSurvey.research_other} เรื่อง</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/70 dark:border-white/10">
              <button
                type="button"
                onClick={() => setAdminViewingSurvey(null)}
                className="px-4 py-2 rounded-xl border border-purple-500/30 text-xs font-bold"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={() => {
                  const staffId = adminViewingSurvey.Staff_ID;
                  setAdminViewingSurvey(null);
                  setAdminEditingStaffId(staffId);
                  setEditingSection("NONE");
                  setActiveView("INSTRUCTOR");
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                แก้ไขข้อมูลชุดนี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: เปลี่ยนรหัสผ่าน */}
      {showPasswordModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`rounded-3xl max-w-sm w-full p-5 sm:p-6 border shadow-2xl space-y-4 ${
              isDark
                ? "bg-[#181030] border-white/15 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">เปลี่ยนรหัสผ่าน</h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="p-1.5 rounded-full hover:bg-purple-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-3.5 h-10 rounded-xl border ${
                    isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
                  }`}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3.5 h-10 rounded-xl border ${
                    isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
                  }`}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl border border-purple-500/30 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}