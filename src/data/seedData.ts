import teachersData from "./teachers.json";

export interface DegreeInfo {
  level: string;
  year: string;
  degree: string;
  major: string;
  institution: string;
}

export interface TeacherInfo {
  id: string;
  name: string;
  program: string;
  degrees: DegreeInfo[];
}

export interface StaffMember {
  Staff_ID: string;
  Full_Name: string;
  Department: string;
  Role: "INSTRUCTOR" | "EXECUTIVE" | "ADMIN";
  Password: string;
  Is_Default_Pwd: boolean;
}

export interface InstructorPlanRecord {
  Record_ID: string;
  Staff_ID: string;
  Full_Name: string;
  Department: string;
  Academic_Year: number;
  Course_Code: string;
  Course_Name: string;
  Teaching_Method: string;
  Target_KPI: string;
  Teaching_Summary: string;
  Research_Output: string;
  Ebook_Planned: string;
  Additional_Notes: string;
  Updated_At: string;
}

export interface ExecutivePlanRecord {
  Exec_ID: string;
  Staff_ID: string;
  Executive_Name: string;
  Department: string;
  Academic_Year: number;
  Curriculum_Status: string;
  Faculty_Count: number;
  Total_Graduates: number;
  Quality_Score: number;
  Strategic_Plan_2570_2574: string;
  Budget_Needs: string;
  Issues_Found: string;
  Updated_At: string;
}

