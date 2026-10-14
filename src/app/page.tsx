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
  X
} from "lucide-react";

// ============================================================================
// ตั้งค่า URL ของ Google Apps Script Web App ที่ Deploy แล้วที่นี่
// (หากยังไม่ได้ใส่ ระบบจะทำงานด้วย Real-time Local Cache อัตโนมัติเพื่อให้ทดสอบได้ทันที)
// ============================================================================
const GAS_API_URL = process.env.NEXT_PUBLIC_GAS_API_URL || "";

// ============================================================================
// โครงสร้างข้อมูลและข้อมูลเริ่มต้น (ตรงกับ Google Sheets ทั้ง 5 แท็บ)
// ============================================================================
interface StaffMember {
  Staff_ID: string;
  Full_Name: string;
  Department: string;
  Role: "INSTRUCTOR" | "EXECUTIVE" | "ADMIN";
  Password: string;
  Is_Default_Pwd: boolean;
}

interface InstructorFormRecord {
  Record_ID: string;
  Staff_ID: string;
  Full_Name: string;
  Department: string;
  Academic_Year: number;
  Course_Code: string;
  Course_Name: string;
  Teaching_Summary: string;
  Research_Output: string;
  Additional_Notes: string;
  Updated_At: string;
}

interface PortfolioWork {
  Work_ID: string;
  Staff_ID: string;
  Instructor_Name: string;
  Department: string;
  Academic_Year: number;
  Title: string;
  Category: string;
  Work_Type: "PDF" | "LINK";
  File_Or_Link_URL: string;
  Description: string;
  Is_Public: boolean;
  Downloads: number;
  Updated_At: string;
}

interface ExecutiveFormRecord {
  Exec_ID: string;
  Staff_ID: string;
  Executive_Name: string;
  Department: string;
  Academic_Year: number;
  Curriculum_Status: string;
  Total_Graduates: number;
  Quality_Score: number;
  Strategic_Summary: string;
  Issues_Found: string;
  Updated_At: string;
}

const INITIAL_STAFF: StaffMember[] = [
  { Staff_ID: "T001", Full_Name: "ผศ.ดร. อารีรัตน์ วิทยาการ", Department: "วิทยาการคอมพิวเตอร์", Role: "INSTRUCTOR", Password: "123456", Is_Default_Pwd: true },
  { Staff_ID: "T002", Full_Name: "อาจารย์ นภัสสร นวัตกรรม", Department: "เทคโนโลยีสารสนเทศ", Role: "INSTRUCTOR", Password: "123456", Is_Default_Pwd: true },
  { Staff_ID: "T003", Full_Name: "ดร. ธนากร ข้อมูลศึกษา", Department: "วิทยาการข้อมูล", Role: "INSTRUCTOR", Password: "123456", Is_Default_Pwd: false },
  { Staff_ID: "E001", Full_Name: "รศ.ดร. คมสันต์ บริหารกิจ", Department: "วิทยาการคอมพิวเตอร์", Role: "EXECUTIVE", Password: "exec123", Is_Default_Pwd: false },
  { Staff_ID: "E002", Full_Name: "ผศ.ดร. ศิริพร พัฒนา", Department: "เทคโนโลยีสารสนเทศ", Role: "EXECUTIVE", Password: "exec123", Is_Default_Pwd: false },
  { Staff_ID: "ADMIN", Full_Name: "ผู้ดูแลระบบสูงสุด (Admin)", Department: "ส่วนกลาง", Role: "ADMIN", Password: "admin999", Is_Default_Pwd: false },
];

const INITIAL_INSTRUCTOR_FORMS: InstructorFormRecord[] = [
  {
    Record_ID: "REC-101",
    Staff_ID: "T001",
    Full_Name: "ผศ.ดร. อารีรัตน์ วิทยาการ",
    Department: "วิทยาการคอมพิวเตอร์",
    Academic_Year: 2570,
    Course_Code: "CS101",
    Course_Name: "โครงสร้างข้อมูลและอัลกอริทึมสมัยใหม่",
    Teaching_Summary: "จัดการเรียนการสอนแบบ Active Learning ร่วมกับระบบจำลองโค้ดออนไลน์ นักศึกษาสอบผ่านเกณฑ์ 96%",
    Research_Output: "ตีพิมพ์บทความวิจัยระดับนานาชาติ 2 เรื่อง ด้าน AI ในการศึกษา",
    Additional_Notes: "พัฒนาสื่อการสอน E-Book เพิ่มเติม 1 เล่ม",
    Updated_At: "2026-10-10",
  },
  {
    Record_ID: "REC-102",
    Staff_ID: "T002",
    Full_Name: "อาจารย์ นภัสสร นวัตกรรม",
    Department: "เทคโนโลยีสารสนเทศ",
    Academic_Year: 2571,
    Course_Code: "IT204",
    Course_Name: "การพัฒนาเว็บแอปพลิเคชันแบบ Cloud-Native",
    Teaching_Summary: "บูรณาการโปรเจกต์จริงกับสถานประกอบการ นักศึกษาสร้างระบบ PWA ใช้งานจริง",
    Research_Output: "ผลงานนวัตกรรมซอฟต์แวร์ระดับชาติ 1 ชิ้น",
    Additional_Notes: "อัปเดตเนื้อหาตามเกณฑ์มาตรฐานใหม่",
    Updated_At: "2026-10-12",
  },
  {
    Record_ID: "REC-103",
    Staff_ID: "T001",
    Full_Name: "ผศ.ดร. อารีรัตน์ วิทยาการ",
    Department: "วิทยาการคอมพิวเตอร์",
    Academic_Year: 2572,
    Course_Code: "CS305",
    Course_Name: "ปัญญาประดิษฐ์และการเรียนรู้เชิงลึก",
    Teaching_Summary: "ประยุกต์ใช้โมเดลภาษาขนาดใหญ่ในการวิจัยระดับปริญญาตรี",
    Research_Output: "สิทธิบัตรซอฟต์แวร์วิเคราะห์ข้อมูล 1 รายการ",
    Additional_Notes: "-",
    Updated_At: "2026-10-13",
  },
  {
    Record_ID: "REC-104",
    Staff_ID: "T003",
    Full_Name: "ดร. ธนากร ข้อมูลศึกษา",
    Department: "วิทยาการข้อมูล",
    Academic_Year: 2573,
    Course_Code: "DS401",
    Course_Name: "วิศวกรรมข้อมูลขนาดใหญ่ (Big Data Engineering)",
    Teaching_Summary: "สร้าง Data Pipeline บนระบบคลาวด์",
    Research_Output: "บทความวิจัย Scopus Q1 จำนวน 2 เรื่อง",
    Additional_Notes: "-",
    Updated_At: "2026-10-14",
  }
];

