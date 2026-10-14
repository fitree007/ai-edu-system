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
  Sparkles,
  Eye,
  GraduationCap,
  Award,
  Layers,
  X,
  Calendar,
  Filter,
  Check
} from "lucide-react";

import {
  EDUCATION_PROGRAMS,
  INITIAL_TEACHERS,
  INITIAL_STAFF,
  INITIAL_PORTFOLIO_WORKS,
  INITIAL_INSTRUCTOR_FORMS,
  INITIAL_EXECUTIVE_FORMS,
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
  const [selectedWorkModal, setSelectedWorkModal] = useState<PortfolioWork | null>(null);
  const [selectedTeacherModal, setSelectedTeacherModal] = useState<TeacherInfo | null>(null);
  const [ebookPage, setEbookPage] = useState(1);

  // Instructor Portal State
  const [instTab, setInstTab] = useState<"FORM" | "PORTFOLIO" | "PASSWORD">("FORM");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [instFormState, setInstFormState] = useState({
    Academic_Year: 2570,
    Course_Code: "",
    Course_Name: "",
    Teaching_Method: "Active Learning ร่วมกับโครงงานเป็นฐาน (PBL)",
    Target_KPI: "นักศึกษามีผลสัมฤทธิ์ระดับ B ขึ้นไปไม่น้อยกว่าร้อยละ 85",
    Teaching_Summary: "",
    Research_Output: "",
    Ebook_Planned: "",
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
    Faculty_Count: 6,
    Total_Graduates: 80,
    Quality_Score: 4.75,
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

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // LocalStorage SWR Caching
  useEffect(() => {
    try {
      const cachedStaff = localStorage.getItem("edu_staff_v2");
      const cachedInst = localStorage.getItem("edu_inst_v2");
      const cachedWorks = localStorage.getItem("edu_works_v2");
      const cachedExec = localStorage.getItem("edu_exec_v2");

      if (cachedStaff) setStaffList(JSON.parse(cachedStaff));
      if (cachedInst) setInstructorForms(JSON.parse(cachedInst));
      if (cachedWorks) setPortfolioWorks(JSON.parse(cachedWorks));
      if (cachedExec) setExecutiveForms(JSON.parse(cachedExec));
    } catch (e) {
      console.warn("LocalStorage cache error:", e);
    }

    if (GAS_API_URL) {
      syncWithGAS();
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("edu_staff_v2", JSON.stringify(staffList));
      localStorage.setItem("edu_inst_v2", JSON.stringify(instructorForms));
      localStorage.setItem("edu_works_v2", JSON.stringify(portfolioWorks));
      localStorage.setItem("edu_exec_v2", JSON.stringify(executiveForms));
    } catch (e) {
      console.warn("Failed to persist to localStorage", e);
    }
  }, [staffList, instructorForms, portfolioWorks, executiveForms]);

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

  // Auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const user = staffList.find(
      (s) =>
        s.Staff_ID.trim().toUpperCase() === loginStaffId.trim().toUpperCase() &&
        String(s.Password) === loginPassword.trim()
    );

    if (!user) {
      setLoginError("รหัสบุคลากรหรือรหัสผ่านไม่ถูกต้อง (สามารถคลิกปุ่มรหัสทดสอบด้านล่างเพื่อเข้าสู่ระบบ)");
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

  // Current Teacher Profile Info from Sheet
  const currentTeacherProfile = useMemo(() => {
    if (!currentUser) return null;
    return teachersList.find(
      (t) =>
        t.name.trim() === currentUser.Full_Name.trim() ||
        t.id.toUpperCase() === currentUser.Staff_ID.toUpperCase()
    );
  }, [currentUser, teachersList]);

  // Save Instructor Form
  const handleSaveInstructorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const recordId = editingRecordId || `PLAN-INST-${Date.now()}`;
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
      additionalNotes: newRecord.Additional_Notes,
    });

    setEditingRecordId(null);
    setInstFormState({
      Academic_Year: 2570,
      Course_Code: "",
      Course_Name: "",
      Teaching_Method: "Active Learning ร่วมกับโครงงานเป็นฐาน (PBL)",
      Target_KPI: "นักศึกษามีผลสัมฤทธิ์ระดับ B ขึ้นไปไม่น้อยกว่าร้อยละ 85",
      Teaching_Summary: "",
      Research_Output: "",
      Ebook_Planned: "",
      Additional_Notes: "",
    });
    showToast(editingRecordId ? "แก้ไขข้อมูลแผนเรียบร้อยแล้ว" : "บันทึกข้อมูลแผน 2570–2574 สำเร็จแล้ว");
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
      Additional_Notes: rec.Additional_Notes,
    });
    setInstTab("FORM");
  };

  // Upload Portfolio
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

    const workId = editingWorkId || `WRK-EDU-${Date.now()}`;
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
    showToast(newWork.Is_Public ? "อัปโหลดและเผยแพร่สู่คลังสาธารณะแล้ว!" : "บันทึกผลงานแบบส่วนตัวแล้ว");
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

    const execId = editingExecId || `PLAN-EXEC-${Date.now()}`;
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
    showToast(`บันทึกข้อมูลสรุปของ ${currentUser.Department} เรียบร้อยแล้ว`);
  };

  // Filters for Public Hub
  const publicWorksFiltered = useMemo(() => {
    return portfolioWorks.filter((w) => {
      if (!w.Is_Public) return false;
      const matchDept = publicDeptFilter === "ALL" || w.Department === publicDeptFilter;
      const q = publicSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        w.Instructor_Name.toLowerCase().includes(q) ||
        w.Title.toLowerCase().includes(q) ||
        w.Department.toLowerCase().includes(q) ||
        String(w.Academic_Year).includes(q);
      return matchDept && matchQuery;
    });
  }, [portfolioWorks, publicSearch, publicDeptFilter]);

  const publicTeachersFiltered = useMemo(() => {
    return teachersList.filter((t) => {
      const matchDept = publicDeptFilter === "ALL" || t.program === publicDeptFilter;
      const q = publicSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.program.toLowerCase().includes(q) ||
        t.degrees.some((d) => d.major.toLowerCase().includes(q) || d.institution.toLowerCase().includes(q));
      return matchDept && matchQuery;
    });
  }, [teachersList, publicSearch, publicDeptFilter]);

  // Admin Chart Calculations (Years 2570-2574 and 5-Year Intervals)
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
    // Single Year Mode across 12 programs
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER */}
      {activeView !== "ADMIN" && (
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/85 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div
              onClick={() => setActiveView("HOME")}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-slate-900">
                  คณะศึกษาศาสตร์ • Academic Bento Portal
                </h1>
                <p className="text-[11px] text-slate-500">
                  ระบบแผน 2570–2574, คลังผลงาน E-Book ดิจิทัล & ทำเนียบคณาจารย์ 12 สาขาวิชา
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Google Sheets Sync {isSyncing ? "(กำลังเชื่อมต่อ...)" : "พร้อมใช้งาน"}</span>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveView(currentUser.Role)}
                    className="text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    หน้าจัดการของ {currentUser.Full_Name.split(" ")[0]}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setLoginModalRole("ADMIN")}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>สำหรับแอดมิน</span>
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* ====================================================================
          VIEW 1: หน้าหลัก (HOME)
         ==================================================================== */}
      {activeView === "HOME" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
          {/* Bento Portal 2 ปุ่มหลัก */}
          <section>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  คณะศึกษาศาสตร์ • Faculty of Education
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-slate-900">
                  ระบบสำรวจข้อมูลเพื่อจัดทำแผน พ.ศ. 2570–2574
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                เชื่อมต่อฐานข้อมูล Google Sheets และคลังเอกสาร Google Drive สะดวก รวดเร็ว ใช้งานได้ทุกอุปกรณ์
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ปุ่มที่ 1: สำหรับอาจารย์ผู้สอน */}
              <div
                onClick={() => {
                  if (currentUser?.Role === "INSTRUCTOR") setActiveView("INSTRUCTOR");
                  else setLoginModalRole("INSTRUCTOR");
                }}
                className="group relative overflow-hidden rounded-3xl bg-white p-7 sm:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[260px]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    ปุ่มที่ 1 • สำหรับอาจารย์ผู้สอน
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    1. สำหรับอาจารย์ผู้สอน
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    ล็อกอินด้วยรหัสบุคลากร (เช่น EDU-001) และรหัสผ่านเริ่มต้น เพื่อกรอกแบบสำรวจจัดทำแผนประจำปี 2570–2574
                    แก้ไขข้อมูลที่เคยกรอกได้ตลอดเวลา และอัปโหลดผลงาน E-Book หรือสื่อการสอนสู่คลังสาธารณะ
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-indigo-600">
                  <span>เข้าสู่ระบบกรอกข้อมูลของอาจารย์</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* ปุ่มที่ 2: สำหรับผู้บริหาร */}
              <div
                onClick={() => {
                  if (currentUser?.Role === "EXECUTIVE") setActiveView("EXECUTIVE");
                  else setLoginModalRole("EXECUTIVE");
                }}
                className="group relative overflow-hidden rounded-3xl bg-slate-900 text-white p-7 sm:p-8 border border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[260px]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                    ปุ่มที่ 2 • สำหรับผู้บริหาร (หัวหน้าสาขา)
                  </span>
                </div>

                <div className="mt-5">
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    2. สำหรับผู้บริหาร (หัวหน้าสาขา)
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    สำหรับหัวหน้าสาขาวิชา (12 สาขา) เข้ามากรอกข้อมูลแผนและสรุปผลการดำเนินงาน
                    เมื่อกดส่ง สามารถดูข้อมูลสรุป สถิติ และรายชื่ออาจารย์เฉพาะในสาขาวิชาของตนเองเท่านั้น (Department Isolation)
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-sm font-semibold text-emerald-400">
                  <span>เข้าสู่ระบบสรุปผลเฉพาะสาขาวิชา</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================
              โซนคลังข้อมูลสาธารณะ (PUBLIC REPOSITORY & E-BOOK HUB)
             ================================================================ */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Public Digital Repository • เปิดเผยสาธารณะ ไม่ต้องล็อกอิน</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  คลังผลงานวิชาการ E-Book & ทำเนียบคณาจารย์ คณะศึกษาศาสตร์
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  ค้นหาชื่ออาจารย์ (67 ท่าน) เปิดอ่านหนังสือ E-Book พลิกหน้า 3D ดาวน์โหลดเอกสาร หรือดูประวัติคุณวุฒิการศึกษา
                </p>
              </div>

              {/* สลับแท็บระหว่าง คลัง E-Book และ ทำเนียบคณาจารย์ */}
              <div className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
                <button
                  onClick={() => setPublicHubTab("EBOOKS")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    publicHubTab === "EBOOKS"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>คลังผลงาน & E-Book ({publicWorksFiltered.length})</span>
                </button>
                <button
                  onClick={() => setPublicHubTab("FACULTY")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    publicHubTab === "FACULTY"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>ทำเนียบคุณวุฒิคณาจารย์ ({publicTeachersFiltered.length})</span>
                </button>
              </div>
            </div>

            {/* ช่องค้นหาและตัวกรอง 12 สาขาวิชา */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={publicSearch}
                  onChange={(e) => setPublicSearch(e.target.value)}
                  placeholder="ค้นหาชื่ออาจารย์, ชื่อผลงาน, สถาบันที่จบ, วุฒิการศึกษา..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
                <select
                  value={publicDeptFilter}
                  onChange={(e) => setPublicDeptFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="ALL">ทุกสาขาวิชา (12 หลักสูตร)</option>
                  {EDUCATION_PROGRAMS.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TAB A: คลังผลงาน E-Book */}
            {publicHubTab === "EBOOKS" && (
              <div>
                {publicWorksFiltered.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 border border-dashed border-slate-200 rounded-2xl">
                    <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">ไม่พบผลงานที่ตรงกับคำค้นหา</p>
                    <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองสาขาวิชาอื่น</p>
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
                        className="group rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white p-5 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* ปกหนังสือ E-Book จำลอง */}
                          <div
                            className={`h-44 rounded-2xl p-5 flex flex-col justify-between mb-4 relative overflow-hidden shadow-sm group-hover:shadow-md transition-shadow ${
                              work.Work_Type === "PDF"
                                ? "bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white"
                                : "bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm font-semibold">
                                {work.Work_Type === "PDF" ? "📖 E-Book (PDF)" : "🔗 Live / External Link"}
                              </span>
                              <span className="opacity-80 font-mono">พ.ศ. {work.Academic_Year}</span>
                            </div>
                            <div>
                              <p className="text-[11px] uppercase tracking-wider opacity-75 font-semibold">
                                {work.Department}
                              </p>
                              <h4 className="font-bold text-base line-clamp-2 mt-0.5 leading-snug">
                                {work.Title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold mb-2">
                            <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                            <span>ผู้สอน: {work.Instructor_Name}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {work.Description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-indigo-600">
                          <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            <Eye className="w-3.5 h-3.5" />
                            {work.Work_Type === "PDF" ? "เปิดอ่าน E-Book / โหลดไฟล์" : "เปิดหน้าพรีวิวลิงก์"}
                          </span>
                          <span className="text-slate-400 font-normal">โหลด {work.Downloads} ครั้ง</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB B: ทำเนียบคณาจารย์และคุณวุฒิ (67 ท่าน จากชีตจริง) */}
            {publicHubTab === "FACULTY" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {publicTeachersFiltered.map((teacher) => (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacherModal(teacher)}
                    className="group rounded-3xl border border-slate-200 bg-white p-5 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                          {teacher.id}
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                        {teacher.name}
                      </h4>
                      <p className="text-xs font-medium text-indigo-700 mt-0.5">
                        {teacher.program}
                      </p>

                      {/* รายการระดับคุณวุฒิการศึกษา */}
                      <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                        {teacher.degrees.map((d, idx) => (
                          <div key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="font-bold text-slate-800 shrink-0">• {d.level}:</span>
                            <span className="truncate" title={`${d.degree} (${d.major}) - ${d.institution}`}>
                              {d.degree} {d.major ? `(${d.major})` : ""} - {d.institution}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                      <span>คลิกเพื่อดูโปรไฟล์เต็ม & ผลงาน</span>
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
          VIEW 2: ระบบสำหรับอาจารย์ผู้สอน (INSTRUCTOR PORTAL)
         ==================================================================== */}
      {activeView === "INSTRUCTOR" && currentUser && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Header แสดงข้อมูลและคุณวุฒิของอาจารย์ที่ดึงมาจากชีตจริง */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-600 text-white">
                  รหัสบุคลากร: {currentUser.Staff_ID}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {currentUser.Department}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                {currentUser.Full_Name}
              </h2>

              {/* แสดงคุณวุฒิที่ผูกกับอาจารย์ท่านนี้ */}
              {currentTeacherProfile && currentTeacherProfile.degrees.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {currentTeacherProfile.degrees.map((deg, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                      🎓 {deg.level} ({deg.degree}): {deg.institution}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* แถบสลับเมนูย่อยของอาจารย์ */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInstTab("FORM")}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  instTab === "FORM"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>1. กรอก/แก้ไขแผน 2570–2574</span>
              </button>
              <button
                onClick={() => setInstTab("PORTFOLIO")}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  instTab === "PORTFOLIO"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>2. อัปโหลดผลงาน (E-Book/สื่อ)</span>
              </button>
              <button
                onClick={() => setInstTab("PASSWORD")}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                  instTab === "PASSWORD"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>เปลี่ยนรหัสผ่าน</span>
              </button>
            </div>
          </div>

          {/* แท็บ 1: แบบสำรวจจัดทำแผนประจำปี 2570–2574 (คณะศึกษาศาสตร์) */}
          {instTab === "FORM" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleSaveInstructorForm}
                className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-lg text-slate-900">
                    {editingRecordId ? "✏️ แก้ไขข้อมูลแผนที่เคยกรอก" : "📝 แบบสำรวจแผน 2570–2574"}
                  </h3>
                  {editingRecordId && (
                    <button
                      type="button"
                      onClick={() => setEditingRecordId(null)}
                      className="text-xs text-red-600 font-semibold hover:underline"
                    >
                      ยกเลิกแก้ไข
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ปีการศึกษา (พ.ศ.)
                    </label>
                    <select
                      value={instFormState.Academic_Year}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Academic_Year: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    >
                      {[2570, 2571, 2572, 2573, 2574, 2568, 2569].map((y) => (
                        <option key={y} value={y}>
                          พ.ศ. {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      รหัสวิชาที่รับผิดชอบ
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น ED101"
                      value={instFormState.Course_Code}
                      onChange={(e) =>
                        setInstFormState({ ...instFormState, Course_Code: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ชื่อรายวิชาที่สอน
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ระบุชื่อรายวิชา..."
                    value={instFormState.Course_Name}
                    onChange={(e) =>
                      setInstFormState({ ...instFormState, Course_Name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    รูปแบบและวิธีการจัดการเรียนการสอน (Active Learning)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น โครงงานเป็นฐาน (PBL), การสะท้อนคิด..."
                    value={instFormState.Teaching_Method}
                    onChange={(e) =>
                      setInstFormState({ ...instFormState, Teaching_Method: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    เป้าหมายผลสัมฤทธิ์ของผู้เรียน (KPI)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นศ. ร้อยละ 85 มีผลสัมฤทธิ์เกณฑ์ B ขึ้นไป"
                    value={instFormState.Target_KPI}
                    onChange={(e) =>
                      setInstFormState({ ...instFormState, Target_KPI: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    แผนการผลิตผลงานวิชาการ / งานวิจัยในรอบปี
                  </label>
                  <input
                    type="text"
                    placeholder="ระบุชื่อบทความวิจัย หรือสิทธิบัตร..."
                    value={instFormState.Research_Output}
                    onChange={(e) =>
                      setInstFormState({ ...instFormState, Research_Output: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    แผนการจัดทำสื่อการสอนดิจิทัล / หนังสือ E-Book
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น จัดทำ E-Book คู่มือปฏิบัติการ 1 เล่ม"
                    value={instFormState.Ebook_Planned}
                    onChange={(e) =>
                      setInstFormState({ ...instFormState, Ebook_Planned: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ข้อเสนอแนะ / ความต้องการสนับสนุนจากคณะ
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น ต้องการงบประมาณสนับสนุนการตีพิมพ์ หรืออุปกรณ์ห้องปฏิบัติการ..."
                    value={instFormState.Additional_Notes}
                    onChange={(e) =>
                      setInstFormState({ ...instFormState, Additional_Notes: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all"
                >
                  {editingRecordId ? "บันทึกการแก้ไขข้อมูล" : "บันทึกข้อมูลแผน 2570–2574"}
                </button>
              </form>

              {/* รายการข้อมูลแผนที่อาจารย์เคยกรอก (กดปุ่มแก้ไขได้ทันที) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-lg text-slate-900">
                    📋 ประวัติข้อมูลแผนที่คุณเคยกรอกไว้ (คลิกเพื่อแก้ไข)
                  </h3>
                  <span className="text-xs text-slate-500">
                    {instructorForms.filter((f) => f.Staff_ID === currentUser.Staff_ID).length} รายการ
                  </span>
                </div>

                <div className="space-y-3">
                  {instructorForms.filter((f) => f.Staff_ID === currentUser.Staff_ID).length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      คุณยังไม่ได้กรอกข้อมูลแผน สามารถกรอกแบบสำรวจทางด้านซ้ายเพื่อบันทึกข้อมูลได้ทันที
                    </div>
                  ) : (
                    instructorForms
                      .filter((f) => f.Staff_ID === currentUser.Staff_ID)
                      .map((rec) => (
                        <div
                          key={rec.Record_ID}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-600 text-white">
                                แผน พ.ศ. {rec.Academic_Year}
                              </span>
                              <span className="font-bold text-sm text-slate-900">
                                {rec.Course_Code} — {rec.Course_Name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">วิธีสอน: {rec.Teaching_Method}</p>
                            <p className="text-xs text-slate-500">
                              วิจัย: {rec.Research_Output || "-"} • สื่อ E-Book: {rec.Ebook_Planned || "-"}
                            </p>
                          </div>

                          <button
                            onClick={() => handleEditInstructorForm(rec)}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 shadow-sm transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>แก้ไขข้อมูล</span>
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* แท็บ 2: อัปโหลดผลงานวิชาการ / E-Book */}
          {instTab === "PORTFOLIO" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleSavePortfolioWork}
                className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4"
              >
                <h3 className="font-bold text-lg border-b border-slate-100 pb-3 text-slate-900">
                  📤 อัปโหลดผลงานวิชาการ / สื่อการสอน E-Book
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ปีการศึกษา (พ.ศ.)
                    </label>
                    <select
                      value={workFormState.Academic_Year}
                      onChange={(e) =>
                        setWorkFormState({ ...workFormState, Academic_Year: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    >
                      {[2570, 2571, 2572, 2573, 2574, 2568, 2569].map((y) => (
                        <option key={y} value={y}>
                          พ.ศ. {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      ประเภทผลงาน
                    </label>
                    <select
                      value={workFormState.Work_Type}
                      onChange={(e) =>
                        setWorkFormState({
                          ...workFormState,
                          Work_Type: e.target.value as "PDF" | "LINK",
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium"
                    >
                      <option value="PDF">ไฟล์ PDF (แสดงผลแบบ E-Book)</option>
                      <option value="LINK">ลิงก์ไลฟ์สด / วิดีโอ / เว็บไซต์</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ชื่อผลงาน / ชื่อหนังสือ E-Book
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ระบุชื่อผลงาน..."
                    value={workFormState.Title}
                    onChange={(e) => setWorkFormState({ ...workFormState, Title: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                {workFormState.Work_Type === "PDF" ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-600">
                      อัปโหลดไฟล์ PDF (ระบบบันทึกลง Google Drive อัตโนมัติ)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <input
                      type="url"
                      placeholder="หรือวาง URL ของไฟล์ PDF โดยตรง..."
                      value={workFormState.File_Or_Link_URL}
                      onChange={(e) =>
                        setWorkFormState({ ...workFormState, File_Or_Link_URL: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                {/* สวิตช์กำหนดว่าจะเผยแพร่สาธารณะหรือไม่ */}
                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      เผยแพร่ผลงานนี้สู่คลังข้อมูลสาธารณะ
                    </p>
                    <p className="text-[11px] text-slate-500">
                      หากเปิด นักศึกษาและบุคคลภายนอกจะสามารถค้นหาชื่อคุณและเปิดอ่าน E-Book ได้
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={workFormState.Is_Public}
                    onChange={(e) =>
                      setWorkFormState({ ...workFormState, Is_Public: e.target.checked })
                    }
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all"
                >
                  อัปโหลดและบันทึกผลงาน
                </button>
              </form>

              {/* รายการผลงานทั้งหมดของอาจารย์ท่านนี้ */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-lg border-b border-slate-100 pb-3 text-slate-900">
                  📚 ผลงานทั้งหมดของคุณ ({portfolioWorks.filter((w) => w.Staff_ID === currentUser.Staff_ID).length} รายการ)
                </h3>

                <div className="space-y-3">
                  {portfolioWorks.filter((w) => w.Staff_ID === currentUser.Staff_ID).length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      ยังไม่มีผลงานที่อัปโหลด คุณสามารถอัปโหลดไฟล์ PDF ด้านซ้ายเพื่อเริ่มสร้างคลัง E-Book ของคุณ
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
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  <Globe className="w-3 h-3" /> เผยแพร่สาธารณะ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                                  <Lock className="w-3 h-3" /> เฉพาะในระบบ
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
                                ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
                                : "border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                            }`}
                          >
                            {w.Is_Public ? "เปลี่ยนเป็นส่วนตัว" : "เปิดเผยแพร่สาธารณะ"}
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* แท็บ 3: เปลี่ยนรหัสผ่าน */}
          {instTab === "PASSWORD" && (
            <form
              onSubmit={handleChangePassword}
              className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4"
            >
              <h3 className="font-bold text-lg text-slate-900">🔐 เปลี่ยนรหัสผ่านประจำตัวบุคลากร</h3>
              <p className="text-xs text-slate-500">
                คุณสามารถตั้งรหัสผ่านใหม่เพื่อความปลอดภัยในการเข้าใช้งานระบบ
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm transition-colors"
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
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                สิทธิ์ระดับหัวหน้าสาขา • ดูข้อมูลเฉพาะ {currentUser.Department} เท่านั้น
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">
                แดชบอร์ดสรุปและรายงานแผน: {currentUser.Department}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                ผู้บริหาร: {currentUser.Full_Name} ({currentUser.Staff_ID}) • คณะศึกษาศาสตร์
              </p>
            </div>
          </div>

          {/* สถิติ Bento เฉพาะสาขาของหัวหน้าสาขาท่านนี้เท่านั้น */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500">อาจารย์ประจำหลักสูตร ({currentUser.Department})</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {teachersList.filter((t) => t.program === currentUser.Department).length}{" "}
                <span className="text-xs font-normal text-slate-500">ท่าน</span>
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500">ข้อมูลแผนการสอนที่ส่งแล้ว (2570–2574)</p>
              <p className="text-3xl font-extrabold text-indigo-600 mt-2">
                {instructorForms.filter((f) => f.Department === currentUser.Department).length}{" "}
                <span className="text-xs font-normal text-slate-500">วิชา</span>
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500">ผลงาน E-Book & สื่อการสอนในสาขา</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                {portfolioWorks.filter((w) => w.Department === currentUser.Department).length}{" "}
                <span className="text-xs font-normal text-slate-500">ผลงาน</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ฟอร์มหัวหน้าสาขากรอกข้อมูล */}
            <form
              onSubmit={handleSaveExecutiveForm}
              className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4"
            >
              <h3 className="font-bold text-lg border-b border-slate-100 pb-3 text-slate-900">
                📊 แบบรายงานแผนพัฒนาหลักสูตร ({currentUser.Department})
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ปีการศึกษา (พ.ศ.)
                  </label>
                  <select
                    value={execFormState.Academic_Year}
                    onChange={(e) =>
                      setExecFormState({ ...execFormState, Academic_Year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  >
                    {[2570, 2571, 2572, 2573, 2574].map((y) => (
                      <option key={y} value={y}>
                        พ.ศ. {y}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    สถานะการประเมินหลักสูตร
                  </label>
                  <input
                    type="text"
                    required
                    value={execFormState.Curriculum_Status}
                    onChange={(e) =>
                      setExecFormState({ ...execFormState, Curriculum_Status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    จำนวนบัณฑิตที่คาดว่าจะจบ (คน)
                  </label>
                  <input
                    type="number"
                    required
                    value={execFormState.Total_Graduates}
                    onChange={(e) =>
                      setExecFormState({ ...execFormState, Total_Graduates: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ทิศทางแผนพัฒนาเชิงกลยุทธ์ของสาขาวิชา (2570–2574)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="ระบุจุดเน้นเชิงกลยุทธ์ เช่น การพัฒนา E-Book ครบทุกวิชา หรือการเปิดหลักสูตรใหม่..."
                  value={execFormState.Strategic_Plan_2570_2574}
                  onChange={(e) =>
                    setExecFormState({ ...execFormState, Strategic_Plan_2570_2574: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  งบประมาณและความต้องการสนับสนุนจากคณะ
                </label>
                <input
                  type="text"
                  placeholder="เช่น งบสนับสนุนการผลิตตำรา หรือเชิญอาจารย์พิเศษ..."
                  value={execFormState.Budget_Needs}
                  onChange={(e) =>
                    setExecFormState({ ...execFormState, Budget_Needs: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-colors"
              >
                บันทึกรายงานแผนพัฒนาสาขาวิชา
              </button>
            </form>

            {/* ข้อมูลรายงานเฉพาะสาขาของตนเอง */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-slate-900">
                  📌 รายงานสรุปแผนระดับสาขา (เฉพาะ {currentUser.Department})
                </h3>
                {executiveForms.filter((e) => e.Department === currentUser.Department).length === 0 ? (
                  <div className="text-center py-8 text-slate-400">ยังไม่มีรายงานสรุปที่บันทึกไว้</div>
                ) : (
                  executiveForms
                    .filter((e) => e.Department === currentUser.Department)
                    .map((item) => (
                      <div
                        key={item.Exec_ID}
                        className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-600 text-white">
                            ปีการศึกษา พ.ศ. {item.Academic_Year}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">
                            คะแนนคุณภาพ: {item.Quality_Score} / 5.00 • บัณฑิต {item.Total_Graduates} คน
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          สถานะหลักสูตร: {item.Curriculum_Status}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.Strategic_Plan_2570_2574}
                        </p>
                      </div>
                    ))
                )}
              </div>

              {/* รายชื่อคณาจารย์ในสาขานี้ */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-base text-slate-900">
                  👩‍🏫 คณาจารย์ประจำ{currentUser.Department} ({teachersList.filter((t) => t.program === currentUser.Department).length} ท่าน)
                </h3>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {teachersList
                    .filter((t) => t.program === currentUser.Department)
                    .map((t) => (
                      <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{t.name}</span>
                          <span className="text-slate-500 ml-2">({t.id})</span>
                        </div>
                        <span className="text-emerald-700 font-semibold">
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
          VIEW 4: ระบบสำหรับแอดมิน (ADMIN COMMAND CENTER) - FIXED LEFT SIDEBAR
         ==================================================================== */}
      {activeView === "ADMIN" && (
        <div className="min-h-screen flex bg-slate-100">
          {/* แถบเมนูด้านซ้ายชิดขอบจอ (Fixed Left Sidebar) */}
          <aside className="w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between min-h-screen sticky top-0 left-0 select-none shadow-xl">
            <div>
              <div className="p-5 border-b border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold shadow-md">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight">Admin Command</h2>
                  <p className="text-[11px] text-slate-400">คณะศึกษาศาสตร์</p>
                </div>
              </div>

              <nav className="p-3 space-y-1">
                {[
                  { id: "DASHBOARD", label: "แดชบอร์ดสถิติ Bento", icon: LayoutDashboard },
                  { id: "INSTRUCTORS", label: "ข้อมูลแผนอาจารย์ (2570–2574)", icon: FileText },
                  { id: "PORTFOLIO", label: "จัดการคลังผลงาน & E-Book", icon: FolderKanban },
                  { id: "EXECUTIVES", label: "รายงานหัวหน้าสาขา (12 สาขา)", icon: Building2 },
                  { id: "FACULTY", label: "ทำเนียบคณาจารย์ (67 ท่าน)", icon: GraduationCap },
                  { id: "STAFF", label: "จัดการรหัสและบัญชีผู้ใช้", icon: Users },
                  { id: "SETTINGS", label: "ตั้งค่าระบบและซิงค์ชีต", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminMenu(item.id as typeof adminMenu)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        adminMenu === item.id
                          ? "bg-indigo-600 text-white shadow-sm"
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
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
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

          {/* เนื้อหาหลักของแอดมิน */}
          <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
            {adminMenu === "DASHBOARD" && (
              <>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      Bento Analytics Command Center
                    </span>
                    <h1 className="text-2xl font-bold mt-1 text-slate-900">
                      ภาพรวมสถิติแผนการศึกษา พ.ศ. 2570–2574
                    </h1>
                  </div>

                  {/* ตัวเลือกช่วงเวลา: 2570-2574, ทุก 5 ปี, หรือรายปี */}
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
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      เปรียบเทียบทุกๆ 5 ปี
                    </button>
                    <button
                      onClick={() => setAdminYearMode("SINGLE_YEAR")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        adminYearMode === "SINGLE_YEAR"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      ดูรายปีแยก 12 สาขาวิชา
                    </button>
                    {adminYearMode === "SINGLE_YEAR" && (
                      <select
                        value={adminSelectedYear}
                        onChange={(e) => setAdminSelectedYear(Number(e.target.value))}
                        className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 bg-white"
                      >
                        {[2570, 2571, 2572, 2573, 2574].map((y) => (
                          <option key={y} value={y}>
                            ปี พ.ศ. {y}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* KPI Bento Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">คณาจารย์ในระบบ (12 สาขา)</p>
                    <p className="text-3xl font-extrabold mt-2 text-slate-900">{teachersList.length} ท่าน</p>
                    <p className="text-xs text-emerald-600 mt-1">ดึงตรงจากชีตคุณวุฒิจริง</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">แผนการสอนที่อาจารย์ส่งแล้ว</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-2">
                      {instructorForms.length} รายการ
                    </p>
                    <p className="text-xs text-slate-400 mt-1">ซิงค์เรียลไทม์ 100%</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">ผลงาน E-Book ในคลัง (สาธารณะ)</p>
                    <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                      {portfolioWorks.filter((w) => w.Is_Public).length} / {portfolioWorks.length}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">ไฟล์ PDF และลิงก์การสอน</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">รายงานจากหัวหน้าสาขา</p>
                    <p className="text-3xl font-extrabold text-amber-600 mt-2">
                      {executiveForms.length} ฉบับ
                    </p>
                    <p className="text-xs text-slate-400 mt-1">คะแนนประกันคุณภาพเฉลี่ย 4.76</p>
                  </div>
                </div>

                {/* กราฟแท่ง (Bar Chart) และ กราฟเส้น (Line Chart) สไตล์ Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* กราฟแท่ง */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2 text-slate-900">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
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
                                <span className="text-[10px] font-bold text-indigo-600 mb-0.5">
                                  {d.formsCount}
                                </span>
                                <div
                                  style={{ height: `${hForm}px` }}
                                  className="w-5 sm:w-7 rounded-t-lg bg-indigo-600 transition-all duration-500"
                                  title={`แผนการสอน: ${d.formsCount}`}
                                />
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-bold text-emerald-600 mb-0.5">
                                  {d.worksCount}
                                </span>
                                <div
                                  style={{ height: `${hWork}px` }}
                                  className="w-5 sm:w-7 rounded-t-lg bg-emerald-500 transition-all duration-500"
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

                    <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> ข้อมูลแผนที่อาจารย์กรอก
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> ผลงาน E-Book / สื่อการสอน
                      </span>
                    </div>
                  </div>

                  {/* กราฟเส้นแนวโน้ม (Line Chart) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-base flex items-center gap-2 text-slate-900">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span>กราฟเส้นแนวโน้มการเติบโตของข้อมูล (Line Trend)</span>
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
                                stroke="#4F46E5"
                                strokeWidth="3.5"
                                points={polylinePoints}
                              />
                              {pts.map((p, idx) => (
                                <g key={idx}>
                                  <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="6"
                                    className="fill-white stroke-indigo-600"
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

            {/* เมนูจัดการข้อมูลอาจารย์ */}
            {adminMenu === "INSTRUCTORS" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900">รายการข้อมูลแผน 2570–2574 ของอาจารย์ผู้สอน</h2>
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
                          <td className="py-3 px-2 font-bold text-indigo-600">{f.Academic_Year}</td>
                          <td className="py-3 px-2 font-semibold">
                            {f.Staff_ID} • {f.Full_Name}
                          </td>
                          <td className="py-3 px-2">{f.Department}</td>
                          <td className="py-3 px-2">
                            {f.Course_Code} {f.Course_Name}
                          </td>
                          <td className="py-3 px-2 text-slate-600">{f.Teaching_Method}</td>
                          <td className="py-3 px-2 text-slate-600">{f.Ebook_Planned || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* เมนูจัดการคลัง E-Book */}
            {adminMenu === "PORTFOLIO" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900">จัดการคลังผลงานและสิทธิ์การเผยแพร่สาธารณะ</h2>
                <div className="space-y-3">
                  {portfolioWorks.map((w) => (
                    <div
                      key={w.Work_ID}
                      className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-sm">
                          [{w.Work_Type}] {w.Title} (พ.ศ. {w.Academic_Year})
                        </p>
                        <p className="text-xs text-slate-500">
                          ผู้สอน: {w.Instructor_Name} • {w.Department}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleWorkVisibility(w)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                          w.Is_Public ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {w.Is_Public ? "สาธารณะ (คลิกเพื่อซ่อน)" : "ส่วนตัว (คลิกเพื่อเผยแพร่)"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* เมนูจัดการรายงานหัวหน้าสาขา */}
            {adminMenu === "EXECUTIVES" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900">รายงานสรุปจากหัวหน้าสาขาวิชา (12 สาขา)</h2>
                <div className="space-y-3">
                  {executiveForms.map((e) => (
                    <div key={e.Exec_ID} className="p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm text-indigo-600">
                          {e.Department} (พ.ศ. {e.Academic_Year})
                        </span>
                        <span className="text-xs font-semibold">
                          คะแนนคุณภาพ: {e.Quality_Score} / 5.00 • บัณฑิต {e.Total_Graduates} คน
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{e.Strategic_Plan_2570_2574}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* เมนูทำเนียบคุณวุฒิคณาจารย์ */}
            {adminMenu === "FACULTY" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900">ทำเนียบคุณวุฒิคณาจารย์ คณะศึกษาศาสตร์ (67 ท่าน)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2.5 px-2">รหัส</th>
                        <th className="py-2.5 px-2">ชื่อ-สกุล</th>
                        <th className="py-2.5 px-2">ประจำหลักสูตร</th>
                        <th className="py-2.5 px-2">คุณวุฒิสูงสุด</th>
                        <th className="py-2.5 px-2">สถาบันที่จบ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {teachersList.map((t) => (
                        <tr key={t.id}>
                          <td className="py-2 px-2 font-mono font-bold text-indigo-600">{t.id}</td>
                          <td className="py-2 px-2 font-semibold text-slate-900">{t.name}</td>
                          <td className="py-2 px-2 text-slate-600">{t.program}</td>
                          <td className="py-2 px-2 font-medium text-emerald-700">
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

            {/* จัดการบุคลากร */}
            {adminMenu === "STAFF" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const created: StaffMember = { ...newStaffForm, Is_Default_Pwd: true };
                    setStaffList((prev) => [...prev, created]);
                    postToGAS({
                      action: "upsertStaff",
                      staffId: created.Staff_ID,
                      fullName: created.Full_Name,
                      department: created.Department,
                      role: created.Role,
                      password: created.Password,
                      isDefaultPwd: true,
                    });
                    setNewStaffForm({
                      Staff_ID: "",
                      Full_Name: "",
                      Department: EDUCATION_PROGRAMS[0],
                      Role: "INSTRUCTOR",
                      Password: "123456",
                    });
                    showToast("เพิ่มบุคลากรเรียบร้อยแล้ว");
                  }}
                  className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 space-y-4"
                >
                  <h3 className="font-bold text-base">➕ เพิ่มบุคลากร / รีเซ็ตรหัสผ่าน</h3>
                  <input
                    type="text"
                    required
                    placeholder="รหัสบุคลากร (เช่น EDU-068)"
                    value={newStaffForm.Staff_ID}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, Staff_ID: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    required
                    placeholder="ชื่อ-นามสกุล พร้อมตำแหน่ง"
                    value={newStaffForm.Full_Name}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, Full_Name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                  <select
                    value={newStaffForm.Department}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, Department: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  >
                    {EDUCATION_PROGRAMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newStaffForm.Role}
                    onChange={(e) =>
                      setNewStaffForm({ ...newStaffForm, Role: e.target.value as StaffMember["Role"] })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  >
                    <option value="INSTRUCTOR">อาจารย์ผู้สอน (INSTRUCTOR)</option>
                    <option value="EXECUTIVE">ผู้บริหาร/หัวหน้าสาขา (EXECUTIVE)</option>
                    <option value="ADMIN">แอดมิน (ADMIN)</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="รหัสผ่านเริ่มต้น"
                    value={newStaffForm.Password}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, Password: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-sm"
                  >
                    บันทึกบุคลากร
                  </button>
                </form>

                <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-base">รายชื่อบุคลากรและบัญชีทั้งหมด ({staffList.length} รายการ)</h3>
                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                    {staffList.slice(0, 30).map((s) => (
                      <div key={s.Staff_ID} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-indigo-600">{s.Staff_ID}</span> •{" "}
                          <span className="font-semibold text-slate-800">{s.Full_Name}</span>
                          <span className="text-slate-500 ml-1.5">({s.Department})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{s.Role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ตั้งค่าระบบ */}
            {adminMenu === "SETTINGS" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                <h2 className="text-xl font-bold text-slate-900">ตั้งค่าระบบและซิงค์ฐานข้อมูล Google Sheets</h2>
                <p className="text-sm text-slate-600">
                  ระบบเชื่อมต่อกับ Google Apps Script Web App: <code className="text-xs bg-slate-100 p-1 rounded font-mono break-all">{GAS_API_URL || "Local Cache Mode"}</code>
                </p>
                <button
                  onClick={syncWithGAS}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>ดึงข้อมูลล่าสุดจาก Google Sheets ตอนนี้</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 1: ล็อกอิน (Login Modal) พร้อมปุ่มคลิกเดียวเติมรหัสทดสอบ
         ==================================================================== */}
      {loginModalRole && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700">
                  {loginModalRole} LOGIN
                </span>
                <h3 className="text-xl font-bold mt-1 text-slate-900">
                  {loginModalRole === "INSTRUCTOR"
                    ? "เข้าสู่ระบบสำหรับอาจารย์ผู้สอน"
                    : loginModalRole === "EXECUTIVE"
                    ? "เข้าสู่ระบบสำหรับผู้บริหาร (หัวหน้าสาขา)"
                    : "เข้าสู่ระบบสำหรับแอดมิน"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setLoginModalRole(null);
                  setLoginError("");
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  รหัสบุคลากร (Staff ID)
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น EDU-001, HEAD-01 หรือ ADMIN"
                  value={loginStaffId}
                  onChange={(e) => setLoginStaffId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่าน..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-sm transition-colors shadow-md"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            {/* ปุ่มคลิกเดียวเติมรหัสทดสอบ */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <p className="font-bold text-slate-700">💡 คลิกเพื่อเติมรหัสทดสอบทันที:</p>
              <div className="flex flex-wrap gap-1.5">
                {loginModalRole === "INSTRUCTOR" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("EDU-001");
                        setLoginPassword("123456");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 font-medium"
                    >
                      อาจารย์ EDU-001 (ซอลีฮะห์)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("EDU-002");
                        setLoginPassword("123456");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 font-medium"
                    >
                      อาจารย์ EDU-002 (มะซีดิ)
                    </button>
                  </>
                )}
                {loginModalRole === "EXECUTIVE" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("HEAD-01");
                        setLoginPassword("exec123");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 font-medium"
                    >
                      หน.อิสลามศึกษา (HEAD-01)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("HEAD-02");
                        setLoginPassword("exec123");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 font-medium"
                    >
                      หน.ภาษาอาหรับ (HEAD-02)
                    </button>
                  </>
                )}
                {loginModalRole === "ADMIN" && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoginStaffId("ADMIN");
                      setLoginPassword("admin999");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 font-medium"
                  >
                    แอดมิน ADMIN (รหัส admin999)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: E-Book Interactive Flip Reader Modal
         ==================================================================== */}
      {selectedWorkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                  {selectedWorkModal.Work_Type === "PDF"
                    ? "Interactive E-Book Reader"
                    : "Live Stream / External Link"}
                </span>
                <h3 className="font-bold text-base sm:text-lg mt-0.5 truncate max-w-md sm:max-w-xl">
                  {selectedWorkModal.Title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedWorkModal(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {selectedWorkModal.Work_Type === "PDF" ? (
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-2xl p-4 sm:p-6 border border-slate-200 min-h-[380px] flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-500 font-semibold">
                      <span>ผู้แต่ง: {selectedWorkModal.Instructor_Name} • {selectedWorkModal.Department}</span>
                      <span>หน้าที่ {ebookPage} จาก 3 (ตัวอย่าง E-Book)</span>
                    </div>

                    <div className="my-auto py-6 px-4 sm:px-10 bg-white rounded-xl shadow-inner border border-slate-200/80 min-h-[250px] flex flex-col justify-center">
                      {ebookPage === 1 && (
                        <div className="text-center space-y-3">
                          <BookOpen className="w-12 h-12 text-indigo-600 mx-auto" />
                          <h4 className="text-xl font-bold text-slate-900">{selectedWorkModal.Title}</h4>
                          <p className="text-sm text-slate-600">
                            โดย {selectedWorkModal.Instructor_Name} ({selectedWorkModal.Department})
                          </p>
                          <p className="text-xs text-slate-500 max-w-lg mx-auto">
                            {selectedWorkModal.Description}
                          </p>
                        </div>
                      )}
                      {ebookPage === 2 && (
                        <div className="space-y-3">
                          <h5 className="font-bold text-base text-indigo-600">
                            สาระสำคัญและโครงสร้างเอกสารวิชาการ
                          </h5>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {selectedWorkModal.Description} เอกสารฉบับนี้ถูกแปลงเป็นรูปแบบหนังสืออิเล็กทรอนิกส์ (E-Book)
                            เพื่อให้คณาจารย์ นักศึกษา และบุคคลทั่วไปสามารถนำไปใช้ในการจัดการเรียนรู้และพัฒนาตนเองได้
                          </p>
                          <iframe
                            src={selectedWorkModal.File_Or_Link_URL}
                            className="w-full h-56 rounded-lg border border-slate-200 mt-2"
                            title="PDF Preview"
                          />
                        </div>
                      )}
                      {ebookPage === 3 && (
                        <div className="text-center space-y-3">
                          <Download className="w-12 h-12 text-emerald-600 mx-auto" />
                          <h5 className="font-bold text-base text-slate-900">
                            ต้องการอ่านฉบับเต็มหรือบันทึกเก็บไว้ในอุปกรณ์?
                          </h5>
                          <p className="text-xs text-slate-500">
                            คุณสามารถกดปุ่มดาวน์โหลดไฟล์ PDF ด้านล่างเพื่อนำไปอ่านแบบออฟไลน์ได้ทันที
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <button
                        disabled={ebookPage <= 1}
                        onClick={() => setEbookPage((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" /> หน้าก่อนหน้า
                      </button>
                      <button
                        disabled={ebookPage >= 3}
                        onClick={() => setEbookPage((p) => Math.min(3, p + 1))}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold disabled:opacity-40"
                      >
                        หน้าถัดไป <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>เปิดอ่านเต็มจอ / ดาวน์โหลดไฟล์ PDF</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-700">พรีวิวลิงก์สื่อการสอน / ไลฟ์สดภายนอก</p>
                      <h4 className="font-bold text-lg text-slate-900">{selectedWorkModal.Title}</h4>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedWorkModal.Description}</p>
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 break-all">
                    ลิงก์ปลายทาง: {selectedWorkModal.File_Or_Link_URL}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <a
                      href={selectedWorkModal.File_Or_Link_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm"
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

      {/* ====================================================================
          MODAL 3: โปรไฟล์และคุณวุฒิอาจารย์ (Faculty Qualification Modal)
         ==================================================================== */}
      {selectedTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedTeacherModal.name}</h3>
                  <p className="text-xs font-semibold text-indigo-700 mt-0.5">{selectedTeacherModal.program}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherModal(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>ประวัติและคุณวุฒิการศึกษา (จากฐานข้อมูลคณะศึกษาศาสตร์)</span>
              </h4>

              <div className="space-y-3">
                {selectedTeacherModal.degrees.map((deg, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        {deg.level}
                      </span>
                      {deg.year && <span className="text-slate-400">จบปี พ.ศ. {deg.year}</span>}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{deg.degree} {deg.major ? `(${deg.major})` : ""}</p>
                    <p className="text-xs text-slate-500">{deg.institution}</p>
                  </div>
                ))}
              </div>

              {/* ปุ่มกรองผลงานของอาจารย์ท่านนี้ */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setPublicSearch(selectedTeacherModal.name);
                    setPublicHubTab("EBOOKS");
                    setSelectedTeacherModal(null);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
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