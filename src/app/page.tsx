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
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  Settings,
  Users,
  FolderKanban,
  LayoutDashboard,
  Eye,
  GraduationCap,
  Award,
  X,
  Clock,
  Lightbulb,
  Sun,
  Moon,
  Type,
  School,
  HandHelping,
  Send,
  ArrowRight,
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

  // Theme & Accessibility State
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [fontSizeScale, setFontSizeScale] = useState<"normal" | "large" | "xlarge">("normal");
  const isDark = themeMode === "dark";

  // System Settings: เปิด/ปิดการกรอกข้อมูลโดยแอดมิน
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(true);

  // Database State
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [teachersList] = useState<TeacherInfo[]>(INITIAL_TEACHERS);
  const [instructorForms, setInstructorForms] = useState<InstructorPlanRecord[]>(INITIAL_INSTRUCTOR_FORMS);
  const [teacherSurveys, setTeacherSurveys] = useState<TeacherSurveyPlan[]>(INITIAL_TEACHER_SURVEYS);
  const [portfolioWorks, setPortfolioWorks] = useState<PortfolioWork[]>(INITIAL_PORTFOLIO_WORKS);
  const [executiveForms, setExecutiveForms] = useState<ExecutivePlanRecord[]>(INITIAL_EXECUTIVE_FORMS);
  const [, setIsSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Public Hub State
  const [publicHubTab, setPublicHubTab] = useState<"FACULTY" | "EBOOKS">("FACULTY");
  const [publicSearch, setPublicSearch] = useState("");
  const [publicDeptFilter, setPublicDeptFilter] = useState("ALL");
  const [publicTeacherFilter, setPublicTeacherFilter] = useState("ALL");
  const [selectedWorkModal, setSelectedWorkModal] = useState<PortfolioWork | null>(null);
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<TeacherInfo | null>(null);
  const [ebookPage, setEbookPage] = useState(1);

  // Instructor Portal State
  const [instTab, setInstTab] = useState<"SURVEY_VIEW" | "SURVEY_FORM">("SURVEY_VIEW");
  const [surveyFormState, setSurveyFormState] = useState<TeacherSurveyPlan | null>(null);
  const [adminEditingStaffId, setAdminEditingStaffId] = useState<string | null>(null);
  const [adminViewingSurvey, setAdminViewingSurvey] = useState<TeacherSurveyPlan | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSurveyDetails, setShowSurveyDetails] = useState(false);

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
  const [adminMenu, setAdminMenu] = useState<"INSTRUCTORS" | "DASHBOARD" | "PORTFOLIO" | "EXECUTIVES" | "FACULTY" | "SETTINGS">("INSTRUCTORS");
  const [adminYearMode] = useState<"RANGE_2570_2574" | "EVERY_5_YEARS" | "SINGLE_YEAR">("RANGE_2570_2574");
  const [adminSelectedYear] = useState<number>(2570);
  const [adminTeacherSearch, setAdminTeacherSearch] = useState("");
  const [adminTeacherDeptFilter, setAdminTeacherDeptFilter] = useState("ALL");
  const [adminTeacherStatusFilter, setAdminTeacherStatusFilter] = useState<"ALL" | "SUBMITTED" | "PENDING">("ALL");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // LocalStorage Caching & Accessibility Settings
  useEffect(() => {
    try {
      const cachedStaff = localStorage.getItem("edu_staff_v3");
      const cachedInst = localStorage.getItem("edu_inst_v3");
      const cachedWorks = localStorage.getItem("edu_works_v3");
      const cachedExec = localStorage.getItem("edu_exec_v3");
      const cachedSub = localStorage.getItem("edu_submission_open");
      const cachedTheme = localStorage.getItem("edu_theme_v3");
      const cachedScale = localStorage.getItem("edu_scale_v3");
      const cachedSurveys = localStorage.getItem("edu_surveys_v1");

      if (cachedStaff) setStaffList(JSON.parse(cachedStaff));
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

  useEffect(() => {
    try {
      localStorage.setItem("edu_staff_v3", JSON.stringify(staffList));
      localStorage.setItem("edu_inst_v3", JSON.stringify(instructorForms));
      localStorage.setItem("edu_surveys_v1", JSON.stringify(teacherSurveys));
      localStorage.setItem("edu_works_v3", JSON.stringify(portfolioWorks));
      localStorage.setItem("edu_exec_v3", JSON.stringify(executiveForms));
      localStorage.setItem("edu_submission_open", JSON.stringify(isSubmissionOpen));
    } catch (e) {
      console.warn("Failed to persist to localStorage", e);
    }
  }, [staffList, instructorForms, teacherSurveys, portfolioWorks, executiveForms, isSubmissionOpen]);

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
          document.documentElement.style.fontSize = "19px";
        } else if (fontSizeScale === "large") {
          document.documentElement.style.fontSize = "17.5px";
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
    if (fontSizeScale === "xlarge") {
      setFontSizeScale("large");
    } else if (fontSizeScale === "large") {
      setFontSizeScale("normal");
    }
  };

  const handleIncreaseFontSize = () => {
    if (fontSizeScale === "normal") {
      setFontSizeScale("large");
    } else if (fontSizeScale === "large") {
      setFontSizeScale("xlarge");
    }
  };

  const toggleTheme = () => {
    const next = themeMode === "light" ? "dark" : "light";
    setThemeMode(next);
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
    } catch {
      // Fallback to local cache silently
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
    } catch {
      // Queued in local cache
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
    setLoginModalRole(null);
    setLoginStaffId("");
    setLoginPassword("");
    showToast(`เข้าสู่ระบบสำเร็จ: ${user.Full_Name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAdminEditingStaffId(null);
    setSurveyFormState(null);
    setInstTab("SURVEY_VIEW");
    setActiveView("HOME");
    showToast("ออกจากระบบแล้ว");
  };

  const currentTeacherProfile = useMemo(() => {
    if (!currentUser) return null;
    const targetStaffId = adminEditingStaffId || currentUser.Staff_ID;
    return teachersList.find(
      (t) =>
        t.id.toUpperCase() === targetStaffId.toUpperCase() ||
        (!adminEditingStaffId && t.name.trim() === currentUser.Full_Name.trim())
    );
  }, [currentUser, teachersList, adminEditingStaffId]);

  const currentTeacherSurvey = useMemo(() => {
    if (!currentUser) return null;
    const targetStaffId = adminEditingStaffId || currentUser.Staff_ID;
    return (
      teacherSurveys.find(
        (s) =>
          s.Staff_ID.trim().toUpperCase() === targetStaffId.trim().toUpperCase() ||
          (!adminEditingStaffId && s.Full_Name.trim() === currentUser.Full_Name.trim())
      ) || null
    );
  }, [currentUser, teacherSurveys, adminEditingStaffId]);

  // เริ่มกรอกหรือแก้ไขแบบสำรวจ
  const handleStartSurvey = (targetStaffId?: string) => {
    const staffId = targetStaffId || adminEditingStaffId || currentUser?.Staff_ID;
    if (!staffId) return;

    const existing = teacherSurveys.find(
      (s) => s.Staff_ID.trim().toUpperCase() === staffId.trim().toUpperCase()
    );
    if (existing) {
      setSurveyFormState(JSON.parse(JSON.stringify(existing)));
    } else {
      const teacher = teachersList.find(
        (t) => t.id.trim().toUpperCase() === staffId.trim().toUpperCase()
      ) || {
        id: staffId,
        name: currentUser?.Full_Name || staffId,
        program: currentUser?.Department || "",
        degrees: [],
      };
      setSurveyFormState(createDefaultSurvey(teacher, false));
    }
    setInstTab("SURVEY_FORM");
  };

  // บันทึกแบบสำรวจ
  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surveyFormState) return;

    const updatedRecord: TeacherSurveyPlan = {
      ...surveyFormState,
      Is_Submitted: true,
      Updated_At: new Date().toISOString().split("T")[0],
    };

    setTeacherSurveys((prev) => {
      const idx = prev.findIndex(
        (s) => s.Staff_ID.trim().toUpperCase() === updatedRecord.Staff_ID.trim().toUpperCase()
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedRecord;
        return copy;
      }
      return [updatedRecord, ...prev];
    });

    postToGAS({
      action: "upsertTeacherSurvey",
      survey: updatedRecord,
    });

    if (adminEditingStaffId) {
      showToast(`บันทึกข้อมูลของ ${updatedRecord.Full_Name} เรียบร้อยแล้ว`);
      setAdminEditingStaffId(null);
      setSurveyFormState(null);
      setActiveView("ADMIN");
      setAdminMenu("INSTRUCTORS");
    } else {
      showToast("บันทึกแบบสำรวจเรียบร้อยแล้ว");
      setInstTab("SURVEY_VIEW");
      setSurveyFormState(null);
    }
  };

  const toggleResearchFundYear = (fundName: string, year: number) => {
    if (!surveyFormState) return;
    const currentYears = surveyFormState.research_funding_sources[fundName] || [];
    const nextYears = currentYears.includes(year)
      ? currentYears.filter((y) => y !== year)
      : [...currentYears, year].sort();

    setSurveyFormState({
      ...surveyFormState,
      research_funding_sources: {
        ...surveyFormState.research_funding_sources,
        [fundName]: nextYears,
      },
    });
  };

  const toggleTargetCommunityYear = (commName: string, year: number) => {
    if (!surveyFormState) return;
    const currentYears = surveyFormState.target_communities[commName] || [];
    const nextYears = currentYears.includes(year)
      ? currentYears.filter((y) => y !== year)
      : [...currentYears, year].sort();

    setSurveyFormState({
      ...surveyFormState,
      target_communities: {
        ...surveyFormState.target_communities,
        [commName]: nextYears,
      },
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

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 antialiased ${
        isDark
          ? "bg-[#0B061B] text-purple-50 selection:bg-purple-800 selection:text-white"
          : "bg-[#F7F5FC] text-slate-900 selection:bg-purple-200 selection:text-purple-950"
      }`}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-purple-950 text-white px-4 py-3 rounded-2xl shadow-xl border border-purple-700/80 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ====================================================================
          GLOBAL HEADER: Minimal macOS / Neo-Fintech Navigation Bar
         ==================================================================== */}
      {activeView !== "ADMIN" && (
        <header
          className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors ${
            isDark
              ? "bg-[#0B061B]/85 border-purple-900/50 text-white"
              : "bg-white/85 border-purple-200/70 text-slate-900"
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            {/* Left: Brand & Back to Home */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => {
                  setAdminEditingStaffId(null);
                  setInstTab("SURVEY_VIEW");
                  setActiveView("HOME");
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="hidden sm:flex items-center gap-1.5 mr-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                </div>

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${
                    isDark
                      ? "bg-purple-600 text-white"
                      : "bg-purple-700 text-white"
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>

                <span className="font-bold text-base sm:text-lg tracking-tight font-serif">
                  คณะศึกษาศาสตร์
                </span>
              </div>

              {activeView !== "HOME" && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminEditingStaffId(null);
                    setInstTab("SURVEY_VIEW");
                    setActiveView("HOME");
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    isDark
                      ? "bg-purple-950/60 border-purple-800 text-purple-200 hover:bg-purple-900/60"
                      : "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100"
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>หน้าหลัก</span>
                </button>
              )}
            </div>

            {/* Right: Compact Controls (Font Size + Theme + User/Admin) */}
            <div className="flex items-center gap-2">
              {/* Font Size Control (Works on both Mobile & Desktop cleanly) */}
              <div
                className={`flex items-center rounded-xl p-0.5 border text-xs ${
                  isDark
                    ? "bg-[#150C30] border-purple-800/80 text-purple-200"
                    : "bg-purple-50/70 border-purple-200/80 text-purple-900"
                }`}
                title="ปรับขนาดตัวอักษร"
              >
                <button
                  type="button"
                  onClick={handleDecreaseFontSize}
                  disabled={fontSizeScale === "normal"}
                  className="px-2 py-1 rounded-lg hover:bg-purple-500/15 disabled:opacity-30 font-bold"
                >
                  ก-
                </button>
                <button
                  type="button"
                  onClick={handleToggleFontSize}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    fontSizeScale !== "normal"
                      ? "bg-purple-600 text-white"
                      : "hover:bg-purple-500/15"
                  }`}
                >
                  <Type className="w-3.5 h-3.5 inline sm:mr-1" />
                  <span className="hidden sm:inline">
                    {fontSizeScale === "normal" ? "100%" : fontSizeScale === "large" ? "115%" : "125%"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleIncreaseFontSize}
                  disabled={fontSizeScale === "xlarge"}
                  className="px-2 py-1 rounded-lg hover:bg-purple-500/15 disabled:opacity-30 font-bold"
                >
                  ก+
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark
                    ? "bg-[#150C30] border-purple-800/80 text-amber-300 hover:bg-[#201247]"
                    : "bg-purple-50/70 border-purple-200/80 text-purple-800 hover:bg-purple-100"
                }`}
                title={isDark ? "สลับเป็นธีมสว่าง" : "สลับเป็นธีมมืด"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Auth / Profile */}
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveView(currentUser.Role)}
                    className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                      isDark
                        ? "bg-purple-600 hover:bg-purple-500 text-white"
                        : "bg-purple-700 hover:bg-purple-800 text-white"
                    }`}
                  >
                    {currentUser.Full_Name.split(" ")[0]}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`p-2 rounded-xl border transition-colors ${
                      isDark
                        ? "border-purple-800/80 text-purple-300 hover:bg-red-950/60 hover:text-red-400"
                        : "border-purple-200 text-slate-600 hover:bg-red-50 hover:text-red-600"
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
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-colors ${
                    isDark
                      ? "border-purple-800/80 bg-[#150C30] hover:bg-[#201247] text-purple-200"
                      : "border-purple-200/80 bg-white hover:bg-purple-50 text-purple-900"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span>แอดมิน</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ====================================================================
          VIEW 1: หน้าหลัก (HOME) - Ultra-Clean Bento Layout
         ==================================================================== */}
      {activeView === "HOME" && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* 1. ปุ่มหลัก 2 ปุ่มเด่นๆ (อาจารย์ผู้สอน & ผู้บริหาร) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* ปุ่ม 1: เข้าสู่ระบบอาจารย์ผู้สอน */}
            <div
              onClick={() => {
                if (currentUser?.Role === "INSTRUCTOR") setActiveView("INSTRUCTOR");
                else setLoginModalRole("INSTRUCTOR");
              }}
              className={`group relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[190px] ${
                isDark
                  ? "bg-gradient-to-br from-[#4C1D95] via-[#3B0764] to-[#190B33] border-purple-500/40 hover:border-purple-400 shadow-lg shadow-purple-950/60"
                  : "bg-gradient-to-br from-[#6D28D9] via-[#5B21B6] to-[#4C1D95] border-purple-400/40 hover:border-purple-300 shadow-lg shadow-purple-600/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-xs">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isSubmissionOpen
                      ? "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                      : "bg-amber-500/20 text-amber-200 border-amber-400/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSubmissionOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {isSubmissionOpen ? "เปิดรับแบบสำรวจ" : "ปิดรับชั่วคราว"}
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-balance">
                    เข้าสู่ระบบอาจารย์ผู้สอน
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-100/85 mt-1">
                    แบบสำรวจข้อมูลเบื้องต้นเพื่อจัดทำแผนประจำปีการศึกษา 2570–2574
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white text-purple-950 flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* ปุ่ม 2: เข้าสู่ระบบผู้บริหาร */}
            <div
              onClick={() => {
                if (currentUser?.Role === "EXECUTIVE") setActiveView("EXECUTIVE");
                else setLoginModalRole("EXECUTIVE");
              }}
              className={`group relative overflow-hidden rounded-3xl p-6 sm:p-7 text-white border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[190px] ${
                isDark
                  ? "bg-gradient-to-br from-[#6B21A8] via-[#4A044E] to-[#1A0926] border-fuchsia-500/40 hover:border-fuchsia-400 shadow-lg shadow-fuchsia-950/60"
                  : "bg-gradient-to-br from-[#7E22CE] via-[#6B21A8] to-[#581C87] border-fuchsia-400/40 hover:border-fuchsia-300 shadow-lg shadow-purple-600/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-xs">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-purple-100">
                  12 สาขาวิชา
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-balance">
                    เข้าสู่ระบบผู้บริหาร
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-100/85 mt-1">
                    รายงานและติดตามข้อมูลเฉพาะสาขาวิชา
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white text-purple-950 flex items-center justify-center shrink-0 shadow-md group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </section>

          {/* 2. แถบสรุปข้อมูลจากฐานข้อมูล (Compact Bento Strip - ไม่เด่นเกินไป เหมาะกับมือถือ) */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`rounded-2xl p-4 border ${
                isDark
                  ? "bg-[#140B2E] border-purple-900/60"
                  : "bg-white border-purple-200/60 shadow-2xs"
              }`}
            >
              <span className={`text-xs ${isDark ? "text-purple-300/75" : "text-slate-500"}`}>
                คณาจารย์ทั้งหมด
              </span>
              <p className="text-xl sm:text-2xl font-black font-serif mt-0.5">
                {teachersList.length} <span className="text-xs font-normal opacity-70">ท่าน</span>
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 border ${
                isDark
                  ? "bg-[#140B2E] border-purple-900/60"
                  : "bg-white border-purple-200/60 shadow-2xs"
              }`}
            >
              <span className={`text-xs ${isDark ? "text-purple-300/75" : "text-slate-500"}`}>
                หลักสูตร / สาขาวิชา
              </span>
              <p className="text-xl sm:text-2xl font-black font-serif mt-0.5">
                {EDUCATION_PROGRAMS.length} <span className="text-xs font-normal opacity-70">สาขา</span>
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 border ${
                isDark
                  ? "bg-[#140B2E] border-purple-900/60"
                  : "bg-white border-purple-200/60 shadow-2xs"
              }`}
            >
              <span className={`text-xs ${isDark ? "text-purple-300/75" : "text-slate-500"}`}>
                ส่งแบบสำรวจแล้ว
              </span>
              <p className="text-xl sm:text-2xl font-black font-serif mt-0.5 text-emerald-500">
                {teacherSurveys.filter((s) => s.Is_Submitted).length}{" "}
                <span className="text-xs font-normal opacity-70">ท่าน</span>
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 border ${
                isDark
                  ? "bg-[#140B2E] border-purple-900/60"
                  : "bg-white border-purple-200/60 shadow-2xs"
              }`}
            >
              <span className={`text-xs ${isDark ? "text-purple-300/75" : "text-slate-500"}`}>
                คลัง E-Book
              </span>
              <p className="text-xl sm:text-2xl font-black font-serif mt-0.5">
                {portfolioWorks.filter((w) => w.Is_Public).length}{" "}
                <span className="text-xs font-normal opacity-70">เล่ม</span>
              </p>
            </div>
          </section>

          {/* 3. ระบบค้นหาทำเนียบอาจารย์ & คลัง E-Book (ค้นหาง่าย เลือกสาขา หรือเลือกรายชื่ออาจารย์ได้ทันที) */}
          <section
            className={`rounded-3xl p-5 sm:p-6 border space-y-5 ${
              isDark
                ? "bg-[#140B2E] border-purple-900/60"
                : "bg-white border-purple-200/70 shadow-xs"
            }`}
          >
            {/* Header & Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-bold font-serif">
                สืบค้นข้อมูลคณาจารย์และคลัง E-Book
              </h3>

              <div
                className={`inline-flex p-1 rounded-xl border self-start sm:self-auto ${
                  isDark ? "bg-[#0D0620] border-purple-900" : "bg-purple-50 border-purple-200/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPublicHubTab("FACULTY")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    publicHubTab === "FACULTY"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : isDark
                      ? "text-purple-300 hover:text-white"
                      : "text-purple-900 hover:text-purple-950"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>ทำเนียบอาจารย์ ({publicTeachersFiltered.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPublicHubTab("EBOOKS")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    publicHubTab === "EBOOKS"
                      ? "bg-purple-600 text-white shadow-2xs"
                      : isDark
                      ? "text-purple-300 hover:text-white"
                      : "text-purple-900 hover:text-purple-950"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>คลัง E-Book ({publicWorksFiltered.length})</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Controls (3 ช่อง: พิมพ์ค้นหา / เลือกสาขาวิชา / เลือกรายชื่ออาจารย์) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* 1. พิมพ์ค้นหา */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={publicSearch}
                  onChange={(e) => setPublicSearch(e.target.value)}
                  placeholder="ค้นหาชื่ออาจารย์, สาขา, วุฒิการศึกษา..."
                  className={`w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark
                      ? "border-purple-800 bg-[#0D0620] text-white placeholder-purple-400/50"
                      : "border-purple-200 bg-purple-50/30 text-slate-900 placeholder-slate-400"
                  }`}
                />
                {publicSearch && (
                  <button
                    type="button"
                    onClick={() => setPublicSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. เลือกสาขาวิชา */}
              <div className="md:col-span-4">
                <select
                  value={publicDeptFilter}
                  onChange={(e) => {
                    setPublicDeptFilter(e.target.value);
                    setPublicTeacherFilter("ALL");
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark
                      ? "border-purple-800 bg-[#0D0620] text-white"
                      : "border-purple-200 bg-purple-50/30 text-slate-900"
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

              {/* 3. เลือกรายชื่ออาจารย์ */}
              <div className="md:col-span-4">
                <select
                  value={publicTeacherFilter}
                  onChange={(e) => setPublicTeacherFilter(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark
                      ? "border-purple-800 bg-[#0D0620] text-white"
                      : "border-purple-200 bg-purple-50/30 text-slate-900"
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

            {/* ปุ่มล้างตัวกรอง (แสดงเฉพาะเมื่อมีการกรอง) */}
            {(publicDeptFilter !== "ALL" || publicTeacherFilter !== "ALL" || publicSearch) && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className={isDark ? "text-purple-300" : "text-purple-700"}>
                  ผลลัพธ์ที่พบ:{" "}
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
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border ${
                    isDark
                      ? "bg-purple-950 border-purple-800 text-purple-200 hover:bg-purple-900"
                      : "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100"
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>ล้างตัวกรอง</span>
                </button>
              </div>
            )}

            {/* TAB 1: ทำเนียบอาจารย์ (แสดงข้อมูลจากฐานข้อมูลจริง) */}
            {publicHubTab === "FACULTY" && (
              <div>
                {publicTeachersFiltered.length === 0 ? (
                  <div className="text-center py-12 text-xs opacity-60">
                    ไม่พบรายชื่ออาจารย์ที่ค้นหา
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicTeachersFiltered.map((teacher) => (
                      <div
                        key={teacher.id}
                        onClick={() => setSelectedTeacherModal(teacher)}
                        className={`group rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                          isDark
                            ? "border-purple-900/70 bg-[#1A0E3A] hover:border-purple-600"
                            : "border-purple-200/70 bg-white hover:border-purple-400 shadow-2xs"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg truncate ${
                                isDark
                                  ? "bg-purple-900/60 text-purple-200"
                                  : "bg-purple-100 text-purple-900"
                              }`}
                            >
                              {teacher.program}
                            </span>
                            <span
                              className={`text-[11px] font-mono font-bold shrink-0 ${
                                isDark ? "text-purple-400" : "text-slate-400"
                              }`}
                            >
                              {teacher.id}
                            </span>
                          </div>

                          <h4 className="font-bold text-base font-serif group-hover:text-purple-500 transition-colors">
                            {teacher.name}
                          </h4>

                          <div
                            className={`mt-3 pt-2.5 border-t space-y-1 ${
                              isDark ? "border-purple-900/50" : "border-purple-100"
                            }`}
                          >
                            {teacher.degrees.map((d, idx) => (
                              <div
                                key={idx}
                                className={`text-xs flex items-start gap-1.5 ${
                                  isDark ? "text-purple-200/80" : "text-slate-600"
                                }`}
                              >
                                <span className="font-bold shrink-0">• {d.level}:</span>
                                <span className="truncate">
                                  {d.degree} {d.major ? `(${d.major})` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: คลัง E-Book (แสดงข้อมูลจากฐานข้อมูลจริง) */}
            {publicHubTab === "EBOOKS" && (
              <div>
                {publicWorksFiltered.length === 0 ? (
                  <div className="text-center py-12 text-xs opacity-60">
                    ไม่พบผลงาน E-Book ที่ค้นหา
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {publicWorksFiltered.map((work) => (
                      <div
                        key={work.Work_ID}
                        onClick={() => {
                          setSelectedWorkModal(work);
                          setEbookPage(1);
                        }}
                        className={`group rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between ${
                          isDark
                            ? "border-purple-900/70 bg-[#1A0E3A] hover:border-purple-600"
                            : "border-purple-200/70 bg-white hover:border-purple-400 shadow-2xs"
                        }`}
                      >
                        <div>
                          <div className="h-36 rounded-xl p-4 flex flex-col justify-between mb-3 bg-gradient-to-br from-[#3B0764] via-[#4C1D95] to-[#1E1B4B] text-white">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="px-2 py-0.5 rounded bg-white/15 font-semibold">
                                {work.Category}
                              </span>
                              <span className="font-mono opacity-80">พ.ศ. {work.Academic_Year}</span>
                            </div>
                            <h4 className="font-bold text-sm sm:text-base line-clamp-2 font-serif">
                              {work.Title}
                            </h4>
                          </div>

                          <p className="text-xs font-bold">{work.Instructor_Name}</p>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              isDark ? "text-purple-300/70" : "text-slate-500"
                            }`}
                          >
                            {work.Department}
                          </p>
                        </div>

                        <div
                          className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs font-bold ${
                            isDark
                              ? "border-purple-900/50 text-purple-300"
                              : "border-purple-100 text-purple-700"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> เปิดอ่าน
                          </span>
                          <span className="font-normal opacity-70">{work.Downloads} ครั้ง</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      )}

      {/* ====================================================================
          VIEW 2: ระบบอาจารย์ผู้สอน (INSTRUCTOR PORTAL)
          Clean Neo-Fintech Apple-style Modular Bento Dashboard
         ==================================================================== */}
      {activeView === "INSTRUCTOR" && currentUser && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* แบนเนอร์เมื่อแอดมินเข้ามาแก้ไขข้อมูลให้อาจารย์ */}
          {adminEditingStaffId && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/60 flex items-center justify-between gap-4">
              <div className="text-xs sm:text-sm font-bold">
                โหมดแอดมิน: กำลังแก้ไขข้อมูลของ{" "}
                <span className="underline">
                  {currentTeacherProfile?.name || currentUser.Full_Name} ({adminEditingStaffId})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdminEditingStaffId(null);
                  setSurveyFormState(null);
                  setActiveView("ADMIN");
                  setAdminMenu("INSTRUCTORS");
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shrink-0"
              >
                กลับหน้าแอดมิน
              </button>
            </div>
          )}

          {/* ====================================================================
              หน้าหลักอาจารย์: มีเฉพาะ 1) ข้อมูลอาจารย์จากฐานข้อมูล และ 2) ปุ่มกรอกแบบฟอร์มออนไลน์ (Bento Grid)
             ==================================================================== */}
          {instTab !== "SURVEY_FORM" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* -------------------------------------------------------------
                    BENTO MODULE 1: ข้อมูลอาจารย์ (ชื่อ-สกุล, สังกัด, คุณวุฒิจากฐานข้อมูล)
                   ------------------------------------------------------------- */}
                <div
                  className={`lg:col-span-5 rounded-3xl p-6 border flex flex-col justify-between ${
                    isDark
                      ? "bg-[#140B2E] border-purple-800/60 text-white"
                      : "bg-white border-purple-200/80 text-slate-900 shadow-xs"
                  }`}
                >
                  <div className="space-y-5">
                    {/* ข้อมูลชื่อ-สกุล & สังกัด */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 text-white flex items-center justify-center font-serif font-black text-xl shrink-0 shadow-md">
                          {(currentTeacherProfile?.name || currentUser.Full_Name).charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-md mb-1 ${
                              isDark
                                ? "bg-purple-900/70 text-purple-200"
                                : "bg-purple-100 text-purple-900"
                            }`}
                          >
                            {adminEditingStaffId || currentUser.Staff_ID}
                          </span>
                          <h2 className="text-lg sm:text-xl font-black font-serif truncate">
                            {currentTeacherProfile?.name || currentUser.Full_Name}
                          </h2>
                          <p
                            className={`text-xs font-medium truncate ${
                              isDark ? "text-purple-300" : "text-slate-600"
                            }`}
                          >
                            {currentTeacherProfile?.program || currentUser.Department}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className={`p-2 rounded-xl border transition-colors shrink-0 ${
                          isDark
                            ? "bg-[#1E1145] border-purple-800 text-purple-200 hover:bg-purple-900"
                            : "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100"
                        }`}
                        title="เปลี่ยนรหัสผ่าน"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    </div>

                    {/* คุณวุฒิการศึกษา (ดึงจากฐานข้อมูลจริง) */}
                    <div className="space-y-2 pt-2 border-t border-purple-500/15">
                      <span
                        className={`text-xs font-bold block mb-2 ${
                          isDark ? "text-purple-300" : "text-slate-500"
                        }`}
                      >
                        คุณวุฒิการศึกษา
                      </span>

                      {currentTeacherProfile &&
                      currentTeacherProfile.degrees &&
                      currentTeacherProfile.degrees.length > 0 ? (
                        <div className="space-y-2">
                          {currentTeacherProfile.degrees.map((deg, i) => (
                            <div
                              key={i}
                              className={`rounded-2xl p-3 border ${
                                isDark
                                  ? "bg-[#1C103F] border-purple-800/60"
                                  : "bg-purple-50/50 border-purple-200/60"
                              }`}
                            >
                              <div className="flex items-center justify-between text-xs mb-0.5">
                                <span
                                  className={`font-bold ${
                                    isDark ? "text-amber-300" : "text-purple-800"
                                  }`}
                                >
                                  {deg.level}
                                </span>
                                {deg.year && (
                                  <span
                                    className={`text-[11px] font-mono ${
                                      isDark ? "text-purple-400" : "text-slate-500"
                                    }`}
                                  >
                                    พ.ศ. {deg.year}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm font-bold font-serif">
                                {deg.degree} {deg.major ? `(${deg.major})` : ""}
                              </p>
                              <p
                                className={`text-[11px] mt-0.5 truncate ${
                                  isDark ? "text-purple-300/75" : "text-slate-500"
                                }`}
                              >
                                {deg.institution}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            isDark
                              ? "bg-[#1C103F] border-purple-800/60 text-purple-300"
                              : "bg-purple-50 border-purple-100 text-slate-600"
                          }`}
                        >
                          {currentUser.Department}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    BENTO MODULE 2: ปุ่มและการ์ดแบบสำรวจแผน 2570-2574 (Neo-Fintech Modular Hub)
                   ------------------------------------------------------------- */}
                <div
                  className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 border flex flex-col justify-between relative overflow-hidden ${
                    isDark
                      ? "bg-gradient-to-br from-[#230E52] via-[#160836] to-[#0D0420] border-purple-600/40 text-white shadow-xl"
                      : "bg-gradient-to-br from-[#4C1D95] via-[#3B0764] to-[#2E1065] border-purple-400/40 text-white shadow-xl"
                  }`}
                >
                  <div className="space-y-5 relative z-10">
                    {/* แถบสถานะ */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          isSubmissionOpen
                            ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-200"
                            : "bg-amber-500/20 border-amber-400/40 text-amber-200"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSubmissionOpen ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                          }`}
                        />
                        {isSubmissionOpen ? "เปิดรับข้อมูล" : "ปิดรับชั่วคราว"}
                      </span>

                      {currentTeacherSurvey?.Is_Submitted && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-amber-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>บันทึกข้อมูลแล้ว ({currentTeacherSurvey.Updated_At})</span>
                        </span>
                      )}
                    </div>

                    {/* ชื่อแบบสำรวจ */}
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black font-serif leading-snug text-balance">
                        แบบสำรวจข้อมูลเบื้องต้นเพื่อจัดทำแผนประจำปีการศึกษา 2570-2574
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-200/90 mt-1">
                        (อาจารย์ คณะศึกษาศาสตร์)
                      </p>
                    </div>

                    {/* สรุปข้อมูล 3 หมวดจากฐานข้อมูล (ของอาจารย์ท่านนี้) */}
                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div className="rounded-2xl p-3.5 bg-white/10 border border-white/15 backdrop-blur-xs">
                        <span className="text-[11px] text-purple-200 block">งานวิจัย</span>
                        <p className="text-lg sm:text-xl font-black font-serif mt-0.5 text-white">
                          {currentTeacherSurvey
                            ? Number(currentTeacherSurvey.research_classroom || 0) +
                              Number(currentTeacherSurvey.research_education || 0) +
                              Number(currentTeacherSurvey.research_development || 0) +
                              Number(currentTeacherSurvey.research_other || 0)
                            : 0}{" "}
                          <span className="text-[11px] font-normal text-purple-200">เรื่อง</span>
                        </p>
                      </div>

                      <div className="rounded-2xl p-3.5 bg-white/10 border border-white/15 backdrop-blur-xs">
                        <span className="text-[11px] text-purple-200 block">การเรียนการสอน</span>
                        <p className="text-sm sm:text-base font-black font-serif mt-1 text-white truncate">
                          {currentTeacherSurvey?.teaching_load?.["2/2569"]?.replace(" ชั่วโมง/สัปดาห์", " ชม.") || "-"}
                        </p>
                      </div>

                      <div className="rounded-2xl p-3.5 bg-white/10 border border-white/15 backdrop-blur-xs">
                        <span className="text-[11px] text-purple-200 block">บริการวิชาการ</span>
                        <p className="text-lg sm:text-xl font-black font-serif mt-0.5 text-white">
                          {currentTeacherSurvey
                            ? Object.values(currentTeacherSurvey.academic_services_count || {}).reduce(
                                (acc, c) => acc + Number(c || 0),
                                0
                              )
                            : 0}{" "}
                          <span className="text-[11px] font-normal text-purple-200">กิจกรรม</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ปุ่มกดเข้าหน้ากรอกแบบฟอร์มออนไลน์ */}
                  <div className="pt-6 mt-6 border-t border-white/15 relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {isSubmissionOpen ? (
                      <button
                        type="button"
                        onClick={() => handleStartSurvey()}
                        className="flex-1 group rounded-2xl px-6 py-4 bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#FDE047] hover:from-[#FBBF24] hover:to-[#FEF08A] text-purple-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all flex items-center justify-between gap-3 active:scale-[0.99]"
                      >
                        <span className="flex items-center gap-2.5">
                          <FileText className="w-5 h-5 text-purple-950 shrink-0" />
                          <span>
                            {currentTeacherSurvey?.Is_Submitted
                              ? "แก้ไขข้อมูลแบบสำรวจออนไลน์"
                              : "กรอกแบบสำรวจออนไลน์"}
                          </span>
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-purple-950 text-amber-300 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </button>
                    ) : (
                      <div className="flex-1 rounded-2xl px-5 py-4 bg-white/10 border border-white/20 text-purple-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4 text-amber-300" />
                        <span>ขณะนี้แอดมินปิดรับการกรอกแบบสำรวจ</span>
                      </div>
                    )}

                    {currentTeacherSurvey?.Is_Submitted && (
                      <button
                        type="button"
                        onClick={() => setShowSurveyDetails(!showSurveyDetails)}
                        className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{showSurveyDetails ? "ซ่อนข้อมูลที่ส่ง" : "ดูข้อมูลที่ส่งแล้ว"}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ====================================================================
                  แสดงข้อมูลคำตอบที่บันทึกไว้ (เมื่อกด "ดูข้อมูลที่ส่งแล้ว")
                 ==================================================================== */}
              {showSurveyDetails && currentTeacherSurvey?.Is_Submitted && (
                <div
                  className={`rounded-3xl p-6 sm:p-7 border space-y-6 ${
                    isDark
                      ? "bg-[#140B2E] border-purple-800/70 text-white"
                      : "bg-white border-purple-200/80 text-slate-900 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-4 border-purple-500/20">
                    <h4 className="font-bold text-base sm:text-lg font-serif">
                      ข้อมูลแบบสำรวจที่บันทึกไว้ ({currentTeacherSurvey.Full_Name})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowSurveyDetails(false)}
                      className="p-1.5 rounded-lg hover:bg-purple-500/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* หมวด 1: งานวิจัย */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-sm text-purple-500">1. ข้อมูลด้านงานวิจัย</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1C103F] border-purple-800" : "bg-purple-50/50 border-purple-100"}`}>
                        <span className="opacity-70 block">วิจัยในชั้นเรียน</span>
                        <strong className="text-base">{currentTeacherSurvey.research_classroom} เรื่อง</strong>
                      </div>
                      <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1C103F] border-purple-800" : "bg-purple-50/50 border-purple-100"}`}>
                        <span className="opacity-70 block">วิจัยเพื่อการศึกษา</span>
                        <strong className="text-base">{currentTeacherSurvey.research_education} เรื่อง</strong>
                      </div>
                      <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1C103F] border-purple-800" : "bg-purple-50/50 border-purple-100"}`}>
                        <span className="opacity-70 block">วิจัยเพื่อการพัฒนา</span>
                        <strong className="text-base">{currentTeacherSurvey.research_development} เรื่อง</strong>
                      </div>
                      <div className={`p-3 rounded-xl border ${isDark ? "bg-[#1C103F] border-purple-800" : "bg-purple-50/50 border-purple-100"}`}>
                        <span className="opacity-70 block">อื่นๆ</span>
                        <strong className="text-base">{currentTeacherSurvey.research_other} เรื่อง</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs pt-1">
                      {SURVEY_YEARS.map((y) => (
                        <div key={y} className={`p-2.5 rounded-xl border ${isDark ? "bg-[#1C103F] border-purple-800" : "bg-purple-50/50 border-purple-100"}`}>
                          <span className="opacity-70 block">งบปี {y}</span>
                          <strong className="text-xs">{currentTeacherSurvey.research_budgets?.[String(y)] || "-"} บาท</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* หมวด 2: การเรียนการสอน */}
                  <div className="space-y-3 pt-3 border-t border-purple-500/15">
                    <h5 className="font-bold text-sm text-purple-500">2. ข้อมูลด้านการเรียนการสอน</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {TEACHING_LOAD_SEMESTERS.map((sem) => (
                        <div key={sem} className={`p-3 rounded-xl border ${isDark ? "bg-[#1C103F] border-purple-800" : "bg-purple-50/50 border-purple-100"}`}>
                          <span className="opacity-70 block">โหลดสอน {sem}</span>
                          <strong>{currentTeacherSurvey.teaching_load?.[sem] || "-"}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                      {FIELDWORK_SEMESTERS.map((sem) => {
                        const hasField = currentTeacherSurvey.fieldwork_presence?.[sem] === "มี";
                        return (
                          <div key={sem} className={`p-2.5 rounded-xl border ${isDark ? "bg-[#1C103F] border-purple-800" : "bg-purple-50/50 border-purple-100"}`}>
                            <span className="opacity-70 block">ลงพื้นที่ {sem}</span>
                            <strong className={hasField ? "text-emerald-500" : "opacity-60"}>
                              {hasField ? currentTeacherSurvey.fieldwork_agencies?.[sem] || "มี" : "ไม่มี"}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* หมวด 3: บริการวิชาการ */}
                  <div className="space-y-3 pt-3 border-t border-purple-500/15">
                    <h5 className="font-bold text-sm text-purple-500">3. ข้อมูลด้านบริการวิชาการ</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs">
                      {SURVEY_YEARS.map((y) => (
                        <div key={y} className={`p-2.5 rounded-xl border ${isDark ? "bg-[#1C103F] border-purple-800" : "bg-purple-50/50 border-purple-100"}`}>
                          <span className="opacity-70 block">ปี พ.ศ. {y}</span>
                          <strong>{currentTeacherSurvey.academic_services_count?.[String(y)] || 0} กิจกรรม</strong>
                        </div>
                      ))}
                      <div className={`p-2.5 rounded-xl border ${isDark ? "bg-[#1C103F] border-purple-800" : "bg-purple-50/50 border-purple-100"}`}>
                        <span className="opacity-70 block">เกณฑ์คัดเลือก</span>
                        <strong className="text-purple-500">{currentTeacherSurvey.selection_criteria_percentage}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================================================
              หน้ากรอกแบบฟอร์มออนไลน์ (SURVEY_FORM) - Clean, Orderly, Easy to Use
             ==================================================================== */}
          {instTab === "SURVEY_FORM" && surveyFormState && (
            <form onSubmit={handleSaveSurvey} className="space-y-6">
              {/* Top Form Action Bar */}
              <div
                className={`p-5 sm:p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark
                    ? "bg-[#140B2E] border-purple-800/70 text-white"
                    : "bg-white border-purple-200/80 text-slate-900 shadow-xs"
                }`}
              >
                <div>
                  <h3 className="text-lg sm:text-xl font-black font-serif">
                    แบบสำรวจข้อมูลเบื้องต้นเพื่อจัดทำแผนประจำปีการศึกษา 2570-2574 (อาจารย์ คณะศึกษาศาสตร์)
                  </h3>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (adminEditingStaffId) {
                        setAdminEditingStaffId(null);
                        setSurveyFormState(null);
                        setActiveView("ADMIN");
                        setAdminMenu("INSTRUCTORS");
                      } else {
                        setInstTab("SURVEY_VIEW");
                      }
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                      isDark
                        ? "border-purple-800 text-purple-200 hover:bg-purple-900/50"
                        : "border-purple-200 text-slate-700 hover:bg-purple-50"
                    }`}
                  >
                    ย้อนกลับ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
                  >
                    บันทึกแบบสำรวจ
                  </button>
                </div>
              </div>

              {/* ข้อมูลผู้สอนจากฐานข้อมูล (ไม่ต้องกรอก เพราะมีแล้ว) */}
              <div
                className={`p-5 rounded-3xl border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs ${
                  isDark
                    ? "bg-[#140B2E] border-purple-800/70 text-white"
                    : "bg-white border-purple-200/80 text-slate-900 shadow-xs"
                }`}
              >
                <div>
                  <span className={`font-bold block mb-1 ${isDark ? "text-purple-400" : "text-purple-700"}`}>
                    ชื่อ-สกุล
                  </span>
                  <p className="font-bold text-sm font-serif">{surveyFormState.Full_Name}</p>
                </div>
                <div>
                  <span className={`font-bold block mb-1 ${isDark ? "text-purple-400" : "text-purple-700"}`}>
                    สังกัดหน่วยงาน
                  </span>
                  <p className="font-bold text-sm font-serif">{surveyFormState.Department}</p>
                </div>
                <div>
                  <span className={`font-bold block mb-1 ${isDark ? "text-purple-400" : "text-purple-700"}`}>
                    ระดับการศึกษา
                  </span>
                  <p className="font-semibold text-xs leading-relaxed">{surveyFormState.Degree_Level}</p>
                </div>
              </div>

              {/* ====================================================================
                  หมวดที่ 1: ข้อมูลด้านงานวิจัย
                 ==================================================================== */}
              <div
                className={`p-5 sm:p-7 rounded-3xl border space-y-6 ${
                  isDark
                    ? "bg-[#140B2E] border-purple-800/70 text-white"
                    : "bg-white border-purple-200/80 text-slate-900 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2.5 border-b pb-3 border-purple-500/20">
                  <Lightbulb className="w-5 h-5 text-purple-500" />
                  <h4 className="font-bold text-base sm:text-lg font-serif">
                    ข้อมูลด้านงานวิจัย
                  </h4>
                </div>

                {/* 1. จำนวนงานวิจัยที่ท่านคาดว่าจะทำในปีการศึกษา 2570-2574 */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold">
                    1. จำนวนงานวิจัยที่ท่านคาดว่าจะทำในปีการศึกษา 2570-2574
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { key: "research_classroom", label: "โครงการวิจัยในชั้นเรียน" },
                      { key: "research_education", label: "โครงการวิจัยเพื่อการศึกษา" },
                      { key: "research_development", label: "โครงการวิจัยเพื่อการพัฒนา" },
                      { key: "research_other", label: "อื่นๆ" },
                    ].map((item) => {
                      const val = Number(surveyFormState[item.key as keyof TeacherSurveyPlan] || 0);
                      return (
                        <div
                          key={item.key}
                          className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                            isDark
                              ? "bg-[#1C103F] border-purple-800/70"
                              : "bg-purple-50/40 border-purple-200/60"
                          }`}
                        >
                          <span className="font-bold text-xs sm:text-sm">{item.label}</span>

                          <div className="flex items-center justify-between gap-2">
                            {/* ปุ่มกดเลือกด่วน 1-5 */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() =>
                                    setSurveyFormState({
                                      ...surveyFormState,
                                      [item.key]: num,
                                    })
                                  }
                                  className={`w-8 h-8 rounded-lg font-bold text-xs border transition-all ${
                                    val === num
                                      ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                                      : isDark
                                      ? "bg-[#140B2E] border-purple-800 text-purple-200 hover:bg-purple-900/50"
                                      : "bg-white border-purple-200 text-slate-700 hover:bg-purple-100"
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>

                            {/* ช่องกรอกกรณีมากกว่า 5 หรือระบุเอง */}
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={val}
                                onChange={(e) =>
                                  setSurveyFormState({
                                    ...surveyFormState,
                                    [item.key]: Math.max(0, Number(e.target.value)),
                                  })
                                }
                                className={`w-16 h-8 px-2 text-center font-bold rounded-lg border text-xs ${
                                  isDark
                                    ? "bg-[#140B2E] border-purple-700 text-white"
                                    : "bg-white border-purple-300 text-slate-900"
                                }`}
                              />
                              <span className="opacity-70">เรื่อง</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {surveyFormState.research_other > 0 && (
                    <input
                      type="text"
                      placeholder="ระบุประเภทงานวิจัยอื่นๆ..."
                      value={surveyFormState.research_other_specify || ""}
                      onChange={(e) =>
                        setSurveyFormState({
                          ...surveyFormState,
                          research_other_specify: e.target.value,
                        })
                      }
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                        isDark
                          ? "bg-[#1C103F] border-purple-800 text-white"
                          : "bg-white border-purple-200 text-slate-900"
                      }`}
                    />
                  )}
                </div>

                {/* 2. แหล่งทุนที่ท่านคาดว่าจะเสนอทุนโครงการวิจัยระหว่างปีการศึกษา 2570-2574 */}
                <div className="space-y-3 pt-2 border-t border-purple-500/15">
                  <label className="block text-sm font-bold">
                    2. แหล่งทุนที่ท่านคาดว่าจะเสนอทุนโครงการวิจัยระหว่างปีการศึกษา 2570-2574
                  </label>

                  <div
                    className={`rounded-2xl border divide-y overflow-hidden ${
                      isDark
                        ? "bg-[#1C103F] border-purple-800/70 divide-purple-900/60"
                        : "bg-purple-50/30 border-purple-200/70 divide-purple-100"
                    }`}
                  >
                    {RESEARCH_FUND_OPTIONS.map((fund) => {
                      const activeYears = surveyFormState.research_funding_sources[fund] || [];
                      return (
                        <div
                          key={fund}
                          className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <span className="font-semibold leading-snug sm:pr-4">{fund}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {SURVEY_YEARS.map((y) => {
                              const isChecked = activeYears.includes(y);
                              return (
                                <button
                                  key={y}
                                  type="button"
                                  onClick={() => toggleResearchFundYear(fund, y)}
                                  className={`px-2.5 py-1 rounded-lg font-bold text-xs border transition-all ${
                                    isChecked
                                      ? "bg-purple-600 text-white border-purple-500 shadow-2xs"
                                      : isDark
                                      ? "bg-[#140B2E] border-purple-800 text-purple-300 hover:bg-purple-900/50"
                                      : "bg-white border-purple-200 text-slate-600 hover:bg-purple-100"
                                  }`}
                                >
                                  {y}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(surveyFormState.research_funding_sources["อื่น ๆ"]?.length || 0) > 0 && (
                    <input
                      type="text"
                      placeholder="ระบุแหล่งทุนอื่นๆ..."
                      value={surveyFormState.research_funding_other_specify || ""}
                      onChange={(e) =>
                        setSurveyFormState({
                          ...surveyFormState,
                          research_funding_other_specify: e.target.value,
                        })
                      }
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border ${
                        isDark
                          ? "bg-[#1C103F] border-purple-800 text-white"
                          : "bg-white border-purple-200 text-slate-900"
                      }`}
                    />
                  )}
                </div>

                {/* 3. งบประมาณที่ท่านคาดว่าจะได้จากโครงการวิจัยระหว่างปีการศึกษา 2570-2574 */}
                <div className="space-y-3 pt-2 border-t border-purple-500/15">
                  <label className="block text-sm font-bold">
                    3. งบประมาณที่ท่านคาดว่าจะได้จากโครงการวิจัยระหว่างปีการศึกษา 2570-2574
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                    {SURVEY_YEARS.map((y) => {
                      const currentRange =
                        surveyFormState.research_budgets?.[String(y)] || RESEARCH_BUDGET_RANGES[1];
                      return (
                        <div
                          key={y}
                          className={`p-3 rounded-2xl border space-y-1.5 ${
                            isDark
                              ? "bg-[#1C103F] border-purple-800/70"
                              : "bg-purple-50/40 border-purple-200/60"
                          }`}
                        >
                          <span className="font-bold block text-purple-500">พ.ศ. {y}</span>
                          <select
                            value={currentRange}
                            onChange={(e) =>
                              setSurveyFormState({
                                ...surveyFormState,
                                research_budgets: {
                                  ...surveyFormState.research_budgets,
                                  [String(y)]: e.target.value,
                                },
                              })
                            }
                            className={`w-full px-2.5 py-2 rounded-xl text-xs font-bold border ${
                              isDark
                                ? "bg-[#140B2E] border-purple-700 text-white"
                                : "bg-white border-purple-200 text-slate-900"
                            }`}
                          >
                            {RESEARCH_BUDGET_RANGES.map((rng) => (
                              <option key={rng} value={rng}>
                                {rng}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ====================================================================
                  หมวดที่ 2: ข้อมูลด้านการเรียนการสอน
                 ==================================================================== */}
              <div
                className={`p-5 sm:p-7 rounded-3xl border space-y-6 ${
                  isDark
                    ? "bg-[#140B2E] border-purple-800/70 text-white"
                    : "bg-white border-purple-200/80 text-slate-900 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2.5 border-b pb-3 border-purple-500/20">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <h4 className="font-bold text-base sm:text-lg font-serif">
                    ข้อมูลด้านการเรียนการสอน
                  </h4>
                </div>

                {/* 1. จำนวนโหลดชั่วโมงที่ท่านสอนระหว่างปีการศึกษา 2568-2569 */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold">
                    1. จำนวนโหลดชั่วโมงที่ท่านสอนระหว่างปีการศึกษา 2568-2569
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {TEACHING_LOAD_SEMESTERS.map((sem) => {
                      const currentVal =
                        surveyFormState.teaching_load?.[sem] || TEACHING_LOAD_OPTIONS[2];
                      return (
                        <div
                          key={sem}
                          className={`p-3.5 rounded-2xl border space-y-1.5 ${
                            isDark
                              ? "bg-[#1C103F] border-purple-800/70"
                              : "bg-purple-50/40 border-purple-200/60"
                          }`}
                        >
                          <span className="font-bold block text-purple-500">{sem}</span>
                          <select
                            value={currentVal}
                            onChange={(e) =>
                              setSurveyFormState({
                                ...surveyFormState,
                                teaching_load: {
                                  ...surveyFormState.teaching_load,
                                  [sem]: e.target.value,
                                },
                              })
                            }
                            className={`w-full px-2.5 py-2 rounded-xl text-xs font-bold border ${
                              isDark
                                ? "bg-[#140B2E] border-purple-700 text-white"
                                : "bg-white border-purple-200 text-slate-900"
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

                {/* 2 & 3. รายวิชาของท่านมีกิจกรรมให้นักศึกษาลงพื้นที่หรือไม่ และหน่วยงานที่จัดกิจกรรม */}
                <div className="space-y-3 pt-2 border-t border-purple-500/15">
                  <label className="block text-sm font-bold">
                    2. รายวิชาของท่านมีกิจกรรมให้นักศึกษาลงพื้นที่หรือไม่ & 3. หน่วยงานที่ท่านจัดกิจกรรมให้นักศึกษาลงพื้นที่
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {FIELDWORK_SEMESTERS.map((sem) => {
                      const hasField = surveyFormState.fieldwork_presence?.[sem] === "มี";
                      const currentAgency =
                        surveyFormState.fieldwork_agencies?.[sem] || FIELDWORK_AGENCY_OPTIONS[0];

                      return (
                        <div
                          key={sem}
                          className={`p-3.5 rounded-2xl border space-y-2.5 ${
                            isDark
                              ? "bg-[#1C103F] border-purple-800/70"
                              : "bg-purple-50/40 border-purple-200/60"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-purple-500">{sem}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setSurveyFormState({
                                    ...surveyFormState,
                                    fieldwork_presence: {
                                      ...surveyFormState.fieldwork_presence,
                                      [sem]: "มี",
                                    },
                                  })
                                }
                                className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                                  hasField
                                    ? "bg-emerald-600 text-white border-emerald-500"
                                    : isDark
                                    ? "bg-[#140B2E] border-purple-800 text-purple-300"
                                    : "bg-white border-purple-200 text-slate-600"
                                }`}
                              >
                                มี
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setSurveyFormState({
                                    ...surveyFormState,
                                    fieldwork_presence: {
                                      ...surveyFormState.fieldwork_presence,
                                      [sem]: "ไม่มี",
                                    },
                                  })
                                }
                                className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                                  !hasField
                                    ? "bg-slate-700 text-white border-slate-600"
                                    : isDark
                                    ? "bg-[#140B2E] border-purple-800 text-purple-300"
                                    : "bg-white border-purple-200 text-slate-600"
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
                                setSurveyFormState({
                                  ...surveyFormState,
                                  fieldwork_agencies: {
                                    ...surveyFormState.fieldwork_agencies,
                                    [sem]: e.target.value,
                                  },
                                })
                              }
                              className={`w-full px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
                                isDark
                                  ? "bg-[#140B2E] border-purple-700 text-white"
                                  : "bg-white border-purple-200 text-slate-900"
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

              {/* ====================================================================
                  หมวดที่ 3: ข้อมูลด้านบริการวิชาการ
                 ==================================================================== */}
              <div
                className={`p-5 sm:p-7 rounded-3xl border space-y-6 ${
                  isDark
                    ? "bg-[#140B2E] border-purple-800/70 text-white"
                    : "bg-white border-purple-200/80 text-slate-900 shadow-xs"
                }`}
              >
                <div className="flex items-center gap-2.5 border-b pb-3 border-purple-500/20">
                  <HandHelping className="w-5 h-5 text-purple-500" />
                  <h4 className="font-bold text-base sm:text-lg font-serif">
                    ข้อมูลด้านบริการวิชาการ
                  </h4>
                </div>

                {/* 4. จำนวนกิจกรรมบริการวิชาการระหว่างปีการศึกษา 2570-2574 */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold">
                    4. จำนวนกิจกรรมที่ท่านคาดว่าจะดำเนินการการบริการวิชาการระหว่างปีการศึกษา 2570-2574
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                    {SURVEY_YEARS.map((y) => {
                      const val = Number(
                        surveyFormState.academic_services_count?.[String(y)] || 0
                      );
                      return (
                        <div
                          key={y}
                          className={`p-3 rounded-2xl border text-center space-y-2 ${
                            isDark
                              ? "bg-[#1C103F] border-purple-800/70"
                              : "bg-purple-50/40 border-purple-200/60"
                          }`}
                        >
                          <span className="font-bold block text-purple-500">พ.ศ. {y}</span>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setSurveyFormState({
                                  ...surveyFormState,
                                  academic_services_count: {
                                    ...surveyFormState.academic_services_count,
                                    [String(y)]: Math.max(0, val - 1),
                                  },
                                })
                              }
                              className={`w-7 h-7 rounded-lg font-bold border ${
                                isDark
                                  ? "bg-[#140B2E] border-purple-700 text-white"
                                  : "bg-white border-purple-200 text-slate-900"
                              }`}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={val}
                              onChange={(e) =>
                                setSurveyFormState({
                                  ...surveyFormState,
                                  academic_services_count: {
                                    ...surveyFormState.academic_services_count,
                                    [String(y)]: Math.max(0, Number(e.target.value)),
                                  },
                                })
                              }
                              className={`w-12 h-7 text-center font-bold rounded-lg border ${
                                isDark
                                  ? "bg-[#140B2E] border-purple-700 text-white"
                                  : "bg-white border-purple-200 text-slate-900"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setSurveyFormState({
                                  ...surveyFormState,
                                  academic_services_count: {
                                    ...surveyFormState.academic_services_count,
                                    [String(y)]: val + 1,
                                  },
                                })
                              }
                              className={`w-7 h-7 rounded-lg font-bold border ${
                                isDark
                                  ? "bg-[#140B2E] border-purple-700 text-white"
                                  : "bg-white border-purple-200 text-slate-900"
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

                {/* 5. ชุมชนหรือกลุ่มเป้าหมายที่คาดหวังสำหรับการบริการวิชาการในปีการศึกษา 2570-2574 */}
                <div className="space-y-3 pt-2 border-t border-purple-500/15">
                  <label className="block text-sm font-bold">
                    5. ชุมชนหรือกลุ่มเป้าหมายที่คาดหวังสำหรับการบริการวิชาการในปีการศึกษา 2570-2574
                  </label>

                  <div
                    className={`rounded-2xl border divide-y overflow-hidden ${
                      isDark
                        ? "bg-[#1C103F] border-purple-800/70 divide-purple-900/60"
                        : "bg-purple-50/30 border-purple-200/70 divide-purple-100"
                    }`}
                  >
                    {TARGET_COMMUNITY_OPTIONS.map((comm) => {
                      const activeYears = surveyFormState.target_communities[comm] || [];
                      return (
                        <div
                          key={comm}
                          className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <span className="font-semibold leading-snug sm:pr-4">{comm}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {SURVEY_YEARS.map((y) => {
                              const isChecked = activeYears.includes(y);
                              return (
                                <button
                                  key={y}
                                  type="button"
                                  onClick={() => toggleTargetCommunityYear(comm, y)}
                                  className={`px-2.5 py-1 rounded-lg font-bold text-xs border transition-all ${
                                    isChecked
                                      ? "bg-emerald-600 text-white border-emerald-500 shadow-2xs"
                                      : isDark
                                      ? "bg-[#140B2E] border-purple-800 text-purple-300 hover:bg-purple-900/50"
                                      : "bg-white border-purple-200 text-slate-600 hover:bg-purple-100"
                                  }`}
                                >
                                  {y}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. หลักเกณฑ์ในการคัดเลือกชุมชนหรือกลุ่มเป้าหมาย */}
                <div className="space-y-3 pt-2 border-t border-purple-500/15">
                  <label className="block text-sm font-bold">
                    6. หลักเกณฑ์ในการคัดเลือกชุมชนหรือกลุ่มเป้าหมาย
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {CRITERIA_PERCENTAGE_OPTIONS.map((pct) => {
                      const isSelected = surveyFormState.selection_criteria_percentage === pct;
                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() =>
                            setSurveyFormState({
                              ...surveyFormState,
                              selection_criteria_percentage: pct,
                            })
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                              : isDark
                              ? "bg-[#1C103F] border-purple-800 text-purple-200 hover:bg-purple-900/50"
                              : "bg-white border-purple-200 text-slate-700 hover:bg-purple-50"
                          }`}
                        >
                          {pct}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ปุ่มบันทึกด้านล่าง */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (adminEditingStaffId) {
                      setAdminEditingStaffId(null);
                      setSurveyFormState(null);
                      setActiveView("ADMIN");
                      setAdminMenu("INSTRUCTORS");
                    } else {
                      setInstTab("SURVEY_VIEW");
                    }
                  }}
                  className={`px-5 py-3 rounded-2xl border text-xs font-bold ${
                    isDark
                      ? "border-purple-800 text-purple-200 hover:bg-purple-900/40"
                      : "border-purple-200 text-slate-600 hover:bg-purple-50"
                  }`}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-lg transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>บันทึกแบบสำรวจ</span>
                </button>
              </div>
            </form>
          )}
        </main>
      )}

      {/* ====================================================================
          VIEW 3: ระบบสำหรับผู้บริหาร (EXECUTIVE PORTAL)
         ==================================================================== */}
      {activeView === "EXECUTIVE" && currentUser && (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          <div
            className={`rounded-3xl p-6 sm:p-7 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark
                ? "bg-[#140B2E] border-purple-800/70 text-white"
                : "bg-white border-purple-200/80 text-slate-900 shadow-xs"
            }`}
          >
            <div>
              <span className="text-xs font-bold text-purple-500">{currentUser.Department}</span>
              <h2 className="text-xl sm:text-2xl font-black font-serif mt-0.5">
                {currentUser.Full_Name}
              </h2>
            </div>
            <a
              href={GOOGLE_FORM_EXECUTIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shrink-0"
            >
              <span>แบบสำรวจผู้บริหาร</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-5 rounded-3xl border ${
                isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70 shadow-2xs"
              }`}
            >
              <span className="text-xs opacity-70">อาจารย์ในสาขา</span>
              <p className="text-2xl font-black font-serif mt-1">
                {teachersList.filter((t) => t.program === currentUser.Department).length} ท่าน
              </p>
            </div>
            <div
              className={`p-5 rounded-3xl border ${
                isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70 shadow-2xs"
              }`}
            >
              <span className="text-xs opacity-70">ส่งแบบสำรวจแล้ว</span>
              <p className="text-2xl font-black font-serif mt-1 text-emerald-500">
                {
                  teacherSurveys.filter(
                    (s) => s.Department === currentUser.Department && s.Is_Submitted
                  ).length
                }{" "}
                ท่าน
              </p>
            </div>
            <div
              className={`p-5 rounded-3xl border ${
                isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70 shadow-2xs"
              }`}
            >
              <span className="text-xs opacity-70">ผลงาน E-Book ในสาขา</span>
              <p className="text-2xl font-black font-serif mt-1">
                {portfolioWorks.filter((w) => w.Department === currentUser.Department).length} เล่ม
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <form
              onSubmit={handleSaveExecutiveForm}
              className={`lg:col-span-5 rounded-3xl p-6 border space-y-4 ${
                isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70 shadow-2xs"
              }`}
            >
              <h3 className="font-bold text-base font-serif">บันทึกแผนพัฒนาหลักสูตร</h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">ปีการศึกษา</label>
                  <select
                    value={execFormState.Academic_Year}
                    onChange={(e) =>
                      setExecFormState({ ...execFormState, Academic_Year: Number(e.target.value) })
                    }
                    className={`w-full px-3 py-2 rounded-xl border font-bold ${
                      isDark ? "bg-[#1C103F] border-purple-800 text-white" : "bg-purple-50/50 border-purple-200"
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
                    className={`w-full px-3 py-2 rounded-xl border font-bold ${
                      isDark ? "bg-[#1C103F] border-purple-800 text-white" : "bg-purple-50/50 border-purple-200"
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
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isDark ? "bg-[#1C103F] border-purple-800 text-white" : "bg-purple-50/50 border-purple-200"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                บันทึกรายงาน
              </button>
            </form>

            <div
              className={`lg:col-span-7 rounded-3xl p-6 border space-y-3 ${
                isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70 shadow-2xs"
              }`}
            >
              <h3 className="font-bold text-base font-serif">
                รายชื่ออาจารย์ประจำ{currentUser.Department}
              </h3>
              <div className="divide-y divide-purple-500/15">
                {teachersList
                  .filter((t) => t.program === currentUser.Department)
                  .map((t) => {
                    const survey = teacherSurveys.find((s) => s.Staff_ID === t.id);
                    return (
                      <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold">{t.name}</span>
                          <span className="opacity-60 font-mono ml-2">({t.id})</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            survey?.Is_Submitted
                              ? "bg-emerald-500/15 text-emerald-500"
                              : "bg-amber-500/15 text-amber-500"
                          }`}
                        >
                          {survey?.Is_Submitted ? "ส่งแผนแล้ว" : "รอส่งแผน"}
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
          VIEW 4: ระบบแอดมิน (ADMIN COMMAND CENTER)
         ==================================================================== */}
      {activeView === "ADMIN" && (
        <div className="min-h-screen flex flex-col lg:flex-row">
          {/* Sidebar */}
          <aside
            className={`lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r p-4 flex flex-col justify-between ${
              isDark ? "bg-[#110826] border-purple-900/60" : "bg-white border-purple-200/70"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm font-serif">ผู้ดูแลระบบ</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg border border-purple-500/20"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
                {[
                  { id: "INSTRUCTORS", label: "แบบสำรวจอาจารย์", icon: FileText },
                  { id: "DASHBOARD", label: "สถิติภาพรวม", icon: LayoutDashboard },
                  { id: "FACULTY", label: "ทำเนียบอาจารย์", icon: GraduationCap },
                  { id: "SETTINGS", label: "ตั้งค่าระบบ", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAdminMenu(item.id as typeof adminMenu)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        adminMenu === item.id
                          ? "bg-purple-600 text-white shadow-xs"
                          : isDark
                          ? "text-purple-300 hover:bg-purple-900/40"
                          : "text-slate-600 hover:bg-purple-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="hidden lg:flex flex-col gap-2 pt-4 border-t border-purple-500/15">
              <button
                type="button"
                onClick={() => setActiveView("HOME")}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold border ${
                  isDark ? "border-purple-800 text-purple-200" : "border-purple-200 text-slate-700"
                }`}
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
          <div className="flex-1 p-4 sm:p-8 space-y-6 max-w-6xl">
            {/* 1. จัดการแบบสำรวจอาจารย์ + สวิตช์เปิด/ปิด */}
            {adminMenu === "INSTRUCTORS" && (
              <div className="space-y-5">
                <div
                  className={`rounded-3xl p-5 sm:p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70 shadow-2xs"
                  }`}
                >
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold font-serif">
                      แบบสำรวจข้อมูลเบื้องต้นเพื่อจัดทำแผนประจำปีการศึกษา 2570–2574
                    </h2>
                    <p className="text-xs opacity-70 mt-0.5">
                      ส่งแล้ว {teacherSurveys.filter((s) => s.Is_Submitted).length} จาก {teachersList.length} ท่าน
                    </p>
                  </div>

                  {/* ปุ่มเปิด/ปิดแบบสำรวจ */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
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
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${
                        isSubmissionOpen ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {isSubmissionOpen ? "ปิดรับข้อมูล" : "เปิดรับข้อมูล"}
                    </button>
                  </div>
                </div>

                {/* ค้นหาและกรองอาจารย์ */}
                <div
                  className={`rounded-3xl p-5 border space-y-4 ${
                    isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70 shadow-2xs"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-5 relative">
                      <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ค้นหาชื่ออาจารย์ หรือ รหัส..."
                        value={adminTeacherSearch}
                        onChange={(e) => setAdminTeacherSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs ${
                          isDark
                            ? "bg-[#0D0620] border-purple-800 text-white"
                            : "bg-purple-50/40 border-purple-200 text-slate-900"
                        }`}
                      />
                    </div>

                    <div className="md:col-span-4">
                      <select
                        value={adminTeacherDeptFilter}
                        onChange={(e) => setAdminTeacherDeptFilter(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                          isDark
                            ? "bg-[#0D0620] border-purple-800 text-white"
                            : "bg-purple-50/40 border-purple-200 text-slate-900"
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

                    <div className="md:col-span-3 flex rounded-xl p-1 border border-purple-500/20">
                      {(["ALL", "SUBMITTED", "PENDING"] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAdminTeacherStatusFilter(st)}
                          className={`flex-1 py-1 rounded-lg text-xs font-bold ${
                            adminTeacherStatusFilter === st
                              ? "bg-purple-600 text-white"
                              : "opacity-70"
                          }`}
                        >
                          {st === "ALL" ? "ทั้งหมด" : st === "SUBMITTED" ? "ส่งแล้ว" : "ยังไม่ส่ง"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-purple-500/20 opacity-70">
                          <th className="py-3 px-3">รหัส</th>
                          <th className="py-3 px-3">ชื่อ-สกุล</th>
                          <th className="py-3 px-3">สาขาวิชา</th>
                          <th className="py-3 px-3">สถานะ</th>
                          <th className="py-3 px-3 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-500/10">
                        {adminTeachersFiltered.map((teacher) => {
                          const survey = teacherSurveys.find(
                            (s) => s.Staff_ID.trim().toUpperCase() === teacher.id.trim().toUpperCase()
                          );
                          const isSubmitted = !!survey?.Is_Submitted;

                          return (
                            <tr key={teacher.id}>
                              <td className="py-3 px-3 font-mono font-bold">{teacher.id}</td>
                              <td className="py-3 px-3 font-bold">{teacher.name}</td>
                              <td className="py-3 px-3 opacity-80">{teacher.program}</td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                    isSubmitted
                                      ? "bg-emerald-500/15 text-emerald-500"
                                      : "bg-amber-500/15 text-amber-500"
                                  }`}
                                >
                                  {isSubmitted ? "ส่งแล้ว" : "ยังไม่ส่ง"}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isSubmitted && (
                                    <button
                                      type="button"
                                      onClick={() => setAdminViewingSurvey(survey || null)}
                                      className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 text-purple-400 font-bold hover:bg-purple-500/25"
                                    >
                                      ดูข้อมูล
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdminEditingStaffId(teacher.id);
                                      handleStartSurvey(teacher.id);
                                      setActiveView("INSTRUCTOR");
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500"
                                  >
                                    แก้ไข
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. สถิติภาพรวม */}
            {adminMenu === "DASHBOARD" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className={`p-5 rounded-3xl border ${isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70"}`}>
                    <span className="text-xs opacity-70">คณาจารย์ทั้งหมด</span>
                    <p className="text-2xl font-black mt-1">{teachersList.length} ท่าน</p>
                  </div>
                  <div className={`p-5 rounded-3xl border ${isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70"}`}>
                    <span className="text-xs opacity-70">ส่งแบบสำรวจแล้ว</span>
                    <p className="text-2xl font-black mt-1 text-emerald-500">
                      {teacherSurveys.filter((s) => s.Is_Submitted).length} ท่าน
                    </p>
                  </div>
                  <div className={`p-5 rounded-3xl border ${isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70"}`}>
                    <span className="text-xs opacity-70">คลัง E-Book</span>
                    <p className="text-2xl font-black mt-1">{portfolioWorks.length} เล่ม</p>
                  </div>
                  <div className={`p-5 rounded-3xl border ${isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70"}`}>
                    <span className="text-xs opacity-70">รายงานสาขาวิชา</span>
                    <p className="text-2xl font-black mt-1">{executiveForms.length} ฉบับ</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70"}`}>
                    <h3 className="font-bold text-sm flex items-center gap-2 font-serif">
                      <BarChart3 className="w-4 h-4 text-purple-500" />
                      <span>สถิติแผนและผลงาน (2570–2574)</span>
                    </h3>
                    <div className="h-48 flex items-end justify-around gap-2 pt-6 pb-2 border-b border-purple-500/15">
                      {adminChartData.map((d, idx) => {
                        const maxVal = Math.max(
                          ...adminChartData.map((x) => Math.max(x.formsCount, x.worksCount, 1)),
                          4
                        );
                        const hForm = Math.max((d.formsCount / maxVal) * 120, 8);
                        const hWork = Math.max((d.worksCount / maxVal) * 120, 8);
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                            <div className="flex items-end gap-1 h-32">
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

                  <div className={`p-6 rounded-3xl border space-y-4 ${isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70"}`}>
                    <h3 className="font-bold text-sm flex items-center gap-2 font-serif">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span>จัดการคลัง E-Book</span>
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {portfolioWorks.map((w) => (
                        <div key={w.Work_ID} className="p-2.5 rounded-xl border border-purple-500/15 flex items-center justify-between text-xs">
                          <div className="truncate pr-2">
                            <p className="font-bold truncate">{w.Title}</p>
                            <p className="opacity-60 text-[11px]">{w.Instructor_Name}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleWorkVisibility(w)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shrink-0 ${
                              w.Is_Public ? "bg-emerald-500/15 text-emerald-500" : "bg-slate-500/15 text-slate-400"
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

            {/* 3. ทำเนียบอาจารย์ 67 ท่าน */}
            {adminMenu === "FACULTY" && (
              <div className={`rounded-3xl p-6 border space-y-4 ${isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70"}`}>
                <h2 className="text-lg font-bold font-serif">ทำเนียบคณาจารย์ ({teachersList.length} ท่าน)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-purple-500/20 opacity-70">
                        <th className="py-2.5 px-2">รหัส</th>
                        <th className="py-2.5 px-2">ชื่อ-สกุล</th>
                        <th className="py-2.5 px-2">สาขาวิชา</th>
                        <th className="py-2.5 px-2">คุณวุฒิ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {teachersList.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2.5 px-2 font-mono font-bold">{t.id}</td>
                          <td className="py-2.5 px-2 font-bold">{t.name}</td>
                          <td className="py-2.5 px-2 opacity-80">{t.program}</td>
                          <td className="py-2.5 px-2">
                            {t.degrees[0]?.level} ({t.degrees[0]?.degree})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. ตั้งค่าระบบ */}
            {adminMenu === "SETTINGS" && (
              <div className={`rounded-3xl p-6 border space-y-5 ${isDark ? "bg-[#140B2E] border-purple-800/70" : "bg-white border-purple-200/70"}`}>
                <h2 className="text-lg font-bold font-serif">ตั้งค่าระบบ</h2>
                <div className="p-5 rounded-2xl border border-purple-500/20 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-sm">
                      {isSubmissionOpen ? "เปิดรับแบบสำรวจแผน 2570–2574" : "ปิดรับแบบสำรวจชั่วคราว"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isSubmissionOpen;
                      setIsSubmissionOpen(next);
                      showToast(next ? "เปิดรับข้อมูลแล้ว" : "ปิดรับข้อมูลแล้ว");
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white ${
                      isSubmissionOpen ? "bg-red-600" : "bg-emerald-600"
                    }`}
                  >
                    {isSubmissionOpen ? "สั่งปิด" : "สั่งเปิด"}
                  </button>
                </div>

                <div className="flex items-center gap-3">
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALS: ล็อกอิน, เปิดอ่าน E-Book, ประวัติอาจารย์, ดูผลสำรวจแอดมิน, เปลี่ยนรหัสผ่าน
         ==================================================================== */}
      {loginModalRole && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-3xl max-w-sm w-full p-6 border shadow-2xl space-y-5 ${
              isDark
                ? "bg-[#160D33] border-purple-800 text-white"
                : "bg-white border-purple-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif">
                {loginModalRole === "INSTRUCTOR"
                  ? "เข้าสู่ระบบอาจารย์ผู้สอน"
                  : loginModalRole === "EXECUTIVE"
                  ? "เข้าสู่ระบบผู้บริหาร"
                  : "เข้าสู่ระบบแอดมิน"}
              </h3>
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

            <form onSubmit={handleLogin} className="space-y-4">
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
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border font-mono ${
                    isDark
                      ? "border-purple-800 bg-[#211347] text-white"
                      : "border-purple-200 bg-purple-50/40 text-slate-900"
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
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                    isDark
                      ? "border-purple-800 bg-[#211347] text-white"
                      : "border-purple-200 bg-purple-50/40 text-slate-900"
                  }`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            {/* ปุ่มคลิกเดียวเติมรหัสทดสอบ */}
            <div className="pt-3 border-t border-purple-500/15 flex flex-wrap gap-1.5 text-xs">
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
                    EDU-001
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStaffId("EDU-002");
                      setLoginPassword("123456");
                    }}
                    className="px-2.5 py-1 rounded-lg border border-purple-500/30 font-medium"
                  >
                    EDU-002
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
      )}

      {/* Modal: ดูรายละเอียดอาจารย์ (จากทำเนียบ) */}
      {selectedTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-3xl max-w-lg w-full p-6 border shadow-2xl space-y-5 ${
              isDark
                ? "bg-[#160D33] border-purple-800 text-white"
                : "bg-white border-purple-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono font-bold text-purple-500">
                  {selectedTeacherModal.id} • {selectedTeacherModal.program}
                </span>
                <h3 className="text-xl font-bold font-serif mt-0.5">
                  {selectedTeacherModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacherModal(null)}
                className="p-1.5 rounded-full hover:bg-purple-500/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedTeacherModal.degrees.map((deg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border space-y-0.5 ${
                    isDark
                      ? "bg-[#1F1246] border-purple-800/80"
                      : "bg-purple-50/50 border-purple-200/70"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-500">{deg.level}</span>
                    {deg.year && <span className="opacity-70">พ.ศ. {deg.year}</span>}
                  </div>
                  <p className="text-sm font-bold font-serif">
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-3xl max-w-3xl w-full p-6 border shadow-2xl space-y-4 ${
              isDark
                ? "bg-[#160D33] border-purple-800 text-white"
                : "bg-white border-purple-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b pb-3 border-purple-500/20">
              <div>
                <span className="text-xs font-bold text-purple-500">
                  {selectedWorkModal.Category} • พ.ศ. {selectedWorkModal.Academic_Year}
                </span>
                <h3 className="font-bold text-lg font-serif">{selectedWorkModal.Title}</h3>
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

            <div className="flex items-center justify-between pt-3 border-t border-purple-500/20">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 border shadow-2xl space-y-5 ${
              isDark
                ? "bg-[#160D33] border-purple-800 text-white"
                : "bg-white border-purple-200 text-slate-900"
            }`}
          >
            <div className="flex items-start justify-between border-b pb-3 border-purple-500/20">
              <div>
                <h3 className="text-lg font-bold font-serif">{adminViewingSurvey.Full_Name}</h3>
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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

            <div className="flex justify-end gap-2 pt-3 border-t border-purple-500/20">
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
                  handleStartSurvey(staffId);
                  setActiveView("INSTRUCTOR");
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                แก้ไขข้อมูลชุดนี้
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: เปลี่ยนรหัสผ่าน */}
      {showPasswordModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`rounded-3xl max-w-sm w-full p-6 border shadow-2xl space-y-4 ${
              isDark
                ? "bg-[#160D33] border-purple-800 text-white"
                : "bg-white border-purple-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif">เปลี่ยนรหัสผ่าน</h3>
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
                  className={`w-full px-3.5 py-2 rounded-xl border ${
                    isDark ? "bg-[#1E1145] border-purple-800 text-white" : "bg-purple-50/50 border-purple-200"
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
                  className={`w-full px-3.5 py-2 rounded-xl border ${
                    isDark ? "bg-[#1E1145] border-purple-800 text-white" : "bg-purple-50/50 border-purple-200"
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