const INITIAL_PORTFOLIO_WORKS: PortfolioWork[] = [
  {
    Work_ID: "WRK-201",
    Staff_ID: "T001",
    Instructor_Name: "ผศ.ดร. อารีรัตน์ วิทยาการ",
    Department: "วิทยาการคอมพิวเตอร์",
    Academic_Year: 2570,
    Title: "คู่มือการออกแบบอัลกอริทึมและโครงสร้างข้อมูล (ฉบับสมบูรณ์)",
    Category: "ตำรา / E-Book",
    Work_Type: "PDF",
    File_Or_Link_URL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    Description: "เอกสารตำราเรียนรูปแบบ E-Book ครอบคลุมเนื้อหาโครงสร้างข้อมูล กราฟ และการวิเคราะห์ความซับซ้อนของอัลกอริทึม พร้อมตัวอย่างโค้ดประกอบ",
    Is_Public: true,
    Downloads: 148,
    Updated_At: "2026-10-11",
  },
  {
    Work_ID: "WRK-202",
    Staff_ID: "T002",
    Instructor_Name: "อาจารย์ นภัสสร นวัตกรรม",
    Department: "เทคโนโลยีสารสนเทศ",
    Academic_Year: 2571,
    Title: "บันทึกการสอนสด (Live) การสถาปัตยกรรมระบบ Bento UI & PWA",
    Category: "สื่อการสอนไลฟ์สด / วิดีโอ",
    Work_Type: "LINK",
    File_Or_Link_URL: "https://vercel.com/docs",
    Description: "ไลฟ์สดสาธิตการวางโครงสร้างเว็บแอปพลิเคชันสมัยใหม่ การเชื่อมต่อฐานข้อมูลแบบ Real-time และการทำระบบ PWA สำหรับนักศึกษาชั้นปีที่ 3",
    Is_Public: true,
    Downloads: 92,
    Updated_At: "2026-10-12",
  },
  {
    Work_ID: "WRK-203",
    Staff_ID: "T001",
    Instructor_Name: "ผศ.ดร. อารีรัตน์ วิทยาการ",
    Department: "วิทยาการคอมพิวเตอร์",
    Academic_Year: 2572,
    Title: "เอกสารวิจัยภายใน: โมเดลพยากรณ์ผลสัมฤทธิ์ทางการเรียน",
    Category: "งานวิจัย",
    Work_Type: "PDF",
    File_Or_Link_URL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    Description: "เอกสารร่างงานวิจัยสำหรับใช้ภายในภาควิชา (ตั้งค่าเป็นไม่เผยแพร่สาธารณะ)",
    Is_Public: false,
    Downloads: 12,
    Updated_At: "2026-10-13",
  },
];

const INITIAL_EXECUTIVE_FORMS: ExecutiveFormRecord[] = [
  {
    Exec_ID: "EXE-301",
    Staff_ID: "E001",
    Executive_Name: "รศ.ดร. คมสันต์ บริหารกิจ",
    Department: "วิทยาการคอมพิวเตอร์",
    Academic_Year: 2570,
    Curriculum_Status: "ผ่านเกณฑ์มาตรฐาน AUN-QA",
    Total_Graduates: 125,
    Quality_Score: 4.75,
    Strategic_Summary: "พัฒนาห้องปฏิบัติการ AI และส่งเสริมให้อาจารย์ผลิตสื่อ E-Book ครบทุกวิชาแกน",
    Issues_Found: "ต้องการงบประมาณอัปเกรดเซิร์ฟเวอร์ประมวลผลเพิ่มในปี 2571",
    Updated_At: "2026-10-12",
  },
  {
    Exec_ID: "EXE-302",
    Staff_ID: "E002",
    Executive_Name: "ผศ.ดร. ศิริพร พัฒนา",
    Department: "เทคโนโลยีสารสนเทศ",
    Academic_Year: 2571,
    Curriculum_Status: "ปรับปรุงหลักสูตรตามเกณฑ์ พ.ศ. 2570",
    Total_Graduates: 110,
    Quality_Score: 4.62,
    Strategic_Summary: "เน้นความร่วมมือสหกิจศึกษากับบริษัทซอฟต์แวร์ชั้นนำ",
    Issues_Found: "ไม่มี",
    Updated_At: "2026-10-13",
  },
];