export interface PortfolioWork {
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

export const EDUCATION_PROGRAMS = [
  "สาขาวิชาอิสลามศึกษา",
  "สาขาวิชาภาษาอาหรับ",
  "สาขาวิชาวิทยาศาสตร์ทั่วไป",
  "สาขาวิชาเคมี",
  "สาขาวิชาภาษาอังกฤษ",
  "สาขาวิชาภาษามลายูและเทคโนโลยีการศึกษา",
  "สาขาวิชาการศึกษาปฐมวัย",
  "สาขาวิชาชีพครู",
  "สาขาวิชาวิทยาการทางการศึกษาและนวัตกรรมการจัดการเรียนรู้",
  "สาขาวิชาการบริหารการศึกษา",
  "ป.โท การสอนภาษาอังกฤษ",
  "สาขาวิชาการศึกษา"
];

export const INITIAL_TEACHERS: TeacherInfo[] = teachersData as TeacherInfo[];

// สร้างรายชื่อ Staff อัตโนมัติจากอาจารย์ 67 ท่าน + หัวหน้าสาขา 12 สาขา + แอดมิน
export const INITIAL_STAFF: StaffMember[] = [
  ...INITIAL_TEACHERS.map((t, idx) => ({
    Staff_ID: t.id,
    Full_Name: t.name,
    Department: t.program,
    Role: "INSTRUCTOR" as const,
    Password: "123456",
    Is_Default_Pwd: true,
  })),
  ...EDUCATION_PROGRAMS.map((prog, idx) => ({
    Staff_ID: `HEAD-${String(idx + 1).padStart(2, "0")}`,
    Full_Name: `หัวหน้า${prog}`,
    Department: prog,
    Role: "EXECUTIVE" as const,
    Password: "exec123",
    Is_Default_Pwd: false,
  })),
  {
    Staff_ID: "ADMIN",
    Full_Name: "ผู้ดูแลระบบ คณะศึกษาศาสตร์ (Admin)",
    Department: "สำนักงานคณบดี",
    Role: "ADMIN",
    Password: "admin999",
    Is_Default_Pwd: false,
  },
];

export const INITIAL_PORTFOLIO_WORKS: PortfolioWork[] = [
  {
    Work_ID: "WRK-EDU-01",
    Staff_ID: "EDU-001",
    Instructor_Name: "ซอลีฮะห์ หะยีสะมะแอ",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2570,
    Title: "คู่มือการจัดการเรียนรู้อิสลามศึกษาเชิงบูรณาการ (E-Book ฉบับสมบูรณ์)",
    Category: "ตำรา / E-Book",
    Work_Type: "PDF",
    File_Or_Link_URL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    Description: "หนังสืออิเล็กทรอนิกส์สำหรับครูผู้สอนอิสลามศึกษา รวบรวมแนวคิดการจัดการเรียนรู้เชิงรุก (Active Learning) ร่วมกับหลักสูตรแกนกลาง",
    Is_Public: true,
    Downloads: 324,
    Updated_At: "2026-10-10",
  },
  {
    Work_ID: "WRK-EDU-02",
    Staff_ID: "EDU-002",
    Instructor_Name: "มะซีดิ สาแล",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2571,
    Title: "เทคนิคการวิจัยเชิงคุณภาพทางอิสลามศึกษาและปรัชญาการศึกษา",
    Category: "งานวิจัย / เอกสารวิชาการ",
    Work_Type: "PDF",
    File_Or_Link_URL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    Description: "เอกสารประกอบการสอนวิจัยระดับบัณฑิตศึกษา เน้นการวิเคราะห์เชิงลึกและการเทียบเคียงทัศนะ",
    Is_Public: true,
    Downloads: 215,
    Updated_At: "2026-10-11",
  },
  {
    Work_ID: "WRK-EDU-03",
    Staff_ID: "EDU-004",
    Instructor_Name: "ยะหะยา นิแว",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2571,
    Title: "บันทึกการสอนสด (Live Stream): การบริหารจัดการชั้นเรียนยุคดิจิทัล",
    Category: "สื่อการสอนไลฟ์สด / วิดีโอ",
    Work_Type: "LINK",
    File_Or_Link_URL: "https://www.youtube.com",
    Description: "การบรรยายพิเศษสาธิตการใช้เทคโนโลยีดิจิทัลและแอปพลิเคชันเพื่อการจัดการชั้นเรียนและประเมินผลผู้เรียน",
    Is_Public: true,
    Downloads: 189,
    Updated_At: "2026-10-12",
  },
  {
    Work_ID: "WRK-EDU-04",
    Staff_ID: "EDU-005",
    Instructor_Name: "อับดุลรอฮมาน สามะอาลี",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2572,
    Title: "นวัตกรรมการพัฒนาทรัพยากรมนุษย์ตามแนวทางอิสลามศึกษา",
    Category: "ตำรา / E-Book",
    Work_Type: "PDF",
    File_Or_Link_URL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    Description: "E-Book ถ่ายทอดผลการศึกษาและประสบการณ์วิจัยจากมหาวิทยาลัยชั้นนำในต่างประเทศ",
    Is_Public: true,
    Downloads: 142,
    Updated_At: "2026-10-13",
  },
  {
    Work_ID: "WRK-EDU-05",
    Staff_ID: "EDU-001",
    Instructor_Name: "ซอลีฮะห์ หะยีสะมะแอ",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2572,
    Title: "เอกสารร่างแบบฝึกทักษะภาษาอังกฤษเพื่อการสื่อสารครู (ฉบับภายใน)",
    Category: "เอกสารภายใน",
    Work_Type: "PDF",
    File_Or_Link_URL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    Description: "เอกสารพัฒนาทักษะภาษาอังกฤษสำหรับนักศึกษาครู (ตั้งค่าเป็นเอกสารภายใน ไม่เผยแพร่สาธารณะ)",
    Is_Public: false,
    Downloads: 15,
    Updated_At: "2026-10-14",
  },
];

export const INITIAL_INSTRUCTOR_FORMS: InstructorPlanRecord[] = [
  {
    Record_ID: "PLAN-INST-101",
    Staff_ID: "EDU-001",
    Full_Name: "ซอลีฮะห์ หะยีสะมะแอ",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2570,
    Course_Code: "ED101",
    Course_Name: "ปรัชญาและหลักการศึกษาอิสลาม",
    Teaching_Method: "Active Learning ร่วมกับโครงงานเป็นฐาน (PBL) และการสะท้อนคิด",
    Target_KPI: "นักศึกษามีผลสัมฤทธิ์ระดับ B ขึ้นไปไม่น้อยกว่าร้อยละ 85",
    Teaching_Summary: "จัดการเรียนการสอนเน้นการวิเคราะห์กรณีศึกษาจริงในโรงเรียนเครือข่าย",
    Research_Output: "บทความวิจัยระดับชาติด้านการบูรณาการหลักสูตร 1 เรื่อง",
    Ebook_Planned: "จัดทำ E-Book คู่มือการจัดการเรียนรู้ 1 เล่ม",
    Additional_Notes: "ขอรับการสนับสนุนเครื่องฉายภาพโปรเจกเตอร์สำหรับห้องเรียนร่วม",
    Updated_At: "2026-10-12",
  },
  {
    Record_ID: "PLAN-INST-102",
    Staff_ID: "EDU-002",
    Full_Name: "มะซีดิ สาแล",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2571,
    Course_Code: "ED202",
    Course_Name: "ระเบียบวิธีวิจัยขั้นสูงทางการศึกษา",
    Teaching_Method: "Research-based Learning ผสานระบบสืบค้นสารสนเทศออนไลน์",
    Target_KPI: "นักศึกษาทุกคนส่งเค้าโครงวิจัยที่มีคุณภาพตามเกณฑ์",
    Teaching_Summary: "นักศึกษาสามารถร่างข้อเสนอโครงการวิจัยที่ตอบโจทย์ชุมชนท้องถิ่น",
    Research_Output: "บทความตีพิมพ์ระดับนานาชาติในฐานข้อมูล Scopus 1 เรื่อง",
    Ebook_Planned: "จัดทำ E-Book เทคนิคการวิจัยเชิงคุณภาพ 1 เล่ม",
    Additional_Notes: "-",
    Updated_At: "2026-10-13",
  },
  {
    Record_ID: "PLAN-INST-103",
    Staff_ID: "EDU-004",
    Full_Name: "ยะหะยา นิแว",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2572,
    Course_Code: "ED305",
    Course_Name: "นวัตกรรมและการบริหารจัดการสถานศึกษา",
    Teaching_Method: "การจำลองสถานการณ์บริหารและการบรรยายสดร่วมกับผู้บริหารสถานศึกษาจริง",
    Target_KPI: "ร้อยละ 90 ของผู้เรียนผ่านการประเมินทักษะการตัดสินใจเชิงบริหาร",
    Teaching_Summary: "จัดกิจกรรมศึกษาดูงานและการบรรยายออนไลน์แบบเปิดกว้าง",
    Research_Output: "การพัฒนาโมเดลบริหารสถานศึกษาเอกชนสอนศาสนา",
    Ebook_Planned: "สื่อวิดีโอคลิปบรรยายสรุปและเอกสารพรีวิวออนไลน์",
    Additional_Notes: "-",
    Updated_At: "2026-10-14",
  },
];

export const INITIAL_EXECUTIVE_FORMS: ExecutivePlanRecord[] = [
  {
    Exec_ID: "PLAN-EXEC-301",
    Staff_ID: "HEAD-01",
    Executive_Name: "หัวหน้าสาขาวิชาอิสลามศึกษา",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2570,
    Curriculum_Status: "ผ่านการรับรองมาตรฐานหลักสูตรตามเกณฑ์ AUN-QA",
    Faculty_Count: 8,
    Total_Graduates: 95,
    Quality_Score: 4.82,
    Strategic_Plan_2570_2574: "ยกระดับอาจารย์ประจำหลักสูตรให้ผลิตสื่อ E-Book ครบทุกรายวิชาแกน และผลักดันผลงานวิจัยสู่ฐานข้อมูลระดับชาติ",
    Budget_Needs: "งบประมาณสนับสนุนการตีพิมพ์วารสารวิชาการและการจัดอบรมเทคโนโลยีดิจิทัลเพื่อการสอน",
    Issues_Found: "ต้องการระบบจัดเก็บและเผยแพร่ผลงานวิชาการดิจิทัลส่วนกลางของคณะ",
    Updated_At: "2026-10-12",
  },
  {
    Exec_ID: "PLAN-EXEC-302",
    Staff_ID: "HEAD-02",
    Executive_Name: "หัวหน้าสาขาวิชาภาษาอาหรับ",
    Department: "สาขาวิชาภาษาอาหรับ",
    Academic_Year: 2571,
    Curriculum_Status: "ปรับปรุงหลักสูตรตามกรอบมาตรฐานคุณวุฒิระดับอุดมศึกษา",
    Faculty_Count: 6,
    Total_Graduates: 65,
    Quality_Score: 4.70,
    Strategic_Plan_2570_2574: "สร้างความร่วมมือทางวิชาการกับมหาวิทยาลัยในกลุ่มประเทศอาหรับ และพัฒนานวัตกรรมสื่อการสอนภาษาอาหรับเพื่อวิชาชีพครู",
    Budget_Needs: "งบประมาณเชิญผู้เชี่ยวชาญภาษาอาหรับเจ้าของภาษามาบรรยายพิเศษ",
    Issues_Found: "ไม่มี",
    Updated_At: "2026-10-13",
  },
];
