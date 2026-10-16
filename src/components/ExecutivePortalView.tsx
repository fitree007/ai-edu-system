"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Edit3,
  Eye,
  FileSpreadsheet,
  FolderOpen,
  GraduationCap,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import {
  EDUCATION_PROGRAMS,
  SURVEY_YEARS,
  RESEARCH_FUND_OPTIONS,
  RESEARCH_BUDGET_RANGES,
  TARGET_COMMUNITY_OPTIONS,
  EXEC_PROGRAM_LEVEL_OPTIONS,
  EXEC_STUDENT_INTAKE_OPTIONS,
  EXEC_ADMISSION_TYPE_OPTIONS,
  EXEC_SELECTION_CRITERIA_LIST,
  createDefaultExecutiveSurvey,
  type StaffMember,
  type TeacherSurveyPlan,
  type ExecutiveSurveyPlan,
  type PortfolioWork,
} from "@/data/seedData";

interface ExecutivePortalViewProps {
  isDark: boolean;
  isSubmissionOpen: boolean;
  teachers: StaffMember[];
  surveys: TeacherSurveyPlan[];
  executiveSurveys: ExecutiveSurveyPlan[];
  works: PortfolioWork[];
  currentTeacher: StaffMember | null;
  selectedExecDept: string;
  onSelectExecDept: (dept: string) => void;
  onSaveExecutiveSurvey: (updated: ExecutiveSurveyPlan, showNotice?: boolean) => void;
  onAssignDepartmentHead: (dept: string, teacherId: string, positionTitle: string, canViewAll: boolean) => void;
  onSwitchToInstructorMode: (teacherId: string) => void;
  onOpenRepository: () => void;
  onOpenPdfWork: (work: PortfolioWork) => void;
}