export default function AcademicBentoApp() {
  // Navigation & Auth State
  const [activeView, setActiveView] = useState<"HOME" | "INSTRUCTOR" | "EXECUTIVE" | "ADMIN">("HOME");
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [loginModalRole, setLoginModalRole] = useState<"INSTRUCTOR" | "EXECUTIVE" | "ADMIN" | null>(null);
  const [loginStaffId, setLoginStaffId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Database State (Synced with LocalStorage + Google Apps Script)
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [instructorForms, setInstructorForms] = useState<InstructorFormRecord[]>(INITIAL_INSTRUCTOR_FORMS);
  const [portfolioWorks, setPortfolioWorks] = useState<PortfolioWork[]>(INITIAL_PORTFOLIO_WORKS);
  const [executiveForms, setExecutiveForms] = useState<ExecutiveFormRecord[]>(INITIAL_EXECUTIVE_FORMS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Public Repository Filter & E-Book / Link Modal State
  const [publicSearch, setPublicSearch] = useState("");
  const [publicDeptFilter, setPublicDeptFilter] = useState("ALL");
  const [selectedWorkModal, setSelectedWorkModal] = useState<PortfolioWork | null>(null);
  const [ebookPage, setEbookPage] = useState(1);

  // Instructor Portal State
  const [instTab, setInstTab] = useState<"FORM" | "PORTFOLIO" | "PASSWORD">("FORM");
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [instFormState, setInstFormState] = useState({
    Academic_Year: 2570,
    Course_Code: "",
    Course_Name: "",
    Teaching_Summary: "",
    Research_Output: "",
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

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Executive Portal State
  const [editingExecId, setEditingExecId] = useState<string | null>(null);
  const [execFormState, setExecFormState] = useState({
    Academic_Year: 2570,
    Curriculum_Status: "ปกติ / ผ่านเกณฑ์",
    Total_Graduates: 100,
    Quality_Score: 4.5,
    Strategic_Summary: "",
    Issues_Found: "",
  });

  // Admin Portal State
  const [adminMenu, setAdminMenu] = useState<"DASHBOARD" | "INSTRUCTORS" | "PORTFOLIO" | "EXECUTIVES" | "STAFF" | "SETTINGS">("DASHBOARD");
  const [adminYearMode, setAdminYearMode] = useState<"RANGE_2570_2574" | "EVERY_5_YEARS" | "SINGLE_YEAR">("RANGE_2570_2574");
  const [adminSelectedYear, setAdminSelectedYear] = useState<number>(2570);
  const [newStaffForm, setNewStaffForm] = useState({
    Staff_ID: "",
    Full_Name: "",
    Department: "วิทยาการคอมพิวเตอร์",
    Role: "INSTRUCTOR" as "INSTRUCTOR" | "EXECUTIVE" | "ADMIN",
    Password: "123456",
  });

  // แจ้งเตือนสั้นๆ แบบไม่ขัดจังหวะ (Non-blocking Toast)
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3200);
  };

  // โหลดข้อมูลจาก LocalStorage ทันที (0ms) และซิงค์จาก Google Apps Script เบื้องหลัง
  useEffect(() => {
    const cachedStaff = localStorage.getItem("bento_staff");
    const cachedInst = localStorage.getItem("bento_inst_forms");
    const cachedWorks = localStorage.getItem("bento_works");
    const cachedExec = localStorage.getItem("bento_exec_forms");

    if (cachedStaff) setStaffList(JSON.parse(cachedStaff));
    if (cachedInst) setInstructorForms(JSON.parse(cachedInst));
    if (cachedWorks) setPortfolioWorks(JSON.parse(cachedWorks));
    if (cachedExec) setExecutiveForms(JSON.parse(cachedExec));

    if (GAS_API_URL) {
      syncWithGoogleSheets();
    }
  }, []);

  // บันทึกลง LocalStorage ทุกครั้งที่ State เปลี่ยนเพื่อให้รวดเร็วไม่ค้าง
  useEffect(() => {
    localStorage.setItem("bento_staff", JSON.stringify(staffList));
    localStorage.setItem("bento_inst_forms", JSON.stringify(instructorForms));
    localStorage.setItem("bento_works", JSON.stringify(portfolioWorks));
    localStorage.setItem("bento_exec_forms", JSON.stringify(executiveForms));
  }, [staffList, instructorForms, portfolioWorks, executiveForms]);

  const syncWithGoogleSheets = async () => {
    if (!GAS_API_URL) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${GAS_API_URL}?action=init`);
      const data = await res.json();
      if (data.staffList?.length) setStaffList(data.staffList);
      if (data.instructorForms?.length) setInstructorForms(data.instructorForms);
      if (data.portfolioWorks?.length) setPortfolioWorks(data.portfolioWorks);
      if (data.executiveForms?.length) setExecutiveForms(data.executiveForms);
    } catch (e) {
      console.warn("ใช้งานโหมด Local Cache (ยังไม่ได้เชื่อมต่อ GAS URL หรืออยู่ในโหมดออฟไลน์)");
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
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.warn("บันทึกไว้ใน Local Cache เรียบร้อยแล้ว");
    } finally {
      setIsSyncing(false);
    }
  };

  // ============================================================================
  // ระบบตรวจสอบการล็อกอินแยกตามปุ่มที่กด
  // ============================================================================
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const user = staffList.find(
      (s) =>
        s.Staff_ID.trim().toUpperCase() === loginStaffId.trim().toUpperCase() &&
        String(s.Password) === loginPassword.trim()
    );

    if (!user) {
      setLoginError("รหัสบุคลากรหรือรหัสผ่านไม่ถูกต้อง (ดูรหัสทดสอบได้ที่ด้านล่างหน้าต่าง)");
      return;
    }

    if (loginModalRole && user.Role !== loginModalRole && user.Role !== "ADMIN") {
      setLoginError(`บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานส่วน "${loginModalRole}"`);
      return;
    }

    setCurrentUser(user);
    const targetView = loginModalRole || user.Role;
    setActiveView(targetView);
    setLoginModalRole(null);
    setLoginStaffId("");
    setLoginPassword("");
    showToast(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${user.Full_Name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView("HOME");
    showToast("ออกจากระบบเรียบร้อยแล้ว");
  };

  // ============================================================================
  // ฟังก์ชันของอาจารย์ผู้สอน (บันทึก/แก้ไขข้อมูล + อัปโหลดผลงาน + เปลี่ยนรหัสผ่าน)
  // ============================================================================
  const handleSaveInstructorForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const recordId = editingRecordId || `REC-${Date.now()}`;
    const newRecord: InstructorFormRecord = {
      Record_ID: recordId,
      Staff_ID: currentUser.Staff_ID,
      Full_Name: currentUser.Full_Name,
      Department: currentUser.Department,
      Academic_Year: Number(instFormState.Academic_Year),
      Course_Code: instFormState.Course_Code,
      Course_Name: instFormState.Course_Name,
      Teaching_Summary: instFormState.Teaching_Summary,
      Research_Output: instFormState.Research_Output,
      Additional_Notes: instFormState.Additional_Notes,
      Updated_At: new Date().toISOString().split("T")[0],
    };

    // Optimistic Update: อัปเดตหน้าเว็บทันทีไม่รอดาวน์โหลด
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
      teachingSummary: newRecord.Teaching_Summary,
      researchOutput: newRecord.Research_Output,
      additionalNotes: newRecord.Additional_Notes,
    });

    setEditingRecordId(null);
    setInstFormState({
      Academic_Year: 2570,
      Course_Code: "",
      Course_Name: "",
      Teaching_Summary: "",
      Research_Output: "",
      Additional_Notes: "",
    });
    showToast(editingRecordId ? "แก้ไขข้อมูลที่เคยกรอกเรียบร้อยแล้ว" : "บันทึกข้อมูลลงฐานข้อมูลเรียบร้อยแล้ว");
  };

  const handleEditInstructorForm = (rec: InstructorFormRecord) => {
    setEditingRecordId(rec.Record_ID);
    setInstFormState({
      Academic_Year: rec.Academic_Year,
      Course_Code: rec.Course_Code,
      Course_Name: rec.Course_Name,
      Teaching_Summary: rec.Teaching_Summary,
      Research_Output: rec.Research_Output,
      Additional_Notes: rec.Additional_Notes,
    });
    setInstTab("FORM");
  };

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

    const workId = editingWorkId || `WRK-${Date.now()}`;
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
    showToast(
      newWork.Is_Public
        ? "บันทึกและซิงค์ผลงานไปยังคลังข้อมูลสาธารณะเรียบร้อยแล้ว!"
        : "บันทึกผลงานแบบส่วนตัวเรียบร้อยแล้ว"
    );
  };

  const toggleWorkVisibility = (work: PortfolioWork) => {
    const nextPublic = !work.Is_Public;
    setPortfolioWorks((prev) =>
      prev.map((w) => (w.Work_ID === work.Work_ID ? { ...w, Is_Public: nextPublic } : w))
    );
    postToGAS({ action: "toggleWorkPublic", workId: work.Work_ID, isPublic: nextPublic });
    showToast(nextPublic ? "เปิดเผยแพร่ผลงานสู่คลังสาธารณะแล้ว" : "ซ่อนผลงานจากคลังสาธารณะแล้ว");
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
        s.Staff_ID === currentUser.Staff_ID
          ? { ...s, Password: newPassword, Is_Default_Pwd: false }
          : s
      )
    );
    setCurrentUser({ ...currentUser, Password: newPassword, Is_Default_Pwd: false });
    postToGAS({ action: "changePassword", staffId: currentUser.Staff_ID, newPassword });
    setNewPassword("");
    setConfirmPassword("");
    showToast("เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว!");
  };

  // ============================================================================
  // ฟังก์ชันของผู้บริหาร / หัวหน้าสาขา (กรอกและดูเฉพาะสาขาตัวเองเท่านั้น)
  // ============================================================================
  const handleSaveExecutiveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const execId = editingExecId || `EXE-${Date.now()}`;
    const newExec: ExecutiveFormRecord = {
      Exec_ID: execId,
      Staff_ID: currentUser.Staff_ID,
      Executive_Name: currentUser.Full_Name,
      Department: currentUser.Department,
      Academic_Year: Number(execFormState.Academic_Year),
      Curriculum_Status: execFormState.Curriculum_Status,
      Total_Graduates: Number(execFormState.Total_Graduates),
      Quality_Score: Number(execFormState.Quality_Score),
      Strategic_Summary: execFormState.Strategic_Summary,
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
      totalGraduates: newExec.Total_Graduates,
      qualityScore: newExec.Quality_Score,
      strategicSummary: newExec.Strategic_Summary,
      issuesFound: newExec.Issues_Found,
    });

    setEditingExecId(null);
    showToast(`บันทึกข้อมูลสรุปของสาขา${currentUser.Department}เรียบร้อยแล้ว`);
  };

  // ============================================================================
  // ข้อมูลกรองสำหรับคลังข้อมูลสาธารณะ และสถิติกราฟหน้า Admin (2570-2574 & ทุกๆ 5 ปี)
  // ============================================================================
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
    // โหมดรายปีเดี่ยว แยกตามสาขาวิชา
    const depts = ["วิทยาการคอมพิวเตอร์", "เทคโนโลยีสารสนเทศ", "วิทยาการข้อมูล"];
    return depts.map((d) => ({
      label: d,
      formsCount: instructorForms.filter(
        (f) => f.Department === d && Number(f.Academic_Year) === Number(adminSelectedYear)
      ).length,
      worksCount: portfolioWorks.filter(
        (w) => w.Department === d && Number(w.Academic_Year) === Number(adminSelectedYear)
      ).length,
    }));
  }, [adminYearMode, adminSelectedYear, instructorForms, portfolioWorks]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* แถบแจ้งเตือน Toast แบบเรียลไทม์ */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* ====================================================================
          TOP NAVIGATION BAR (จะซ่อนด้านซ้ายเมื่ออยู่ในโหมด Admin ที่มี Sidebar ชิดซ้าย)
         ==================================================================== */}
      {activeView !== "ADMIN" && (
        <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div
              onClick={() => setActiveView("HOME")}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-indigo-600 transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-slate-900">
                  Academic Bento Portal
                </h1>
                <p className="text-xs text-slate-500">
                  ระบบฐานข้อมูลคณาจารย์ ผู้บริหาร และคลัง E-Book ออนไลน์ (PWA)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Real-time Sync Ready</span>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveView(currentUser.Role)}
                    className="text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
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
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-all"
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
          VIEW 1: หน้าหลัก (HOME) — 2 ปุ่มใหญ่แบบ Minimal Bento + คลังข้อมูลสาธารณะ E-Book
         ==================================================================== */}
      {activeView === "HOME" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
          {/* โซน Bento 2 ปุ่มหลักตามโจทย์ */}
          <section>
            <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  Role-Based Portal
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2">
                  เลือกส่วนงานสำหรับเข้าสู่ระบบ
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                ซิงค์ฐานข้อมูล Google Sheets อัตโนมัติ รวดเร็ว ไม่ค้าง รองรับทุกอุปกรณ์
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ปุ่มที่ 1: สำหรับอาจารย์ผู้สอน */}
              <div
                onClick={() => {
                  if (currentUser?.Role === "INSTRUCTOR") setActiveView("INSTRUCTOR");
                  else setLoginModalRole("INSTRUCTOR");
                }}
                className="group relative overflow-hidden rounded-3xl bg-white p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[250px]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    ปุ่มที่ 1 • Instructor Portal
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    1. สำหรับอาจารย์ผู้สอน
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    เข้าสู่ระบบด้วยรหัสบุคลากรและรหัสผ่านเริ่มต้น (เปลี่ยนรหัสผ่านเองได้)
                    เพื่อกรอกข้อมูล แก้ไขข้อมูลที่เคยกรอก และอัปโหลดผลงานวิชาการพร้อมกำหนดสิทธิ์เผยแพร่สาธารณะ
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-indigo-600">
                  <span>เข้าสู่ระบบสำหรับอาจารย์ผู้สอน</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* ปุ่มที่ 2: สำหรับผู้บริหาร */}
              <div
                onClick={() => {
                  if (currentUser?.Role === "EXECUTIVE") setActiveView("EXECUTIVE");
                  else setLoginModalRole("EXECUTIVE");
                }}
                className="group relative overflow-hidden rounded-3xl bg-slate-900 text-white p-7 sm:p-8 border border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[250px]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                    ปุ่มที่ 2 • Executive Portal
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    2. สำหรับผู้บริหาร (หัวหน้าสาขา)
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    สำหรับหัวหน้าสาขาเข้ามากรอกข้อมูลระดับสาขาวิชา เมื่อกดส่งแล้วสามารถดูข้อมูลสรุป
                    สถิติคณาจารย์ และผลงานวิชาการได้เฉพาะสาขาของตัวเองเท่านั้น
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-sm font-semibold text-emerald-400">
                  <span>เข้าสู่ระบบสำหรับผู้บริหาร / หัวหน้าสาขา</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </section>

          {/* ================================================================
              โซนคลังข้อมูลสาธารณะ (Public Digital Repository & E-Book Hub)
              ผู้ใช้ทั่วไป นศ. หรือบุคลากรเข้าดู/อ่าน E-Book/โหลดได้โดยไม่ต้องใช้รหัสผ่าน
             ================================================================ */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Public E-Book & Academic Repository (เปิดเผยสาธารณะ ไม่ต้องล็อกอิน)</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  คลังผลงานคณาจารย์และหนังสืออิเล็กทรอนิกส์ (E-Book)
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  ค้นหาชื่ออาจารย์ผู้สอนเพื่อเปิดอ่านไฟล์ PDF ในรูปแบบ E-Book ดาวน์โหลดเอกสาร หรือดูพรีวิวลิงก์ไลฟ์สดการสอน
                </p>
              </div>

              {/* ช่องค้นหาอาจารย์ผู้สอนและกรองสาขา */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={publicSearch}
                    onChange={(e) => setPublicSearch(e.target.value)}
                    placeholder="ค้นหาชื่ออาจารย์, ชื่อผลงาน, ปี พ.ศ. ..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={publicDeptFilter}
                  onChange={(e) => setPublicDeptFilter(e.target.value)}
                  className="px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">ทุกสาขาวิชา</option>
                  <option value="วิทยาการคอมพิวเตอร์">วิทยาการคอมพิวเตอร์</option>
                  <option value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</option>
                  <option value="วิทยาการข้อมูล">วิทยาการข้อมูล</option>
                </select>
              </div>
            </div>

            {/* แสดงรายการผลงานแบบ Bento E-Book Shelf */}
            {publicWorksFiltered.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                ไม่พบผลงานที่ค้นหา หรือยังไม่มีผลงานที่เปิดเป็นสาธารณะในหมวดหมู่นี้
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
                    className="group rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white p-5 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* หน้าปกจำลองสไตล์ E-Book หรือ Live Link Preview */}
                      <div
                        className={`h-40 rounded-xl p-5 flex flex-col justify-between mb-4 relative overflow-hidden ${
                          work.Work_Type === "PDF"
                            ? "bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white"
                            : "bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-sm font-medium">
                            {work.Work_Type === "PDF" ? "📖 E-Book (PDF)" : "🔗 Live / External Link"}
                          </span>
                          <span className="opacity-80">พ.ศ. {work.Academic_Year}</span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider opacity-75">
                            {work.Department}
                          </p>
                          <h4 className="font-bold text-base line-clamp-2 mt-0.5">
                            {work.Title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mb-2">
                        <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>ผู้สอน: {work.Instructor_Name}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {work.Description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-indigo-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {work.Work_Type === "PDF" ? "เปิดอ่าน E-Book / ดาวน์โหลด" : "เปิดหน้าพรีวิวลิงก์"}
                      </span>
                      <span className="text-slate-400">โหลดแล้ว {work.Downloads} ครั้ง</span>
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
          {/* Header ข้อมูลอาจารย์ */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700">
                  รหัสบุคลากร: {currentUser.Staff_ID}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  สาขา{currentUser.Department}
                </span>
              </div>
              <h2 className="text-2xl font-bold mt-2">{currentUser.Full_Name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                สามารถกรอกข้อมูล แก้ไขข้อมูลที่เคยบันทึกไว้ และอัปโหลดผลงานเพื่อเผยแพร่ไปยังคลังข้อมูลสาธารณะได้ทันที
              </p>
            </div>

            {/* แถบสลับเมนูย่อยของอาจารย์ */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInstTab("FORM")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  instTab === "FORM"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>1. กรอก/แก้ไขข้อมูลการสอน</span>
              </button>
              <button
                onClick={() => setInstTab("PORTFOLIO")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  instTab === "PORTFOLIO"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>2. อัปโหลดผลงาน (E-Book/ลิงก์)</span>
              </button>
              <button
                onClick={() => setInstTab("PASSWORD")}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
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

          {/* แท็บที่ 1: ฟอร์มกรอกข้อมูลอาจารย์ + ตารางแก้ไขข้อมูลเดิม */}
          {instTab === "FORM" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleSaveInstructorForm}
                className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-lg">
                    {editingRecordId ? "✏️ แก้ไขข้อมูลที่เคยกรอก" : "📝 กรอกข้อมูลอาจารย์ผู้สอน"}
                  </h3>
                  {editingRecordId && (
                    <button
                      type="button"
                      onClick={() => setEditingRecordId(null)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      ยกเลิกการแก้ไข
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
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                    >
                      {[2568, 2569, 2570, 2571, 2572, 2573, 2574, 2575].map((y) => (
                        <option key={y} value={y}>
                          พ.ศ. {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      รหัสวิชาที่สอน
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น CS101"
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
                    ชื่อรายวิชาที่รับผิดชอบ
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
                    สรุปผลการจัดการเรียนการสอน / การประเมินผล
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="สรุปวิธีการสอน ผลสัมฤทธิ์ของนักศึกษา..."
                    value={instFormState.Teaching_Summary}
                    onChange={(e) =>
                      setInstFormState({ ...instFormState, Teaching_Summary: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    ผลงานทางวิชาการ / งานวิจัยในรอบปี
                  </label>
                  <input
                    type="text"
                    placeholder="ระบุบทความวิจัย ตำรา หรือนวัตกรรม..."
                    value={instFormState.Research_Output}
                    onChange={(e) =>
                      setInstFormState({ ...instFormState, Research_Output: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    หมายเหตุ / ข้อเสนอแนะเพิ่มเติม
                  </label>
                  <input
                    type="text"
                    placeholder="ข้อมูลอื่นๆ (ถ้ามี)"
                    value={instFormState.Additional_Notes}
                    onChange={(e) =>
                      setInstFormState({ ...instFormState, Additional_Notes: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  {editingRecordId ? "บันทึกการแก้ไขข้อมูล" : "บันทึกข้อมูลลงระบบ"}
                </button>
              </form>

              {/* รายการข้อมูลที่อาจารย์ท่านนี้เคยกรอกไว้ (กดแก้ไขได้ตลอดเวลา) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-lg border-b border-slate-100 pb-3">
                  📋 ประวัติข้อมูลที่คุณเคยกรอกไว้ (กดแก้ไขได้ทุกเมื่อ)
                </h3>

                <div className="space-y-3">
                  {instructorForms
                    .filter((f) => f.Staff_ID === currentUser.Staff_ID)
                    .map((rec) => (
                      <div
                        key={rec.Record_ID}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                              พ.ศ. {rec.Academic_Year}
                            </span>
                            <span className="font-bold text-sm text-slate-900">
                              {rec.Course_Code} — {rec.Course_Name}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">{rec.Teaching_Summary}</p>
                          <p className="text-xs text-slate-500">
                            ผลงานวิจัย: {rec.Research_Output || "-"} • อัปเดตล่าสุด: {rec.Updated_At}
                          </p>
                        </div>

                        <button
                          onClick={() => handleEditInstructorForm(rec)}
                          className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>แก้ไขข้อมูล</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* แท็บที่ 2: อัปโหลดผลงานของอาจารย์ + ตั้งค่าเผยแพร่สาธารณะ */}
          {instTab === "PORTFOLIO" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={handleSavePortfolioWork}
                className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
              >
                <h3 className="font-bold text-lg border-b border-slate-100 pb-3">
                  📤 อัปโหลดผลงานวิชาการ / สื่อการสอน
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
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                    >
                      {[2568, 2569, 2570, 2571, 2572, 2573, 2574, 2575].map((y) => (
                        <option key={y} value={y}>
                          พ.ศ. {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      รูปแบบไฟล์ผลงาน
                    </label>
                    <select
                      value={workFormState.Work_Type}
                      onChange={(e) =>
                        setWorkFormState({
                          ...workFormState,
                          Work_Type: e.target.value as "PDF" | "LINK",
                        })
                      }
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
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
                      อัปโหลดไฟล์ PDF (หรือวางลิงก์ไฟล์ PDF)
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
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
                      ลิงก์ไลฟ์สด / วิดีโอ / เว็บไซต์ปลายทาง
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
                    คำอธิบายย่อ (แสดงในหน้าพรีวิวคลังข้อมูล)
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="อธิบายเนื้อหาโดยสังเขป..."
                    value={workFormState.Description}
                    onChange={(e) =>
                      setWorkFormState({ ...workFormState, Description: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>

                {/* สวิตช์กำหนดว่าจะเผยแพร่สาธารณะหรือไม่ */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      เผยแพร่ผลงานนี้สู่คลังข้อมูลสาธารณะ
                    </p>
                    <p className="text-[11px] text-slate-500">
                      หากเปิด นักศึกษาและบุคคลทั่วไปจะค้นหาชื่อคุณและเปิดอ่าน/ดาวน์โหลดไฟล์นี้ได้
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
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  อัปโหลดและบันทึกผลงาน
                </button>
              </form>

              {/* รายการผลงานของอาจารย์ พร้อมปุ่มสลับ Public / Private ทันที */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-lg border-b border-slate-100 pb-3">
                  📚 ผลงานทั้งหมดของคุณ ({portfolioWorks.filter((w) => w.Staff_ID === currentUser.Staff_ID).length} รายการ)
                </h3>

                <div className="space-y-3">
                  {portfolioWorks
                    .filter((w) => w.Staff_ID === currentUser.Staff_ID)
                    .map((w) => (
                      <div
                        key={w.Work_ID}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                              {w.Work_Type === "PDF" ? "PDF E-Book" : "External Link"}
                            </span>
                            <span className="text-xs text-slate-500">พ.ศ. {w.Academic_Year}</span>
                            {w.Is_Public ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <Globe className="w-3 h-3" /> เผยแพร่สาธารณะ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                                <Lock className="w-3 h-3" /> เฉพาะในระบบ
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900">{w.Title}</h4>
                          <p className="text-xs text-slate-500">{w.Description}</p>
                        </div>

                        <button
                          onClick={() => toggleWorkVisibility(w)}
                          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            w.Is_Public
                              ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                              : "border-emerald-300 bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {w.Is_Public ? "เปลี่ยนเป็นส่วนตัว" : "เปิดเผยแพร่สาธารณะ"}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* แท็บที่ 3: เปลี่ยนรหัสผ่านด้วยตัวเอง */}
          {instTab === "PASSWORD" && (
            <form
              onSubmit={handleChangePassword}
              className="max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4"
            >
              <h3 className="font-bold text-lg">🔐 เปลี่ยนรหัสผ่านประจำตัวบุคลากร</h3>
              <p className="text-xs text-slate-500">
                เปลี่ยนจากรหัสผ่านเริ่มต้นเป็นรหัสผ่านส่วนตัวของคุณ
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  required
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors"
              >
                บันทึกรหัสผ่านใหม่
              </button>
            </form>
          )}
        </main>
      )}

      {/* ====================================================================
          VIEW 3: ระบบสำหรับผู้บริหาร / หัวหน้าสาขา (EXECUTIVE PORTAL)
          ดูข้อมูลสรุปได้เฉพาะสาขาของตัวเองเท่านั้น
         ==================================================================== */}
      {activeView === "EXECUTIVE" && currentUser && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                สิทธิ์การเข้าถึงระดับหัวหน้าสาขา • ดูข้อมูลเฉพาะสาขา{currentUser.Department}เท่านั้น
              </span>
              <h2 className="text-2xl font-bold mt-2">
                แดชบอร์ดสรุปและรายงานผลการดำเนินงาน: สาขา{currentUser.Department}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                ผู้บริหาร: {currentUser.Full_Name} ({currentUser.Staff_ID})
              </p>
            </div>
          </div>

          {/* Bento Summary เฉพาะสาขาของหัวหน้าสาขาท่านนั้น */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">จำนวนอาจารย์ที่กรอกข้อมูลแล้ว (สาขา{currentUser.Department})</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {instructorForms.filter((f) => f.Department === currentUser.Department).length}{" "}
                <span className="text-sm font-normal text-slate-500">รายการ</span>
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">ผลงานวิชาการ / E-Book ในสาขา{currentUser.Department}</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {portfolioWorks.filter((w) => w.Department === currentUser.Department).length}{" "}
                <span className="text-sm font-normal text-slate-500">ผลงาน</span>
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">รายงานสรุประดับสาขาที่ส่งแล้ว</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {executiveForms.filter((e) => e.Department === currentUser.Department).length}{" "}
                <span className="text-sm font-normal text-slate-500">ปีการศึกษา</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ฟอร์มสำหรับหัวหน้าสาขากรอกข้อมูล */}
            <form
              onSubmit={handleSaveExecutiveForm}
              className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              <h3 className="font-bold text-lg border-b border-slate-100 pb-3">
                📊 กรอกข้อมูลสรุปสำหรับหัวหน้าสาขา ({currentUser.Department})
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
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
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
                    จำนวนผู้สำเร็จการศึกษา (คน)
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
                  สรุปผลการดำเนินงานเชิงกลยุทธ์ของสาขาวิชา
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="ระบุผลการดำเนินงานเด่นของสาขา..."
                  value={execFormState.Strategic_Summary}
                  onChange={(e) =>
                    setExecFormState({ ...execFormState, Strategic_Summary: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ปัญหา/อุปสรรค และสิ่งที่ต้องการให้ส่วนกลางสนับสนุน
                </label>
                <input
                  type="text"
                  placeholder="ระบุความต้องการ..."
                  value={execFormState.Issues_Found}
                  onChange={(e) =>
                    setExecFormState({ ...execFormState, Issues_Found: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors"
              >
                บันทึกข้อมูลสรุประดับสาขาวิชา
              </button>
            </form>

            {/* ข้อมูลสรุปเฉพาะสาขาของตนเอง */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-lg">
                  📌 รายงานสรุปของสาขา{currentUser.Department} (เฉพาะสาขาของคุณ)
                </h3>
                {executiveForms
                  .filter((e) => e.Department === currentUser.Department)
                  .map((item) => (
                    <div
                      key={item.Exec_ID}
                      className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-600 text-white">
                          ปีการศึกษา {item.Academic_Year}
                        </span>
                        <span className="text-xs font-semibold text-emerald-800">
                          คะแนนคุณภาพ: {item.Quality_Score} / 5.00 • บัณฑิต {item.Total_Graduates} คน
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        สถานะหลักสูตร: {item.Curriculum_Status}
                      </p>
                      <p className="text-xs text-slate-600">{item.Strategic_Summary}</p>
                    </div>
                  ))}
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-base">
                  👩‍🏫 รายชื่ออาจารย์และวิชาที่บันทึกในสาขา{currentUser.Department}
                </h3>
                {instructorForms
                  .filter((f) => f.Department === currentUser.Department)
                  .map((f) => (
                    <div
                      key={f.Record_ID}
                      className="p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{f.Full_Name}</span> •{" "}
                        <span>
                          {f.Course_Code} {f.Course_Name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">
                        พ.ศ. {f.Academic_Year}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          VIEW 4: ระบบสำหรับแอดมิน (ADMIN COMMAND CENTER)
          มีเมนูอยู่ฝั่งซ้ายชิดเบราว์เซอร์ + Bento Dashboard + กราฟเส้น/กราฟแท่ง 2570-2574 และทุกๆ 5 ปี
         ==================================================================== */}
      {activeView === "ADMIN" && (
        <div className="min-h-screen flex bg-slate-100">
          {/* แถบเมนูฝั่งซ้ายชิดขอบเบราว์เซอร์ (Fixed Left Sidebar) */}
          <aside className="w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between min-h-screen sticky top-0 left-0 select-none">
            <div>
              <div className="p-5 border-b border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Admin Command</h2>
                  <p className="text-[11px] text-slate-400">จัดการระบบหลังบ้านทั้งหมด</p>
                </div>
              </div>

              <nav className="p-3 space-y-1">
                {[
                  { id: "DASHBOARD", label: "แดชบอร์ดสถิติ Bento", icon: LayoutDashboard },
                  { id: "INSTRUCTORS", label: "ข้อมูลอาจารย์ผู้สอน", icon: FileText },
                  { id: "PORTFOLIO", label: "จัดการคลังผลงาน E-Book", icon: FolderKanban },
                  { id: "EXECUTIVES", label: "ข้อมูลผู้บริหารรายสาขา", icon: Building2 },
                  { id: "STAFF", label: "จัดการรหัสบุคลากร", icon: Users },
                  { id: "SETTINGS", label: "ตั้งค่าระบบและฐานข้อมูล", icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminMenu(item.id as typeof adminMenu)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                กลับหน้าหลักสาธารณะ
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600 text-xs font-semibold text-red-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบแอดมิน</span>
              </button>
            </div>
          </aside>

          {/* พื้นที่แสดงผลหลักของแอดมิน */}
          <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
            {/* แดชบอร์ด Bento พร้อมกราฟเส้นและกราฟแท่ง */}
            {adminMenu === "DASHBOARD" && (
              <>
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      Bento Analytics Center
                    </span>
                    <h1 className="text-2xl font-bold mt-1">
                      ภาพรวมสถิติระบบฐานข้อมูลวิชาการ
                    </h1>
                  </div>

                  {/* ตัวเลือกช่วงปี: 2570-2574, ทุกๆ 5 ปี, หรือรายปี */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setAdminYearMode("RANGE_2570_2574")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        adminYearMode === "RANGE_2570_2574"
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      ช่วงปี พ.ศ. 2570–2574
                    </button>
                    <button
                      onClick={() => setAdminYearMode("EVERY_5_YEARS")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        adminYearMode === "EVERY_5_YEARS"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      เปรียบเทียบทุกๆ 5 ปี
                    </button>
                    <button
                      onClick={() => setAdminYearMode("SINGLE_YEAR")}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        adminYearMode === "SINGLE_YEAR"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      ดูรายปีแยกตามสาขา
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

                {/* กล่อง KPI 4 กล่องสไตล์ Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">บุคลากรในระบบทั้งหมด</p>
                    <p className="text-3xl font-bold mt-2">{staffList.length} ท่าน</p>
                    <p className="text-xs text-emerald-600 mt-1">เชื่อมต่อรายชื่อจาก Sheet</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">ข้อมูลการสอนที่อาจารย์บันทึก</p>
                    <p className="text-3xl font-bold text-indigo-600 mt-2">
                      {instructorForms.length} รายการ
                    </p>
                    <p className="text-xs text-slate-400 mt-1">อัปเดตเรียลไทม์</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">ผลงานในคลัง (สาธารณะ / ทั้งหมด)</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">
                      {portfolioWorks.filter((w) => w.Is_Public).length} / {portfolioWorks.length}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">ไฟล์ E-Book และลิงก์สื่อสอน</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-500">รายงานสรุปจากหัวหน้าสาขา</p>
                    <p className="text-3xl font-bold text-amber-600 mt-2">
                      {executiveForms.length} สาขา
                    </p>
                    <p className="text-xs text-slate-400 mt-1">คะแนนคุณภาพเฉลี่ย 4.68</p>
                  </div>
                </div>

                {/* กราฟเส้น (Line Chart) และ กราฟแท่ง (Bar Chart) แบบ Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* กราฟแท่งเปรียบเทียบ (Bar Chart Bento) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-indigo-600" />
                          <span>กราฟแท่งแสดงจำนวนข้อมูลการสอนและผลงานวิชาการ</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          โหมด:{" "}
                          {adminYearMode === "RANGE_2570_2574"
                            ? "รายปี พ.ศ. 2570–2574"
                            : adminYearMode === "EVERY_5_YEARS"
                            ? "เปรียบเทียบทุกๆ 5 ปี"
                            : `แยกรายสาขาประจำปี พ.ศ. ${adminSelectedYear}`}
                        </p>
                      </div>
                    </div>

                    <div className="h-56 flex items-end justify-around gap-4 pt-8 pb-2 px-2 border-b border-slate-100">
                      {adminChartData.map((d, idx) => {
                        const maxVal = Math.max(
                          ...adminChartData.map((x) => Math.max(x.formsCount, x.worksCount, 1)),
                          5
                        );
                        const hForm = Math.max((d.formsCount / maxVal) * 140, 12);
                        const hWork = Math.max((d.worksCount / maxVal) * 140, 12);
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                            <div className="flex items-end gap-2 h-40">
                              <div className="flex flex-col items-center">
                                <span className="text-[11px] font-bold text-indigo-600 mb-1">
                                  {d.formsCount}
                                </span>
                                <div
                                  style={{ height: `${hForm}px` }}
                                  className="w-6 sm:w-8 rounded-t-lg bg-indigo-600 transition-all duration-500"
                                  title={`ข้อมูลการสอน: ${d.formsCount}`}
                                />
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="text-[11px] font-bold text-emerald-600 mb-1">
                                  {d.worksCount}
                                </span>
                                <div
                                  style={{ height: `${hWork}px` }}
                                  className="w-6 sm:w-8 rounded-t-lg bg-emerald-500 transition-all duration-500"
                                  title={`ผลงาน E-Book: ${d.worksCount}`}
                                />
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 text-center">
                              {d.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> ข้อมูลที่อาจารย์กรอก
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> ผลงานอัปโหลด (E-Book/ลิงก์)
                      </span>
                    </div>
                  </div>

                  {/* กราฟเส้นแสดงแนวโน้ม (Line Chart Bento) */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-base flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <span>กราฟเส้นแนวโน้มการเติบโตของข้อมูล (Line Trend)</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        วิเคราะห์แนวโน้มการส่งข้อมูลและผลงานสะสมตามช่วงเวลาที่เลือก
                      </p>
                    </div>

                    <div className="h-56 flex flex-col justify-between pt-4 pb-2 px-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <svg viewBox="0 0 400 150" className="w-full h-40 overflow-visible">
                        {/* เส้น Grid แนวนอน */}
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
                        {/* เส้นกราฟแนวโน้มรวม */}
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
                                    รวม {p.total}
                                  </text>
                                </g>
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                      <div className="flex justify-around text-xs font-semibold text-slate-600">
                        {adminChartData.map((d, i) => (
                          <span key={i}>{d.label}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* จัดการข้อมูลอาจารย์ทั้งหมด */}
            {adminMenu === "INSTRUCTORS" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold">จัดการข้อมูลที่อาจารย์ผู้สอนกรอกทั้งหมด</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 px-2">ปี พ.ศ.</th>
                        <th className="py-3 px-2">รหัส/ชื่ออาจารย์</th>
                        <th className="py-3 px-2">สาขาวิชา</th>
                        <th className="py-3 px-2">รายวิชา</th>
                        <th className="py-3 px-2">สรุปผลการสอน</th>
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
                          <td className="py-3 px-2 text-slate-600">{f.Teaching_Summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* จัดการคลังผลงาน E-Book ทั้งหมด */}
            {adminMenu === "PORTFOLIO" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold">จัดการคลังผลงานและสิทธิ์การเผยแพร่สาธารณะ</h2>
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
                          ผู้สอน: {w.Instructor_Name} • สาขา{w.Department}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleWorkVisibility(w)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          w.Is_Public
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {w.Is_Public ? "สาธารณะ (คลิกเพื่อซ่อน)" : "ส่วนตัว (คลิกเพื่อเผยแพร่)"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* จัดการข้อมูลผู้บริหารรายสาขา */}
            {adminMenu === "EXECUTIVES" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-xl font-bold">รายงานสรุปจากหัวหน้าสาขาทั้งหมด</h2>
                <div className="space-y-3">
                  {executiveForms.map((e) => (
                    <div key={e.Exec_ID} className="p-4 rounded-2xl border border-slate-200 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm text-indigo-600">
                          สาขา{e.Department} (พ.ศ. {e.Academic_Year})
                        </span>
                        <span className="text-xs font-semibold">
                          คะแนนประกันคุณภาพ: {e.Quality_Score} • บัณฑิต {e.Total_Graduates} คน
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{e.Strategic_Summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* จัดการรายชื่อบุคลากรและรหัสผ่านเริ่มต้น */}
            {adminMenu === "STAFF" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const created: StaffMember = {
                      ...newStaffForm,
                      Is_Default_Pwd: true,
                    };
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
                      Department: "วิทยาการคอมพิวเตอร์",
                      Role: "INSTRUCTOR",
                      Password: "123456",
                    });
                    showToast("เพิ่มรายชื่อบุคลากรและรหัสผ่านเริ่มต้นเรียบร้อยแล้ว");
                  }}
                  className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 space-y-4"
                >
                  <h3 className="font-bold text-base">➕ เพิ่มบุคลากร / ตั้งรหัสผ่านเริ่มต้น</h3>
                  <input
                    type="text"
                    required
                    placeholder="รหัสบุคลากร (เช่น T004)"
                    value={newStaffForm.Staff_ID}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, Staff_ID: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    required
                    placeholder="ชื่อ-นามสกุล พร้อมตำแหน่งทางวิชาการ"
                    value={newStaffForm.Full_Name}
                    onChange={(e) =>
                      setNewStaffForm({ ...newStaffForm, Full_Name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                  <select
                    value={newStaffForm.Department}
                    onChange={(e) =>
                      setNewStaffForm({ ...newStaffForm, Department: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  >
                    <option value="วิทยาการคอมพิวเตอร์">วิทยาการคอมพิวเตอร์</option>
                    <option value="เทคโนโลยีสารสนเทศ">เทคโนโลยีสารสนเทศ</option>
                    <option value="วิทยาการข้อมูล">วิทยาการข้อมูล</option>
                  </select>
                  <select
                    value={newStaffForm.Role}
                    onChange={(e) =>
                      setNewStaffForm({
                        ...newStaffForm,
                        Role: e.target.value as StaffMember["Role"],
                      })
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
                    onChange={(e) =>
                      setNewStaffForm({ ...newStaffForm, Password: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
                  >
                    บันทึกบุคลากรลงฐานข้อมูล
                  </button>
                </form>

                <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-base">รายชื่อบุคลากรในระบบทั้งหมด</h3>
                  {staffList.map((s) => (
                    <div
                      key={s.Staff_ID}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-indigo-600">{s.Staff_ID}</span> •{" "}
                        <span className="font-semibold">{s.Full_Name}</span> ({s.Department})
                      </div>
                      <span className="px-2.5 py-1 rounded bg-slate-100 font-semibold">
                        {s.Role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ตั้งค่าระบบ */}
            {adminMenu === "SETTINGS" && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
                <h2 className="text-xl font-bold">ตั้งค่าการซิงค์ฐานข้อมูล Google Sheets & PWA</h2>
                <p className="text-sm text-slate-600">
                  สถานะปัจจุบัน: เปิดใช้งาน Optimistic Real-time Sync ร่วมกับ Google Apps Script Web App
                </p>
                <button
                  onClick={syncWithGoogleSheets}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>ซิงค์ข้อมูลจาก Google Sheets ทันที</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 1: หน้าต่างล็อกอิน (แสดงรหัสทดสอบให้พร้อมใช้งานทันที)
         ==================================================================== */}
      {loginModalRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-indigo-50 text-indigo-700">
                  {loginModalRole} LOGIN
                </span>
                <h3 className="text-xl font-bold mt-1">
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
                className="p-2 rounded-full hover:bg-slate-100"
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
                  placeholder="เช่น T001, E001 หรือ ADMIN"
                  value={loginStaffId}
                  onChange={(e) => setLoginStaffId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50"
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
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors"
              >
                เข้าสู่ระบบ
              </button>
            </form>

            {/* กล่องช่วยกรอกรหัสทดสอบอัตโนมัติในคลิกเดียว */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <p className="font-bold text-slate-700">💡 คลิกเพื่อเติมรหัสทดสอบอัตโนมัติ:</p>
              <div className="flex flex-wrap gap-1.5">
                {loginModalRole === "INSTRUCTOR" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("T001");
                        setLoginPassword("123456");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400"
                    >
                      อาจารย์ T001 (รหัส 123456)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("T002");
                        setLoginPassword("123456");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400"
                    >
                      อาจารย์ T002 (รหัส 123456)
                    </button>
                  </>
                )}
                {loginModalRole === "EXECUTIVE" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("E001");
                        setLoginPassword("exec123");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400"
                    >
                      หน.สาขาวิทยาการคอมฯ E001
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginStaffId("E002");
                        setLoginPassword("exec123");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400"
                    >
                      หน.สาขาไอที E002
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
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400"
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
          MODAL 2: หน้าต่างอ่าน E-Book (สำหรับ PDF) หรือหน้าพรีวิวลิงก์ (สำหรับไลฟ์สด/ลิงก์)
         ==================================================================== */}
      {selectedWorkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200">
                  {selectedWorkModal.Work_Type === "PDF"
                    ? "Interactive E-Book Reader Mode"
                    : "External Live / Link Preview"}
                </span>
                <h3 className="font-bold text-base sm:text-lg mt-0.5">
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

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {selectedWorkModal.Work_Type === "PDF" ? (
                /* โหมดอ่าน E-Book สำหรับไฟล์ PDF */
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-2xl p-4 sm:p-6 border border-slate-200 min-h-[380px] flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs text-slate-500">
                      <span>ผู้แต่ง: {selectedWorkModal.Instructor_Name}</span>
                      <span>หน้าที่ {ebookPage} จาก 3 (ตัวอย่างโหมด E-Book)</span>
                    </div>

                    <div className="my-auto py-6 px-4 sm:px-10 bg-white rounded-xl shadow-inner border border-slate-200/80 min-h-[250px] flex flex-col justify-center">
                      {ebookPage === 1 && (
                        <div className="text-center space-y-3">
                          <BookOpen className="w-12 h-12 text-indigo-600 mx-auto" />
                          <h4 className="text-xl font-bold text-slate-900">
                            {selectedWorkModal.Title}
                          </h4>
                          <p className="text-sm text-slate-600">
                            โดย {selectedWorkModal.Instructor_Name} • สาขา{selectedWorkModal.Department}
                          </p>
                          <p className="text-xs text-slate-500 max-w-lg mx-auto">
                            {selectedWorkModal.Description}
                          </p>
                        </div>
                      )}
                      {ebookPage === 2 && (
                        <div className="space-y-3">
                          <h5 className="font-bold text-base text-indigo-600">
                            บทนำและสาระสำคัญของเอกสาร
                          </h5>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {selectedWorkModal.Description} เอกสารฉบับนี้ถูกจัดทำขึ้นในรูปแบบหนังสืออิเล็กทรอนิกส์ (E-Book)
                            เพื่อให้นักศึกษาและบุคลากรสามารถศึกษาค้นคว้าได้ทุกที่ทุกเวลาผ่านระบบคลังข้อมูลออนไลน์
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
                          <h5 className="font-bold text-base text-slate-900">
                            ต้องการอ่านฉบับเต็มหรือบันทึกเก็บไว้ในเครื่อง?
                          </h5>
                          <p className="text-xs text-slate-500">
                            คุณสามารถกดปุ่มดาวน์โหลดไฟล์ PDF ด้านล่างเพื่อนำไปอ่านแบบออฟไลน์ได้ทันที
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ปุ่มพลิกหน้า E-Book */}
                    <div className="flex items-center justify-between pt-3">
                      <button
                        disabled={ebookPage <= 1}
                        onClick={() => setEbookPage((p) => Math.max(1, p - 1))}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" /> หน้าก่อนหน้า
                      </button>
                      <button
                        disabled={ebookPage >= 3}
                        onClick={() => setEbookPage((p) => Math.min(3, p + 1))}
                        className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold disabled:opacity-40"
                      >
                        หน้าถัดไป <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      อัปเดตเมื่อ {selectedWorkModal.Updated_At} • ดาวน์โหลดแล้ว{" "}
                      {selectedWorkModal.Downloads} ครั้ง
                    </div>
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
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>เปิดอ่านเต็มจอ / ดาวน์โหลดไฟล์ PDF</span>
                    </a>
                  </div>
                </div>
              ) : (
                /* โหมดหน้าพรีวิวสำหรับลิงก์ไลฟ์สด หรือเว็บไซต์ภายนอก */
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700">
                        หน้าพรีวิวลิงก์สื่อการสอน / ไลฟ์สดภายนอก
                      </p>
                      <h4 className="font-bold text-lg text-slate-900">
                        {selectedWorkModal.Title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedWorkModal.Description}
                  </p>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 break-all">
                    ลิงก์ปลายทาง: {selectedWorkModal.File_Or_Link_URL}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <a
                      href={selectedWorkModal.File_Or_Link_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm"
                    >
                      <span>กดเพื่อไปยังลิงก์นี้</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}