export function ExecutivePortalView({
  isDark,
  isSubmissionOpen,
  teachers,
  surveys,
  executiveSurveys,
  works,
  currentTeacher,
  selectedExecDept,
  onSelectExecDept,
  onSaveExecutiveSurvey,
  onAssignDepartmentHead,
  onSwitchToInstructorMode,
  onOpenRepository,
}: ExecutivePortalViewProps) {
  // โหมดการดูแดชบอร์ด: "ALL_FACULTY" (ดูครบทั้ง 12 สาขา) หรือ "SINGLE_DEPT" (ดูเฉพาะสาขาที่เลือก)
  const [dashboardScope, setDashboardScope] = useState<"ALL_FACULTY" | "SINGLE_DEPT">("ALL_FACULTY");

  // Modal สำหรับกรอกแบบสำรวจผู้บริหาร 2570-2574 ในเว็บแอป
  const [isExecSurveyFormOpen, setIsExecSurveyFormOpen] = useState(false);
  const [activeExecTab, setActiveExecTab] = useState<1 | 2 | 3 | 4>(1);

  // Modal สำหรับดูข้อมูลแบบสำรวจผู้บริหารที่กรอกไว้แล้ว
  const [isExecSurveyViewerOpen, setIsExecSurveyViewerOpen] = useState(false);

  // Modal สำหรับจัดการสับเปลี่ยนหัวหน้าสาขาวิชา/ผู้บริหารในอนาคต
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverDept, setHandoverDept] = useState<string>(selectedExecDept || EDUCATION_PROGRAMS[0]);
  const [handoverTeacherId, setHandoverTeacherId] = useState<string>("");
  const [handoverPosition, setHandoverPosition] = useState<string>("หัวหน้าสาขาวิชา");
  const [handoverCanViewAll, setHandoverCanViewAll] = useState<boolean>(true);

  const activeDepartment =
    selectedExecDept ||
    currentTeacher?.Managed_Department ||
    currentTeacher?.Department ||
    EDUCATION_PROGRAMS[0];

  const currentExecSurvey = useMemo(() => {
    const found = executiveSurveys.find((s) => s.Department === activeDepartment);
    return found || createDefaultExecutiveSurvey(activeDepartment, 0, false);
  }, [executiveSurveys, activeDepartment]);

  const [draftExecSurvey, setDraftExecSurvey] = useState<ExecutiveSurveyPlan>(currentExecSurvey);

  const openExecSurveyEditor = (dept?: string) => {
    const targetDept = dept || activeDepartment;
    if (dept && dept !== selectedExecDept) {
      onSelectExecDept(dept);
    }
    const found =
      executiveSurveys.find((s) => s.Department === targetDept) ||
      createDefaultExecutiveSurvey(targetDept, 0, false);
    setDraftExecSurvey(JSON.parse(JSON.stringify(found)));
    setActiveExecTab(1);
    setIsExecSurveyFormOpen(true);
  };

  // เฉพาะรายชื่ออาจารย์ผู้สอน
  const instructorStaff = useMemo(
    () => teachers.filter((t) => t.Role === "INSTRUCTOR"),
    [teachers]
  );

  // หาหัวหน้าสาขาวิชาปัจจุบันของแต่ละสาขา
  const departmentHeadsMap = useMemo(() => {
    const map: Record<string, StaffMember | undefined> = {};
    EDUCATION_PROGRAMS.forEach((prog) => {
      const assigned = instructorStaff.find(
        (t) =>
          t.Is_Executive_Assigned &&
          (t.Managed_Department === prog || t.Department === prog)
      );
      map[prog] = assigned || instructorStaff.find((t) => t.Department === prog);
    });
    return map;
  }, [instructorStaff]);

  // คำนวณสถิติรวมตาม Scope ที่เลือก (ทั้งคณะ 12 สาขา หรือ เฉพาะสาขา)
  const filteredTeachers = useMemo(() => {
    if (dashboardScope === "ALL_FACULTY") return instructorStaff;
    return instructorStaff.filter((t) => t.Department === activeDepartment);
  }, [instructorStaff, dashboardScope, activeDepartment]);

  const filteredTeacherSurveys = useMemo(() => {
    if (dashboardScope === "ALL_FACULTY") return surveys;
    return surveys.filter((s) => s.Department === activeDepartment);
  }, [surveys, dashboardScope, activeDepartment]);

  const filteredExecSurveys = useMemo(() => {
    if (dashboardScope === "ALL_FACULTY") return executiveSurveys;
    return executiveSurveys.filter((s) => s.Department === activeDepartment);
  }, [executiveSurveys, dashboardScope, activeDepartment]);

  const totalResearchPlannedByTeachers = useMemo(() => {
    return filteredTeacherSurveys.reduce(
      (acc, s) =>
        acc +
        (Number(s.research_classroom) || 0) +
        (Number(s.research_education) || 0) +
        (Number(s.research_development) || 0) +
        (Number(s.research_other) || 0),
      0
    );
  }, [filteredTeacherSurveys]);

  const totalStudentIntake5Years = useMemo(() => {
    return filteredExecSurveys.reduce((acc, s) => {
      const sum = SURVEY_YEARS.reduce(
        (yAcc, y) => yAcc + (Number(s.student_intake_targets?.[String(y)]) || 0),
        0
      );
      return acc + sum;
    }, 0);
  }, [filteredExecSurveys]);

  const totalNewStaff5Years = useMemo(() => {
    return filteredExecSurveys.reduce((acc, s) => {
      const sum = SURVEY_YEARS.reduce(
        (yAcc, y) => yAcc + (Number(s.staff_recruitment_total?.[String(y)]) || 0),
        0
      );
      return acc + sum;
    }, 0);
  }, [filteredExecSurveys]);

  const submittedTeacherCount = useMemo(
    () => filteredTeacherSurveys.filter((s) => s.Is_Submitted).length,
    [filteredTeacherSurveys]
  );

  const submittedExecCount = useMemo(
    () => executiveSurveys.filter((s) => s.Is_Submitted).length,
    [executiveSurveys]
  );

  const handleSaveDraftExec = (markSubmitted: boolean) => {
    const headTeacher = departmentHeadsMap[draftExecSurvey.Department];
    const finalPlan: ExecutiveSurveyPlan = {
      ...draftExecSurvey,
      Updated_By_Staff_ID:
        currentTeacher?.Staff_ID ||
        headTeacher?.Staff_ID ||
        draftExecSurvey.Updated_By_Staff_ID,
      Updated_By_Name:
        currentTeacher?.Full_Name ||
        headTeacher?.Full_Name ||
        draftExecSurvey.Updated_By_Name,
      Is_Submitted: markSubmitted ? true : draftExecSurvey.Is_Submitted,
      Updated_At: new Date().toISOString().split("T")[0],
    };
    onSaveExecutiveSurvey(finalPlan, true);
    if (markSubmitted) {
      setIsExecSurveyFormOpen(false);
    }
  };

  const applySameValueAllYears = (
    field:
      | "student_intake_targets"
      | "academic_services_count"
      | "staff_recruitment_total"
      | "staff_recruitment_master"
      | "staff_recruitment_doctoral"
      | "staff_recruitment_adjunct",
    val: number
  ) => {
    const nextMap: { [k: string]: number } = {};
    SURVEY_YEARS.forEach((y) => {
      nextMap[String(y)] = val;
    });
    setDraftExecSurvey((prev) => ({
      ...prev,
      [field]: nextMap,
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero & Mode Switcher (รองรับการสลับโหมดผู้บริหาร <-> โหมดอาจารย์ผู้สอน และการสับเปลี่ยนหัวหน้าสาขา) */}
      <div
        className={`rounded-3xl p-5 sm:p-7 border shadow-xl relative overflow-hidden ${
          isDark
            ? "bg-gradient-to-br from-[#231347] via-[#170D30] to-[#110924] border-purple-500/30 text-white"
            : "bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 border-purple-700 text-white"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-purple-200">
              <Building2 className="w-3.5 h-3.5" />
              <span>ระบบผู้บริหารและหัวหน้าสาขาวิชา • คณะศึกษาศาสตร์</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              แดชบอร์ดยุทธศาสตร์ & แผนพัฒนาประจำปีการศึกษา 2570–2574
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/85">
              ผู้รับผิดชอบสาขาปัจจุบัน ({activeDepartment}):{" "}
              <span className="font-bold text-white">
                {departmentHeadsMap[activeDepartment]?.Full_Name || "ผู้บริหารคณะศึกษาศาสตร์"}
              </span>{" "}
              ({departmentHeadsMap[activeDepartment]?.Executive_Position || "หัวหน้าสาขาวิชา"})
            </p>
          </div>

          {/* ปุ่มสลับโหมดสำหรับกรณีอาจารย์เป็นหัวหน้าสาขา/ผู้บริหาร หรือต้องการสับเปลี่ยนตำแหน่งในอนาคต */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setHandoverDept(activeDepartment);
                const currHead = departmentHeadsMap[activeDepartment];
                setHandoverTeacherId(
                  currHead?.Staff_ID || instructorStaff[0]?.Staff_ID || ""
                );
                setHandoverPosition(currHead?.Executive_Position || "หัวหน้าสาขาวิชา");
                setHandoverCanViewAll(currHead?.Can_View_All_Departments ?? true);
                setIsHandoverModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4 text-amber-300 shrink-0" />
              <span>สับเปลี่ยนหัวหน้าสาขา / ผู้บริหาร</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const targetTeacher =
                  (currentTeacher?.Role === "INSTRUCTOR" ? currentTeacher : null) ||
                  departmentHeadsMap[activeDepartment] ||
                  instructorStaff[0];
                if (targetTeacher) {
                  onSwitchToInstructorMode(targetTeacher.Staff_ID);
                }
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <GraduationCap className="w-4 h-4 text-purple-700 shrink-0" />
              <span>สลับไปโหมดอาจารย์ผู้สอน</span>
            </button>
          </div>
        </div>

        {/* แถบเลือกขอบเขตการดูข้อมูล (ดูภาพรวมครบทั้ง 12 สาขา หรือเจาะจงรายสาขา) */}
        <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDashboardScope("ALL_FACULTY")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                dashboardScope === "ALL_FACULTY"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>ดูแดชบอร์ดรวมทั้งคณะ (12 สาขาวิชา)</span>
            </button>
            <button
              type="button"
              onClick={() => setDashboardScope("SINGLE_DEPT")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                dashboardScope === "SINGLE_DEPT"
                  ? "bg-amber-400 text-slate-950 shadow-md"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>ดูเฉพาะสาขาวิชา</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-200 whitespace-nowrap font-semibold">
              เลือกสาขาวิชา:
            </span>
            <select
              value={activeDepartment}
              onChange={(e) => onSelectExecDept(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black/35 border border-white/25 text-white text-xs font-bold focus:outline-none min-w-[200px]"
            >
              {EDUCATION_PROGRAMS.map((prog) => (
                <option key={prog} value={prog} className="bg-slate-900 text-white">
                  {prog}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. การ์ดปุ่มกรอก "แบบสำรวจข้อมูลเบื้องต้นเพื่อจัดทำแผนประจำปีการศึกษา 2570-2574 (แบบสำรวจผู้บริหาร)" ในเว็บแอปทันที */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border shadow-sm transition-all ${
          isDark
            ? "bg-[#150D2A]/90 border-white/10 text-white"
            : "bg-white border-slate-200/90 text-slate-900"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                  currentExecSurvey.Is_Submitted
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {currentExecSurvey.Is_Submitted
                    ? `ส่งแบบสำรวจผู้บริหารแล้ว (${activeDepartment})`
                    : `รอการยืนยันแบบสำรวจผู้บริหาร (${activeDepartment})`}
                </span>
              </span>
              <span className="text-xs opacity-65">
                อัปเดตล่าสุด: {currentExecSurvey.Updated_At} • ความก้าวหน้าทั้งคณะ {submittedExecCount}/12 สาขา
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold">
              แบบสำรวจข้อมูลเบื้องต้นเพื่อจัดทำแผนประจำปีการศึกษา 2570–2574 คณะศึกษาศาสตร์ (แบบสำรวจผู้บริหาร)
            </h3>
            <p className="text-xs opacity-75">
              กรอกในเว็บแอปได้โดยตรง ออกแบบให้กดเลือกตัวเลขง่ายทั้งบนมือถือและคอมพิวเตอร์ (แผนรับนักศึกษาใหม่, แผนงานวิจัย, บริการวิชาการ และแผนอัตรากำลังสายวิชาการ)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsExecSurveyViewerOpen(true)}
              className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
                isDark
                  ? "border-white/15 bg-white/5 hover:bg-white/10 text-white"
                  : "border-slate-200 bg-slate-100 hover:bg-slate-200/70 text-slate-800"
              }`}
            >
              <Eye className="w-4 h-4 text-purple-500 shrink-0" />
              <span>ดูข้อมูลที่กรอกไว้แล้ว</span>
            </button>

            {isSubmissionOpen ? (
              <button
                type="button"
                onClick={() => openExecSurveyEditor(activeDepartment)}
                className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4 shrink-0" />
                <span>
                  {currentExecSurvey.Is_Submitted
                    ? "แก้ไขแบบสำรวจผู้บริหาร (ในเว็บแอป)"
                    : "กรอกแบบสำรวจผู้บริหาร 2570–2574"}
                </span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 shrink-0" />
                <span>แอดมินปิดรับการแก้ไขชั่วคราว (ดูข้อมูลได้)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bento KPI Summary (4 การ์ดสะอาดตา ไม่รก) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`rounded-3xl p-4 sm:p-5 border ${
            isDark ? "bg-[#150D2A]/85 border-white/10" : "bg-white border-slate-200/90"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-70">คณาจารย์ที่ยืนยันข้อมูล</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-300">
            {submittedTeacherCount}
            <span className="text-sm font-semibold opacity-60"> / {filteredTeachers.length} ท่าน</span>
          </p>
          <p className="text-[11px] opacity-65 mt-1">
            {dashboardScope === "ALL_FACULTY" ? "รวมทั้ง 12 สาขาวิชา" : activeDepartment}
          </p>
        </div>

        <div
          className={`rounded-3xl p-4 sm:p-5 border ${
            isDark ? "bg-[#150D2A]/85 border-white/10" : "bg-white border-slate-200/90"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-70">เป้าหมายรับนักศึกษาใหม่ (5 ปี)</span>
            <GraduationCap className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {totalStudentIntake5Years.toLocaleString()}
            <span className="text-sm font-semibold opacity-60"> คน</span>
          </p>
          <p className="text-[11px] opacity-65 mt-1">แผนผู้บริหาร พ.ศ. 2570–2574</p>
        </div>

        <div
          className={`rounded-3xl p-4 sm:p-5 border ${
            isDark ? "bg-[#150D2A]/85 border-white/10" : "bg-white border-slate-200/90"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-70">แผนผลิตงานวิจัยอาจารย์</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {totalResearchPlannedByTeachers.toLocaleString()}
            <span className="text-sm font-semibold opacity-60"> เรื่อง</span>
          </p>
          <p className="text-[11px] opacity-65 mt-1">รวมวิจัยในชั้นเรียน/ศึกษา/พัฒนา</p>
        </div>

        <div
          className={`rounded-3xl p-4 sm:p-5 border ${
            isDark ? "bg-[#150D2A]/85 border-white/10" : "bg-white border-slate-200/90"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold opacity-70">แผนรับบุคลากรเพิ่ม (5 ปี)</span>
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {totalNewStaff5Years}
            <span className="text-sm font-semibold opacity-60"> อัตรา</span>
          </p>
          <p className="text-[11px] opacity-65 mt-1">สายวิชาการ ป.โท / ป.เอก</p>
        </div>
      </div>

      {/* 4. ตารางภาพรวมทั้ง 12 สาขาวิชา + ปุ่มกดกรอก/ดูรายสาขา + รายชื่อหัวหน้าสาขาปัจจุบัน */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border ${
          isDark ? "bg-[#150D2A]/85 border-white/10" : "bg-white border-slate-200/90"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <span>สถานะแผนยุทธศาสตร์และหัวหน้าสาขาวิชาทั้ง 12 สาขา</span>
            </h3>
            <p className="text-xs opacity-70">
              คลิกที่สาขาวิชาเพื่อดูข้อมูลเจาะลึก หรือกดกรอกแบบสำรวจผู้บริหารของสาขานั้นได้ทันที
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRepository}
            className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FolderOpen className="w-4 h-4" />
            <span>เปิดคลังข้อมูลคณะ ({works.filter((w) => w.Is_Public).length} ผลงาน)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {EDUCATION_PROGRAMS.map((prog) => {
            const execPlan =
              executiveSurveys.find((s) => s.Department === prog) ||
              createDefaultExecutiveSurvey(prog, 0, false);
            const deptTeachers = instructorStaff.filter((t) => t.Department === prog);
            const deptSurveys = surveys.filter((s) => s.Department === prog);
            const deptSubmitted = deptSurveys.filter((s) => s.Is_Submitted).length;
            const headMember = departmentHeadsMap[prog];
            const isSelected = activeDepartment === prog;

            return (
              <div
                key={prog}
                onClick={() => onSelectExecDept(prog)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? isDark
                      ? "bg-purple-950/45 border-purple-400 shadow-md"
                      : "bg-purple-50/90 border-purple-500 shadow-xs"
                    : isDark
                    ? "bg-white/[0.02] border-white/10 hover:border-white/25"
                    : "bg-slate-50/70 border-slate-200/80 hover:border-purple-300"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs sm:text-sm leading-snug">{prog}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        execPlan.Is_Submitted
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-300"
                      }`}
                    >
                      {execPlan.Is_Submitted ? "ส่งแผนสาขาแล้ว" : "ร่างแผนสาขา"}
                    </span>
                  </div>

                  <p className="text-[11px] opacity-75">
                    ผู้รับผิดชอบ:{" "}
                    <span className="font-bold">
                      {headMember ? headMember.Full_Name : "ยังไม่ระบุ"}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] opacity-80">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 font-semibold">
                      อาจารย์ยืนยัน {deptSubmitted}/{deptTeachers.length} ท่าน
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 font-semibold">
                      รับ นศ. {execPlan.student_intake_targets?.["2570"] || 60} คน/ปี
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-white/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExecDept(prog);
                      setIsExecSurveyViewerOpen(true);
                    }}
                    className="text-[11px] font-bold text-purple-600 dark:text-purple-300 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูแผนที่กรอก</span>
                  </button>

                  {isSubmissionOpen && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openExecSurveyEditor(prog);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>กรอกแผนสาขา</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================
          MODAL 1: กรอกแบบสำรวจผู้บริหาร 2570–2574 (In-App Easy Form)
         ========================================================= */}
      {isExecSurveyFormOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain"
          onClick={() => setIsExecSurveyFormOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border shadow-2xl overflow-hidden overscroll-contain ${
              isDark
                ? "bg-[#181030] border-white/15 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white text-[11px] font-bold">
                    แบบสำรวจผู้บริหาร 2570–2574
                  </span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-300">
                    {draftExecSurvey.Department}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold mt-1">
                  แบบสำรวจข้อมูลเบื้องต้นเพื่อจัดทำแผนประจำปีการศึกษา 2570–2574 คณะศึกษาศาสตร์
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExecSurveyFormOpen(false)}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Tabs (4 หมวด กดสลับง่ายมากบนมือถือ) */}
            <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200/70 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-1.5 shrink-0 bg-purple-500/5">
              {[
                { step: 1, label: "1. รับนักศึกษาใหม่" },
                { step: 2, label: "2. แผนงานวิจัยสาขา" },
                { step: 3, label: "3. บริการวิชาการ" },
                { step: 4, label: "4. อัตรากำลัง & ข้อเสนอแนะ" },
              ].map((t) => (
                <button
                  key={t.step}
                  type="button"
                  onClick={() => setActiveExecTab(t.step as 1 | 2 | 3 | 4)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                    activeExecTab === t.step
                      ? "bg-purple-600 text-white shadow-xs"
                      : isDark
                      ? "bg-white/5 text-purple-200 hover:bg-white/10"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/70"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Form Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs sm:text-sm">
              {/* TAB 1: ข้อมูลทั่วไป & แผนรับนักศึกษาใหม่ */}
              {activeExecTab === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1.5">
                        หน่วยงาน / สาขาวิชา
                      </label>
                      <select
                        value={draftExecSurvey.Department}
                        onChange={(e) => {
                          const newDept = e.target.value;
                          const existing =
                            executiveSurveys.find((s) => s.Department === newDept) ||
                            createDefaultExecutiveSurvey(newDept, 0, false);
                          setDraftExecSurvey(JSON.parse(JSON.stringify(existing)));
                        }}
                        className={`w-full px-3.5 h-11 rounded-xl border font-bold ${
                          isDark
                            ? "bg-[#0D081D] border-white/15 text-white"
                            : "bg-slate-50 border-slate-300"
                        }`}
                      >
                        {EDUCATION_PROGRAMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1.5">
                        ระดับการศึกษาที่เปิดสอน
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {EXEC_PROGRAM_LEVEL_OPTIONS.map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() =>
                              setDraftExecSurvey((prev) => ({
                                ...prev,
                                Program_Level: lvl,
                              }))
                            }
                            className={`px-3 py-2 rounded-xl font-bold text-xs border transition-all ${
                              draftExecSurvey.Program_Level === lvl
                                ? "bg-purple-600 text-white border-purple-500"
                                : isDark
                                ? "bg-white/5 border-white/10"
                                : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 1.1 จำนวนรับนักศึกษาใหม่ในอีก 5 ปีข้างหน้า (2570-2574) */}
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold">
                          1. จำนวนรับนักศึกษาใหม่ในอีก 5 ปีข้างหน้า (พ.ศ. 2570–2574)
                        </h4>
                        <p className="text-xs opacity-70">
                          แตะเลือกจำนวนนักศึกษาที่คาดว่าจะรับในแต่ละปี (หรือกดปุ่มตั้งค่าเท่ากันทุกปีด้านขวา)
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[11px] opacity-70 mr-1">ตั้งค่าเท่ากันทุกปี:</span>
                        {[30, 45, 60, 90, 150].map((quickVal) => (
                          <button
                            key={quickVal}
                            type="button"
                            onClick={() =>
                              applySameValueAllYears("student_intake_targets", quickVal)
                            }
                            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-600 hover:text-white text-purple-600 dark:text-purple-300 font-bold text-xs transition-all"
                          >
                            {quickVal} คน
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {SURVEY_YEARS.map((y) => {
                        const yKey = String(y);
                        const val = draftExecSurvey.student_intake_targets?.[yKey] ?? 60;
                        return (
                          <div
                            key={yKey}
                            className={`p-3 rounded-xl border ${
                              isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                            }`}
                          >
                            <label className="block text-xs font-bold opacity-75 mb-1">
                              ปีการศึกษา {yKey}
                            </label>
                            <select
                              value={val}
                              onChange={(e) =>
                                setDraftExecSurvey((prev) => ({
                                  ...prev,
                                  student_intake_targets: {
                                    ...prev.student_intake_targets,
                                    [yKey]: Number(e.target.value),
                                  },
                                }))
                              }
                              className={`w-full px-2.5 h-10 rounded-lg border font-bold ${
                                isDark
                                  ? "bg-[#181030] border-white/15 text-white"
                                  : "bg-slate-50 border-slate-300"
                              }`}
                            >
                              {EXEC_STUDENT_INTAKE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt} คน
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1.2 จำนวนรับนักศึกษาใหม่แยกตามประเภทการรับ */}
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold">
                        2. จำนวนการรับนักศึกษาใหม่ แยกตามประเภทการรับ (ต่อปีการศึกษา)
                      </h4>
                      <p className="text-xs opacity-70">
                        ระบุเป้าหมายการรับแยกตามรอบ โควตา, Portfolio, รอบปกติ และอื่น ๆ
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { key: "quota" as const, label: "ประเภทโควตา (Quota)" },
                        { key: "portfolio" as const, label: "ประเภท Portfolio" },
                        { key: "regular" as const, label: "ประเภทปกติ (Regular)" },
                        { key: "other" as const, label: "อื่น ๆ" },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className={`p-3 rounded-xl border ${
                            isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                          }`}
                        >
                          <label className="block text-xs font-bold mb-1.5">
                            {item.label}
                          </label>
                          <select
                            value={draftExecSurvey.student_intake_by_type[item.key]}
                            onChange={(e) =>
                              setDraftExecSurvey((prev) => ({
                                ...prev,
                                student_intake_by_type: {
                                  ...prev.student_intake_by_type,
                                  [item.key]: Number(e.target.value),
                                },
                              }))
                            }
                            className={`w-full px-2.5 h-10 rounded-lg border font-bold ${
                              isDark
                                ? "bg-[#181030] border-white/15 text-white"
                                : "bg-slate-50 border-slate-300"
                            }`}
                          >
                            {EXEC_ADMISSION_TYPE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt} คน
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: แผนงานวิจัยของสาขาวิชา */}
              {activeExecTab === 2 && (
                <div className="space-y-5">
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <h4 className="font-bold">
                      1. จำนวนงานวิจัยที่สาขาวิชาคาดว่าจะดำเนินการในระหว่างปีการศึกษา 2570–2574
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "research_classroom" as const, label: "โครงการวิจัยในชั้นเรียน" },
                        { key: "research_education" as const, label: "โครงการวิจัยเพื่อการศึกษา" },
                        { key: "research_development" as const, label: "โครงการวิจัยเพื่อการพัฒนา" },
                        { key: "research_other" as const, label: "อื่น ๆ" },
                      ].map((r) => (
                        <div
                          key={r.key}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 ${
                            isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                          }`}
                        >
                          <span className="font-bold text-xs">{r.label}</span>
                          <div className="flex items-center gap-1">
                            {[0, 1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() =>
                                  setDraftExecSurvey((prev) => ({
                                    ...prev,
                                    [r.key]: n,
                                  }))
                                }
                                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all ${
                                  draftExecSurvey[r.key] === n
                                    ? "bg-purple-600 text-white"
                                    : isDark
                                    ? "bg-white/5 hover:bg-white/10"
                                    : "bg-slate-100 hover:bg-slate-200"
                                }`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* งบประมาณวิจัยรายปี 2570-2574 */}
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <h4 className="font-bold">
                      2. งบประมาณที่คาดว่าจะได้รับจากโครงการวิจัย (พ.ศ. 2570–2574)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                      {SURVEY_YEARS.map((y) => {
                        const yKey = String(y);
                        return (
                          <div
                            key={yKey}
                            className={`p-3 rounded-xl border ${
                              isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                            }`}
                          >
                            <label className="block text-xs font-bold mb-1">พ.ศ. {yKey}</label>
                            <select
                              value={draftExecSurvey.research_budgets[yKey] || RESEARCH_BUDGET_RANGES[1]}
                              onChange={(e) =>
                                setDraftExecSurvey((prev) => ({
                                  ...prev,
                                  research_budgets: {
                                    ...prev.research_budgets,
                                    [yKey]: e.target.value,
                                  },
                                }))
                              }
                              className={`w-full px-2 h-10 rounded-lg border text-xs font-bold ${
                                isDark
                                  ? "bg-[#181030] border-white/15 text-white"
                                  : "bg-slate-50 border-slate-300"
                              }`}
                            >
                              {RESEARCH_BUDGET_RANGES.map((b) => (
                                <option key={b} value={b}>
                                  {b} บาท
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* แหล่งทุนวิจัย 11 แหล่ง */}
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <h4 className="font-bold">
                      3. แหล่งทุนที่คาดว่าจะเสนอขอทุนวิจัยระหว่างปีการศึกษา 2570–2574 (แตะเลือกปี)
                    </h4>
                    <div className="space-y-2">
                      {RESEARCH_FUND_OPTIONS.map((source) => {
                        const selectedYears =
                          draftExecSurvey.research_funding_sources[source] || [];
                        return (
                          <div
                            key={source}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                            }`}
                          >
                            <span className="text-xs font-semibold">{source}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {SURVEY_YEARS.map((yr) => {
                                const active = selectedYears.includes(yr);
                                return (
                                  <button
                                    key={yr}
                                    type="button"
                                    onClick={() => {
                                      const next = active
                                        ? selectedYears.filter((x) => x !== yr)
                                        : [...selectedYears, yr].sort();
                                      setDraftExecSurvey((prev) => ({
                                        ...prev,
                                        research_funding_sources: {
                                          ...prev.research_funding_sources,
                                          [source]: next,
                                        },
                                      }));
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                      active
                                        ? "bg-purple-600 text-white"
                                        : isDark
                                        ? "bg-white/5 text-purple-200/70"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {yr}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: แผนบริการวิชาการ & เกณฑ์การคัดเลือกชุมชน 10 ข้อ */}
              {activeExecTab === 3 && (
                <div className="space-y-5">
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold">
                        1. จำนวนกิจกรรมบริการวิชาการที่คาดว่าจะดำเนินการ (พ.ศ. 2570–2574)
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] opacity-70">ตั้งค่าทุกปี:</span>
                        {[2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              applySameValueAllYears("academic_services_count", n)
                            }
                            className="px-2 py-1 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold text-xs"
                          >
                            {n} โครงการ
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {SURVEY_YEARS.map((y) => {
                        const yKey = String(y);
                        const val = draftExecSurvey.academic_services_count[yKey] ?? 2;
                        return (
                          <div
                            key={yKey}
                            className={`p-3 rounded-xl border ${
                              isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                            }`}
                          >
                            <label className="block text-xs font-bold mb-1">พ.ศ. {yKey}</label>
                            <select
                              value={val}
                              onChange={(e) =>
                                setDraftExecSurvey((prev) => ({
                                  ...prev,
                                  academic_services_count: {
                                    ...prev.academic_services_count,
                                    [yKey]: Number(e.target.value),
                                  },
                                }))
                              }
                              className={`w-full px-2.5 h-10 rounded-lg border font-bold ${
                                isDark
                                  ? "bg-[#181030] border-white/15 text-white"
                                  : "bg-slate-50 border-slate-300"
                              }`}
                            >
                              {[0, 1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                <option key={n} value={n}>
                                  {n} โครงการ
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ชุมชนเป้าหมาย */}
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <h4 className="font-bold">
                      2. ชุมชนหรือหน่วยงานเป้าหมายบริการวิชาการ (แตะเลือกปี 2570–2574)
                    </h4>
                    <div className="space-y-2">
                      {TARGET_COMMUNITY_OPTIONS.map((comm) => {
                        const selectedYears =
                          draftExecSurvey.target_communities[comm] || [];
                        return (
                          <div
                            key={comm}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                            }`}
                          >
                            <span className="text-xs font-semibold">{comm}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {SURVEY_YEARS.map((yr) => {
                                const active = selectedYears.includes(yr);
                                return (
                                  <button
                                    key={yr}
                                    type="button"
                                    onClick={() => {
                                      const next = active
                                        ? selectedYears.filter((x) => x !== yr)
                                        : [...selectedYears, yr].sort();
                                      setDraftExecSurvey((prev) => ({
                                        ...prev,
                                        target_communities: {
                                          ...prev.target_communities,
                                          [comm]: next,
                                        },
                                      }));
                                    }}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                      active
                                        ? "bg-purple-600 text-white"
                                        : isDark
                                        ? "bg-white/5 text-purple-200/70"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {yr}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* เกณฑ์คัดเลือกชุมชน 10 ข้อ */}
                  <div
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <h4 className="font-bold">
                      3. ค่าน้ำหนักเกณฑ์การคัดเลือกชุมชนหรือหน่วยงานบริการวิชาการ (10%–100%)
                    </h4>
                    <div className="space-y-2">
                      {EXEC_SELECTION_CRITERIA_LIST.map((crit, idx) => {
                        const currentWeight =
                          draftExecSurvey.selection_criteria_weights?.[crit] || "80%";
                        return (
                          <div
                            key={crit}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                              isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                            }`}
                          >
                            <span className="text-xs font-semibold">
                              {idx + 1}. {crit}
                            </span>
                            <select
                              value={currentWeight}
                              onChange={(e) =>
                                setDraftExecSurvey((prev) => ({
                                  ...prev,
                                  selection_criteria_weights: {
                                    ...prev.selection_criteria_weights,
                                    [crit]: e.target.value,
                                  },
                                }))
                              }
                              className={`px-3 h-9 rounded-lg border text-xs font-bold shrink-0 ${
                                isDark
                                  ? "bg-[#181030] border-white/15 text-white"
                                  : "bg-slate-50 border-slate-300"
                              }`}
                            >
                              {[
                                "10%",
                                "20%",
                                "30%",
                                "40%",
                                "50%",
                                "60%",
                                "70%",
                                "80%",
                                "90%",
                                "100%",
                              ].map((pct) => (
                                <option key={pct} value={pct}>
                                  ความสำคัญ {pct}
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

              {/* TAB 4: แผนอัตรากำลังสายวิชาการ (2570-2574) & ข้อเสนอแนะ */}
              {activeExecTab === 4 && (
                <div className="space-y-5">
                  {[
                    {
                      field: "staff_recruitment_total" as const,
                      title: "1. จำนวนบุคลากรสายวิชาการที่คาดว่าจะรับเพิ่มรวม (2570–2574)",
                    },
                    {
                      field: "staff_recruitment_master" as const,
                      title: "2. จำนวนอาจารย์คุณวุฒิปริญญาโทที่ต้องการรับเพิ่ม (2570–2574)",
                    },
                    {
                      field: "staff_recruitment_doctoral" as const,
                      title: "3. จำนวนอาจารย์คุณวุฒิปริญญาเอกที่ต้องการรับเพิ่ม (2570–2574)",
                    },
                    {
                      field: "staff_recruitment_adjunct" as const,
                      title: "4. จำนวนอาจารย์พิเศษที่คาดว่าจะเชิญสอนในแต่ละปี (2570–2574)",
                    },
                  ].map((group) => (
                    <div
                      key={group.field}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        isDark
                          ? "bg-white/[0.03] border-white/10"
                          : "bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-bold text-xs sm:text-sm">{group.title}</h4>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] opacity-70">ตั้งค่าทุกปี:</span>
                          {[0, 1, 2, 3].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => applySameValueAllYears(group.field, n)}
                              className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold text-[11px]"
                            >
                              {n} อัตรา
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {SURVEY_YEARS.map((y) => {
                          const yKey = String(y);
                          const val = draftExecSurvey[group.field]?.[yKey] ?? 0;
                          return (
                            <div
                              key={yKey}
                              className={`p-2.5 rounded-xl border ${
                                isDark
                                  ? "bg-[#0D081D] border-white/10"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              <label className="block text-[11px] font-bold opacity-75 mb-1">
                                พ.ศ. {yKey}
                              </label>
                              <select
                                value={val}
                                onChange={(e) =>
                                  setDraftExecSurvey((prev) => ({
                                    ...prev,
                                    [group.field]: {
                                      ...prev[group.field],
                                      [yKey]: Number(e.target.value),
                                    },
                                  }))
                                }
                                className={`w-full px-2 h-9 rounded-lg border font-bold text-xs ${
                                  isDark
                                    ? "bg-[#181030] border-white/15 text-white"
                                    : "bg-slate-50 border-slate-300"
                                }`}
                              >
                                {[0, 1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                                  <option key={n} value={n}>
                                    {n} อัตรา
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* ข้อเสนอแนะ */}
                  <div
                    className={`p-4 rounded-2xl border space-y-2 ${
                      isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <label className="block font-bold">
                      5. ข้อเสนอแนะเพิ่มเติมเพื่อการจัดทำแผนยุทธศาสตร์คณะศึกษาศาสตร์ (2570–2574)
                    </label>
                    <textarea
                      rows={3}
                      value={draftExecSurvey.suggestions}
                      onChange={(e) =>
                        setDraftExecSurvey((prev) => ({
                          ...prev,
                          suggestions: e.target.value,
                        }))
                      }
                      placeholder="ระบุข้อเสนอแนะด้านหลักสูตร งานวิจัย บริการวิชาการ หรือการพัฒนาบุคลากร..."
                      className={`w-full p-3 rounded-xl border ${
                        isDark
                          ? "bg-[#0D081D] border-white/15 text-white"
                          : "bg-white border-slate-300"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3.5 border-t border-slate-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0 bg-purple-500/5">
              <div className="flex items-center gap-1.5">
                {activeExecTab > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveExecTab((prev) => (prev - 1) as 1 | 2 | 3 | 4)
                    }
                    className="px-3.5 py-2 rounded-xl border border-purple-500/30 text-xs font-bold"
                  >
                    ย้อนกลับ
                  </button>
                )}
                {activeExecTab < 4 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveExecTab((prev) => (prev + 1) as 1 | 2 | 3 | 4)
                    }
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-300 text-xs font-bold"
                  >
                    ถัดไป (หมวดที่ {activeExecTab + 1})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveDraftExec(false)}
                  className="px-4 py-2.5 rounded-xl border border-purple-500/40 text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกร่าง</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDraftExec(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกและยืนยันแผนผู้บริหาร</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: ดูข้อมูลแบบสำรวจผู้บริหารที่กรอกไว้แล้ว (Clean Summary Viewer)
         ========================================================= */}
      {isExecSurveyViewerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
          onClick={() => setIsExecSurveyViewerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border shadow-2xl overflow-hidden overscroll-contain ${
              isDark
                ? "bg-[#181030] border-white/15 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="px-5 py-4 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-500">
                  ข้อมูลที่บันทึกไว้ในระบบ • อัปเดต {currentExecSurvey.Updated_At}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold">
                  สรุปแผนผู้บริหาร 2570–2574 ({currentExecSurvey.Department})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExecSurveyViewerOpen(false)}
                className="p-2 rounded-xl bg-red-500/10 text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              >
                <h4 className="font-bold text-purple-500 mb-2">
                  1. เป้าหมายการรับนักศึกษาใหม่ (พ.ศ. 2570–2574) • ระดับ{currentExecSurvey.Program_Level}
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {SURVEY_YEARS.map((y) => (
                    <div
                      key={y}
                      className={`p-2.5 rounded-xl border ${
                        isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="text-[11px] opacity-65">พ.ศ. {y}</div>
                      <div className="text-base font-black text-emerald-500">
                        {currentExecSurvey.student_intake_targets[String(y)] || 0} คน
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 font-bold">
                    โควตา: {currentExecSurvey.student_intake_by_type.quota} คน
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 font-bold">
                    Portfolio: {currentExecSurvey.student_intake_by_type.portfolio} คน
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 font-bold">
                    รอบปกติ: {currentExecSurvey.student_intake_by_type.regular} คน
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 font-bold">
                    อื่น ๆ: {currentExecSurvey.student_intake_by_type.other} คน
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              >
                <h4 className="font-bold text-purple-500 mb-2">
                  2. เป้าหมายงานวิจัยและบริการวิชาการของสาขาวิชา (2570–2574)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <div className="p-2.5 rounded-xl border border-purple-500/20">
                    <div className="text-[11px] opacity-70">วิจัยในชั้นเรียน</div>
                    <div className="font-black text-sm">{currentExecSurvey.research_classroom} เรื่อง</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-purple-500/20">
                    <div className="text-[11px] opacity-70">วิจัยเพื่อการศึกษา</div>
                    <div className="font-black text-sm">{currentExecSurvey.research_education} เรื่อง</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-purple-500/20">
                    <div className="text-[11px] opacity-70">วิจัยเพื่อการพัฒนา</div>
                    <div className="font-black text-sm">{currentExecSurvey.research_development} เรื่อง</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-purple-500/20">
                    <div className="text-[11px] opacity-70">วิจัยอื่น ๆ</div>
                    <div className="font-black text-sm">{currentExecSurvey.research_other} เรื่อง</div>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200"
                }`}
              >
                <h4 className="font-bold text-purple-500 mb-2">
                  3. แผนรับบุคลากรสายวิชาการเพิ่ม (พ.ศ. 2570–2574)
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {SURVEY_YEARS.map((y) => {
                    const yKey = String(y);
                    return (
                      <div
                        key={yKey}
                        className={`p-2.5 rounded-xl border ${
                          isDark ? "bg-[#0D081D] border-white/10" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="text-[11px] opacity-65">พ.ศ. {yKey}</div>
                        <div className="font-black text-amber-500">
                          รวม {currentExecSurvey.staff_recruitment_total[yKey] || 0} อัตรา
                        </div>
                        <div className="text-[10px] opacity-75">
                          ป.โท {currentExecSurvey.staff_recruitment_master[yKey] || 0} • ป.เอก{" "}
                          {currentExecSurvey.staff_recruitment_doctoral[yKey] || 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {currentExecSurvey.suggestions && (
                  <p className="mt-3 p-3 rounded-xl bg-purple-500/10 text-xs">
                    <span className="font-bold">ข้อเสนอแนะ: </span>
                    {currentExecSurvey.suggestions}
                  </p>
                )}
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-white/10 flex justify-end gap-2">
              {isSubmissionOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExecSurveyViewerOpen(false);
                    openExecSurveyEditor(currentExecSurvey.Department);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>แก้ไขข้อมูลชุดนี้</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsExecSurveyViewerOpen(false)}
                className="px-4 py-2 rounded-xl border border-purple-500/30 text-xs font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: สับเปลี่ยนหัวหน้าสาขาวิชา / ผู้บริหารในอนาคต (Role Handover)
         ========================================================= */}
      {isHandoverModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
          onClick={() => setIsHandoverModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`rounded-3xl max-w-lg w-full p-5 sm:p-6 border shadow-2xl space-y-4 overscroll-contain ${
              isDark
                ? "bg-[#181030] border-white/15 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200/70 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">
                    สับเปลี่ยนหัวหน้าสาขาวิชา / ผู้บริหารคณะ
                  </h3>
                  <p className="text-xs opacity-70">
                    รองรับการหมุนเวียนตำแหน่งผู้บริหารและสิทธิ์การดูแดชบอร์ดทั้งคณะ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHandoverModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1">
                  1. เลือกสาขาวิชา / หน่วยงานที่ต้องการสับเปลี่ยนผู้รับผิดชอบ
                </label>
                <select
                  value={handoverDept}
                  onChange={(e) => {
                    const dept = e.target.value;
                    setHandoverDept(dept);
                    const firstInDept = instructorStaff.find(
                      (t) => t.Department === dept
                    );
                    if (firstInDept) setHandoverTeacherId(firstInDept.Staff_ID);
                  }}
                  className={`w-full px-3.5 h-11 rounded-xl border font-bold ${
                    isDark
                      ? "bg-[#0D081D] border-white/15 text-white"
                      : "bg-slate-50 border-slate-300"
                  }`}
                >
                  {EDUCATION_PROGRAMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">
                  2. เลือกอาจารย์ที่จะดำรงตำแหน่งผู้บริหาร / หัวหน้าสาขาวิชาคนใหม่
                </label>
                <select
                  value={handoverTeacherId}
                  onChange={(e) => setHandoverTeacherId(e.target.value)}
                  className={`w-full px-3.5 h-11 rounded-xl border font-bold ${
                    isDark
                      ? "bg-[#0D081D] border-white/15 text-white"
                      : "bg-slate-50 border-slate-300"
                  }`}
                >
                  <optgroup label={`อาจารย์ใน${handoverDept}`}>
                    {instructorStaff
                      .filter((t) => t.Department === handoverDept)
                      .map((t) => (
                        <option key={t.Staff_ID} value={t.Staff_ID}>
                          {t.Full_Name} ({t.Staff_ID})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="อาจารย์จากสาขาวิชาอื่นในคณะศึกษาศาสตร์">
                    {instructorStaff
                      .filter((t) => t.Department !== handoverDept)
                      .map((t) => (
                        <option key={t.Staff_ID} value={t.Staff_ID}>
                          {t.Full_Name} — {t.Department}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">3. ตำแหน่งบริหารที่มอบหมาย</label>
                <select
                  value={handoverPosition}
                  onChange={(e) => setHandoverPosition(e.target.value)}
                  className={`w-full px-3.5 h-11 rounded-xl border font-bold ${
                    isDark
                      ? "bg-[#0D081D] border-white/15 text-white"
                      : "bg-slate-50 border-slate-300"
                  }`}
                >
                  <option value="หัวหน้าสาขาวิชา">หัวหน้าสาขาวิชา</option>
                  <option value="ประธานหลักสูตร">ประธานหลักสูตร</option>
                  <option value="รองคณบดี / ผู้บริหารคณะ">รองคณบดี / ผู้บริหารคณะ</option>
                  <option value="คณบดีคณะศึกษาศาสตร์">คณบดีคณะศึกษาศาสตร์</option>
                  <option value="รักษาการหัวหน้าสาขาวิชา">รักษาการหัวหน้าสาขาวิชา</option>
                </select>
              </div>

              <div
                onClick={() => setHandoverCanViewAll((prev) => !prev)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer ${
                  handoverCanViewAll
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-white/5 border-white/15"
                }`}
              >
                <div>
                  <p className="font-bold text-xs">
                    อนุญาตให้ดูแดชบอร์ดภาพรวมทั้งคณะ (12 สาขาวิชา)
                  </p>
                  <p className="text-[11px] opacity-70">
                    เมื่ออาจารย์ท่านนี้เข้าสู่ระบบในโหมดอาจารย์ จะมีปุ่มสลับเข้าโหมดผู้บริหารได้ทันที
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    handoverCanViewAll
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-600 text-white"
                  }`}
                >
                  {handoverCanViewAll ? "เปิดสิทธิ์" : "เฉพาะสาขา"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsHandoverModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-purple-500/30 text-xs font-bold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (handoverTeacherId) {
                    onAssignDepartmentHead(
                      handoverDept,
                      handoverTeacherId,
                      handoverPosition,
                      handoverCanViewAll
                    );
                    onSelectExecDept(handoverDept);
                  }
                  setIsHandoverModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md"
              >
                ยืนยันการสับเปลี่ยนตำแหน่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
