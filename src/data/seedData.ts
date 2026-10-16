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
  // รองรับการสับเปลี่ยนตำแหน่งหัวหน้าสาขาวิชา / ผู้บริหาร (สามารถเข้าได้ทั้งโหมดอาจารย์และโหมดผู้บริหาร)
  Is_Executive_Assigned?: boolean;
  Executive_Position?: string; // เช่น "หัวหน้าสาขาวิชา", "คณบดี/รองคณบดี", "ผู้บริหารคณะ"
  Managed_Department?: string; // สาขาวิชาที่ดูแล
  Can_View_All_Departments?: boolean; // สิทธิ์ดูแดชบอร์ดภาพรวมทั้งคณะ 12 สาขา
}

export interface InstructorPlanRecord {
  Record_ID: string;
  Staff_ID: string;
  Full_Name: string;
  Department: string;
  Academic_Year: number;
  Course_Code: string;
  Course_Name: string;
  // หัวข้อ 1: การจัดการเรียนการสอน
  Teaching_Method: string;
  Target_KPI: string;
  Teaching_Summary: string;
  // หัวข้อ 2: ผลงานวิจัย
  Research_Output: string;
  // หัวข้อ 3: สื่อการสอนและ E-Book
  Ebook_Planned: string;
  // หัวข้อ 4: การพัฒนาตนเอง/บริการวิชาการ
  Self_Development: string;
  // หัวข้อ 5: งบประมาณและการสนับสนุน
  Budget_Requested: string;
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

// โครงสร้างแบบสำรวจข้อมูลเบื้องต้นเพื่อจัดทำแผนประจำปีการศึกษา 2570–2574 คณะศึกษาศาสตร์ (สำหรับผู้บริหาร / หัวหน้าสาขาวิชา)
export interface ExecutiveSurveyPlan {
  Exec_Survey_ID: string;
  Department: string;
  Updated_By_Staff_ID: string;
  Updated_By_Name: string;
  Program_Level: string; // ปริญญาตรี, ประกาศนียบัตร, ปริญญาโท, ปริญญาเอก, ปริญญาโท+เอก

  // หมวด 1: ข้อมูลการรับนักศึกษาใหม่ (2570-2574)
  student_intake_targets: { [year: string]: number }; // 2570..2574 -> จำนวนคน
  student_intake_by_type: {
    quota: number; // รับสมัครเรียนแบบโควตา (Quota Sampling)
    portfolio: number; // รับสมัครเรียนแบบ Portfolio (พอร์ตโฟลิโอ)
    regular: number; // รับสมัครเรียนแบบปกติ
    other: number; // อื่น ๆ
  };

  // หมวด 2: ข้อมูลด้านงานวิจัยของสาขาวิชา (2570-2574)
  research_classroom: number;
  research_education: number;
  research_development: number;
  research_other: number;
  research_funding_sources: { [fundName: string]: number[] };
  research_budgets: { [year: string]: string };

  // หมวด 3: ข้อมูลด้านบริการวิชาการของสาขาวิชา (2570-2574)
  academic_services_count: { [year: string]: number };
  target_communities: { [commName: string]: number[] };
  selection_criteria_weights: { [criteriaName: string]: string }; // 10 ข้อ -> 10%..100%

  // หมวด 4: ด้านบุคลากรสายวิชาการ (แผนรับเพิ่ม 2570-2574)
  staff_recruitment_total: { [year: string]: number };
  staff_recruitment_master: { [year: string]: number };
  staff_recruitment_doctoral: { [year: string]: number };
  staff_recruitment_adjunct: { [year: string]: number };

  // หมวด 5: ข้อเสนอแนะ
  suggestions: string;

  Is_Submitted: boolean;
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

// โครงสร้างแบบสำรวจข้อมูลเบื้องต้นเพื่อจัดทำแผนประจำปีการศึกษา 2570–2574 (อาจารย์ คณะศึกษาศาสตร์)
export interface TeacherSurveyPlan {
  Survey_ID: string;
  Staff_ID: string;
  Full_Name: string;
  Department: string;
  Degree_Level: string;

  // หมวด 1: ข้อมูลด้านงานวิจัย
  research_classroom: number;
  research_education: number;
  research_development: number;
  research_other: number;
  research_other_specify: string;
  research_funding_sources: { [fundName: string]: number[] };
  research_funding_other_specify: string;
  research_budgets: { [year: string]: string };

  // หมวด 2: ข้อมูลด้านการเรียนการสอน
  teaching_load: { [sem: string]: string };
  fieldwork_presence: { [sem: string]: string };
  fieldwork_agencies: { [sem: string]: string };
  fieldwork_agency_other_specify: string;

  // หมวด 3: ข้อมูลด้านบริการวิชาการ
  academic_services_count: { [year: string]: number };
  target_communities: { [commName: string]: number[] };
  target_community_other_specify: string;
  selection_criteria_percentage: string;

  Is_Submitted: boolean;
  Updated_At: string;
}

export const GOOGLE_FORM_INSTRUCTOR_URL = "https://forms.gle/Ycbv8WByAnGdNvaA9";
export const GOOGLE_FORM_EXECUTIVE_URL = "https://forms.gle/uMUJA4XqC33Jiv5p9";
export const SHEET_TEACHER_HISTORY_URL = "https://docs.google.com/spreadsheets/d/1ylS_eLE-1lCvH482NnYHjmuo9KHB7o_uCMKcUDRDFyw/edit?gid=1839438727#gid=1839438727";

export const SURVEY_YEARS = [2570, 2571, 2572, 2573, 2574];
export const TEACHING_LOAD_SEMESTERS = ["1/2568", "2/2568", "1/2569", "2/2569"];
export const FIELDWORK_SEMESTERS = ["1/2568", "2/2568", "1/2569", "2/2569", "1/2570", "2/2570"];

export const EXEC_PROGRAM_LEVEL_OPTIONS = [
  "ปริญญาตรี",
  "ประกาศนียบัตร",
  "ปริญญาโท",
  "ปริญญาเอก",
  "ปริญญาโท+เอก",
];

export const EXEC_STUDENT_INTAKE_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 90, 150];
export const EXEC_ADMISSION_TYPE_OPTIONS = [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 90];

export const EXEC_SELECTION_CRITERIA_LIST = [
  "ความต้องการและปัญหาที่แท้จริงของชุมชน",
  "ความสอดคล้องกับพันธกิจและความเชี่ยวชาญของสาขาวิชา",
  "ความสอดคล้องกับยุทธศาสตร์ของคณะและมหาวิทยาลัย",
  "ความสอดคล้องกับอัตลักษณ์และหลักการบูรณาการอิสลาม",
  "ความจำเป็นเร่งด่วนของชุมชน",
  "จำนวนประชาชนหรือผู้เรียนที่ได้รับประโยชน์",
  "ความพร้อมและความร่วมมือของหน่วยงานหรือชุมชน",
  "ความต่อเนื่องและความยั่งยืนของการดำเนินงาน",
  "การขยายผลจากโครงการบริการวิชาการที่ผ่านมา",
  "อื่น ๆ",
];

export const RESEARCH_FUND_OPTIONS = [
  "ทุนคณะศึกษาศาสตร์",
  "ทุนมหาวิทยาลัยฟาฏอนี",
  "สำนักงานการวิจัยแห่งชาติ (วช.)",
  "หน่วยบริหารจัดการทุนด้านการพัฒนากำลังคนและทุนด้านการพัฒนาสถาบันอุดมศึกษาและการสร้างนวัตกรรม (บพค.)",
  "หน่วยบริหารและจัดการทุนด้านเพิ่มความสามารถการแข่งขันของประเทศ (บพข.)",
  "หน่วยบริหารและจัดการทุนพัฒนาระดับพื้นที่ (บพท.)",
  "สำนักงานคณะกรรมการส่งเสริมวิทยาศาสตร์ วิจัยและนวัตกรรม (สกสว.)",
  "สถาบันวิจัยเพื่อความเป็นเลิศทางวิชาการ/สถาบันวิจัยของมหาวิทยาลัยอื่น ๆ",
  "หน่วยงานวิจัยหรือองค์กรวิชาชีพด้านการศึกษา",
  "องค์กรปกครองส่วนท้องถิ่นและหน่วยงานภาคีในพื้นที่",
  "อื่น ๆ"
];

export const RESEARCH_BUDGET_RANGES = [
  "10,000-50,000",
  "50,001-300,000",
  "300,001-500,000",
  "500,001-1,000,000",
  "1,000,001 ขึ้นไป"
];

export const TEACHING_LOAD_OPTIONS = [
  "น้อยกว่า 6 ชั่วโมง/สัปดาห์",
  "6-9 ชั่วโมง/สัปดาห์",
  "10-12 ชั่วโมง/สัปดาห์",
  "13-16 ชั่วโมง/สัปดาห์",
  "17-20 ชั่วโมง/สัปดาห์",
  "มากกว่า 20 ชั่วโมง/สัปดาห์"
];

export const FIELDWORK_AGENCY_OPTIONS = [
  "โรงเรียนของรัฐ",
  "โรงเรียนเอกชน",
  "หน่วยงานทางการศึกษาของรัฐ",
  "หน่วยงานทางการศึกษาเอกชน",
  "อื่น ๆ"
];

export const TARGET_COMMUNITY_OPTIONS = [
  "โรงเรียนรัฐบาล",
  "โรงเรียนเอกชน",
  "โรงเรียนเอกชนสอนศาสนาอิสลาม",
  "โรงเรียนตาดีกา",
  "ศูนย์การศึกษาอิสลามประจำมัสยิด",
  "ครูและบุคลากรทางการศึกษา",
  "นักเรียนระดับประถมศึกษา",
  "นักเรียนระดับมัธยมศึกษา",
  "นักศึกษาและเยาวชน",
  "ผู้นำชุมชนและผู้นำศาสนา",
  "ผู้ปกครองและประชาชนทั่วไป",
  "องค์กรปกครองส่วนท้องถิ่น",
  "อื่น ๆ"
];

export const CRITERIA_PERCENTAGE_OPTIONS = [
  "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"
];

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

export const SURVEY_TOPICS = [
  {
    id: "TEACHING",
    title: "1. การจัดการเรียนการสอนและผลลัพธ์การเรียนรู้",
    desc: "รายวิชาที่รับผิดชอบ รูปแบบ Active Learning และเกณฑ์ประเมิน KPI ของผู้เรียน",
    badge: "การสอน & KPI"
  },
  {
    id: "RESEARCH",
    title: "2. ผลงานวิจัย นวัตกรรม และบทความวิชาการ",
    desc: "แผนการตีพิมพ์บทความวิจัยระดับชาติ/นานาชาติ และนวัตกรรมการจัดการศึกษา",
    badge: "วิจัย & บทความ"
  },
  {
    id: "EBOOK",
    title: "3. การผลิตสื่อดิจิทัลและหนังสืออิเล็กทรอนิกส์ (E-Book)",
    desc: "แผนพัฒนาตำรา เอกสารประกอบการสอน และคลังสื่อออนไลน์ที่เปิดให้นักศึกษาเข้าถึง",
    badge: "สื่อดิจิทัล & E-Book"
  },
  {
    id: "DEVELOPMENT",
    title: "4. การพัฒนาตนเองและการบริการวิชาการแก่ชุมชน",
    desc: "การอบรมเพิ่มพูนทักษะวิชาชีพ และโครงการบริการวิชาการเพื่อพัฒนาท้องถิ่น",
    badge: "พัฒนาตนเอง & ชุมชน"
  },
  {
    id: "BUDGET",
    title: "5. ทรัพยากรและงบประมาณที่ต้องการขอรับการสนับสนุน",
    desc: "อุปกรณ์ห้องปฏิบัติการ เทคโนโลยีการสอน และงบประมาณสนับสนุนทางวิชาการ",
    badge: "งบประมาณ & ครุภัณฑ์"
  }
];

export const INITIAL_TEACHERS: TeacherInfo[] = teachersData as TeacherInfo[];

// หาอาจารย์คนแรกของแต่ละสาขาเพื่อให้เป็นตัวแทนหัวหน้าสาขาเริ่มต้น (สามารถสับเปลี่ยนได้ตลอดเวลา)
const firstTeacherByProgram = new Map<string, string>();
INITIAL_TEACHERS.forEach((t) => {
  if (!firstTeacherByProgram.has(t.program)) {
    firstTeacherByProgram.set(t.program, t.id);
  }
});

// สร้างรายชื่อ Staff อัตโนมัติจากอาจารย์ 67 ท่าน + หัวหน้าสาขา 12 สาขา + แอดมิน
export const INITIAL_STAFF: StaffMember[] = [
  ...INITIAL_TEACHERS.map((t) => {
    const isInitialHead = firstTeacherByProgram.get(t.program) === t.id;
    return {
      Staff_ID: t.id,
      Full_Name: t.name,
      Department: t.program,
      Role: "INSTRUCTOR" as const,
      Password: "123456",
      Is_Default_Pwd: true,
      Is_Executive_Assigned: isInitialHead,
      Executive_Position: isInitialHead ? `หัวหน้า${t.program}` : "",
      Managed_Department: t.program,
      Can_View_All_Departments: true,
    };
  }),
  ...EDUCATION_PROGRAMS.map((prog, idx) => ({
    Staff_ID: `HEAD-${String(idx + 1).padStart(2, "0")}`,
    Full_Name: `หัวหน้า${prog}`,
    Department: prog,
    Role: "EXECUTIVE" as const,
    Password: "exec123",
    Is_Default_Pwd: false,
    Is_Executive_Assigned: true,
    Executive_Position: `หัวหน้า${prog}`,
    Managed_Department: prog,
    Can_View_All_Departments: true,
  })),
  {
    Staff_ID: "ADMIN",
    Full_Name: "ผู้ดูแลระบบ คณะศึกษาศาสตร์ (Admin)",
    Department: "สำนักงานคณบดี",
    Role: "ADMIN",
    Password: "admin999",
    Is_Default_Pwd: false,
    Is_Executive_Assigned: true,
    Executive_Position: "ผู้บริหารและผู้ดูแลระบบคณะ",
    Managed_Department: EDUCATION_PROGRAMS[0],
    Can_View_All_Departments: true,
  },
];

export const INITIAL_INSTRUCTOR_FORMS: InstructorPlanRecord[] = [
  {
    Record_ID: "REC-2568-01",
    Staff_ID: "EDU-001",
    Full_Name: "ซอลีฮะห์ หะยีสะมะแอ",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2568,
    Course_Code: "IS101",
    Course_Name: "ประวัติศาสตร์และพัฒนาการการศึกษาอิสลาม",
    Teaching_Method: "Active Learning บูรณาการกรณีศึกษาจริงและการอภิปรายกลุ่มย่อย",
    Target_KPI: "ผู้เรียนร้อยละ 88 มีผลการเรียนระดับ B ขึ้นไป และผ่านเกณฑ์ประเมินทักษะศตวรรษที่ 21",
    Teaching_Summary: "นักศึกษามีส่วนร่วมในการวิเคราะห์แหล่งเรียนรู้ประวัติศาสตร์ท้องถิ่นชายแดนใต้",
    Research_Output: "รายงานวิจัยเบื้องต้น: การจัดการศึกษาอิสลามในศตวรรษใหม่",
    Ebook_Planned: "เอกสารประกอบการสอนรายวิชา IS101 ในรูปแบบ PDF สรุปบทเรียน",
    Self_Development: "เข้าร่วมการอบรมการประยุกต์ใช้ AI เพื่อการวิจัยทางมนุษยศาสตร์",
    Budget_Requested: "งบประมาณจัดซื้อหนังสืออ้างอิงภาษาอาหรับและมลายู 15,000 บาท",
    Additional_Notes: "ระบบประเมินผลผ่านเกณฑ์มาตรฐานของหลักสูตร",
    Updated_At: "2568-10-15",
  },
  {
    Record_ID: "REC-2569-01",
    Staff_ID: "EDU-001",
    Full_Name: "ซอลีฮะห์ หะยีสะมะแอ",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2569,
    Course_Code: "IS204",
    Course_Name: "นวัตกรรมการสอนภาษาและการสื่อสารเพื่อครูอิสลามศึกษา",
    Teaching_Method: "โครงงานเป็นฐาน (PBL) และการจำลองสถานการณ์สอนจริง (Micro-teaching)",
    Target_KPI: "นักศึกษาร้อยละ 92 ผ่านการประเมินทักษะการสอนจริงในระดับดีมาก",
    Teaching_Summary: "นักศึกษาจัดทำสื่อการสอนจำลองและทดลองสอนในโรงเรียนเครือข่าย",
    Research_Output: "บทความวิจัยตีพิมพ์ในวารสาร TCI กลุ่ม 1 จำนวน 1 เรื่อง",
    Ebook_Planned: "จัดทำ E-Book คู่มือการจัดการเรียนรู้อิสลามศึกษาเชิงบูรณาการ 1 เล่ม",
    Self_Development: "อบรมเชิงปฏิบัติการการสร้างสื่อดิจิทัลและหนังสืออิเล็กทรอนิกส์",
    Budget_Requested: "งบสนับสนุนการลงพื้นที่นิเทศและสังเกตการสอนของนักศึกษา 20,000 บาท",
    Additional_Notes: "ผลงาน E-Book ได้รับการเผยแพร่สู่คลังสาธารณะ",
    Updated_At: "2569-09-20",
  },
  {
    Record_ID: "REC-2570-01",
    Staff_ID: "EDU-001",
    Full_Name: "ซอลีฮะห์ หะยีสะมะแอ",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2570,
    Course_Code: "ED101",
    Course_Name: "ปรัชญาและหลักการศึกษาอิสลามร่วมสมัย",
    Teaching_Method: "Active Learning ผสานกระบวนการ Design Thinking และการสะท้อนคิด",
    Target_KPI: "นักศึกษาร้อยละ 90 มีผลสัมฤทธิ์ระดับ B+ ขึ้นไปและผลิตสื่อนวัตกรรมได้",
    Teaching_Summary: "เน้นการพัฒนาทักษะการคิดวิเคราะห์เชิงปรัชญาและการออกแบบหลักสูตรท้องถิ่น",
    Research_Output: "บทความวิจัยตีพิมพ์ระดับนานาชาติในฐานข้อมูล Scopus 1 เรื่อง",
    Ebook_Planned: "จัดทำ E-Book ตำราเรียนปรัชญาการศึกษาอิสลามฉบับสมบูรณ์ (พร้อมเสียงบรรยาย)",
    Self_Development: "นำเสนอผลงานวิชาการในการประชุมนานาชาติ ณ ประเทศมาเลเซีย",
    Budget_Requested: "งบสนับสนุนการเดินทางไปนำเสนอผลงานวิจัยในต่างประเทศ 35,000 บาท",
    Additional_Notes: "แผนระยะ 5 ปี เพื่อยกระดับหลักสูตรสู่มาตรฐานสากล",
    Updated_At: "2570-01-10",
  },
  {
    Record_ID: "REC-2570-02",
    Staff_ID: "EDU-002",
    Full_Name: "มะซีดิ สาแล",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2570,
    Course_Code: "ED202",
    Course_Name: "ระเบียบวิธีวิจัยขั้นสูงทางการศึกษาและเทววิทยา",
    Teaching_Method: "Research-based Learning ผสานระบบสืบค้นสารสนเทศออนไลน์และการสังเคราะห์เอกสาร",
    Target_KPI: "นักศึกษาทุกคนสามารถส่งเค้าโครงวิจัยที่มีคุณภาพตามเกณฑ์บัณฑิตวิทยาลัย",
    Teaching_Summary: "นักศึกษาเรียนรู้กระบวนการวิจัยเชิงคุณภาพและการวิเคราะห์เนื้อหาเชิงลึก",
    Research_Output: "บทความวิจัยตีพิมพ์ในฐานข้อมูล Scopus Q2 จำนวน 1 เรื่อง",
    Ebook_Planned: "จัดทำ E-Book เทคนิคการวิจัยเชิงคุณภาพทางอิสลามศึกษา 1 เล่ม",
    Self_Development: "อบรมหลักสูตรจริยธรรมการวิจัยในมนุษย์และสัตว์ทดลอง",
    Budget_Requested: "งบสนับสนุนค่าแปลและค่าธรรมเนียมการตีพิมพ์วารสารนานาชาติ 30,000 บาท",
    Additional_Notes: "เชื่อมโยงงานวิจัยกับฐานข้อมูลของมหาวิทยาลัยในต่างประเทศ",
    Updated_At: "2570-02-14",
  },
  {
    Record_ID: "REC-2571-01",
    Staff_ID: "EDU-004",
    Full_Name: "ยะหะยา นิแว",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2571,
    Course_Code: "ED305",
    Course_Name: "นวัตกรรมการบริหารและการนิเทศการศึกษา",
    Teaching_Method: "การจำลองสถานการณ์บริหาร (Management Simulation) ร่วมกับการถ่ายทอดสด Live Stream",
    Target_KPI: "ผู้เรียนร้อยละ 88 ผ่านเกณฑ์การประเมินทักษะการตัดสินใจเชิงบริหารสถานศึกษา",
    Teaching_Summary: "จัดการเรียนการสอนแบบไฮบริด เชิญผู้บริหารสถานศึกษาตัวจริงมาร่วมอภิปราย",
    Research_Output: "การพัฒนาโมเดลการบริหารสถานศึกษาเอกชนสอนศาสนาอิสลามสู่ความเป็นเลิศ",
    Ebook_Planned: "บันทึกคลิปวิดีโอการสอนสดและคู่มือดิจิทัลสำหรับผู้บริหารโรงเรียน",
    Self_Development: "ศึกษาดูงานระบบการบริหารจัดการสถานศึกษา ณ ประเทศอินโดนีเซีย",
    Budget_Requested: "งบจัดตั้งห้องสตูดิโอย่อยสำหรับการผลิตสื่อและไลฟ์สดเพื่อการศึกษา 50,000 บาท",
    Additional_Notes: "บูรณาการร่วมกับโครงการบริการวิชาการแก่โรงเรียนในพื้นที่",
    Updated_At: "2571-03-01",
  },
  {
    Record_ID: "REC-2571-02",
    Staff_ID: "EDU-005",
    Full_Name: "อับดุลรอฮมาน สามะอาลี",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2571,
    Course_Code: "ED401",
    Course_Name: "การพัฒนาทรัพยากรมนุษย์และจริยธรรมวิชาชีพครู",
    Teaching_Method: "Value Clarification และการศึกษาดูงานชุมชนต้นแบบด้านคุณธรรม",
    Target_KPI: "นักศึกษาร้อยละ 95 ผ่านการประเมินพฤติกรรมจริยธรรมวิชาชีพครูในเกณฑ์ดีเยี่ยม",
    Teaching_Summary: "เน้นการปลูกฝังจิตวิญญาณความเป็นครูและการอุทิศตนเพื่อสังคม",
    Research_Output: "ตำราวิชาการ: การพัฒนาทรัพยากรมนุษย์ตามแนวทางอิสลามศึกษา",
    Ebook_Planned: "E-Book ถอดบทเรียนครูต้นแบบใน 3 จังหวัดชายแดนภาคใต้",
    Self_Development: "เข้าร่วมสัมมนาวิชาชีพครูระดับชาติ ณ กรุงเทพมหานคร",
    Budget_Requested: "งบจัดทำโครงการค่ายคุณธรรมและจริยธรรมสำหรับนักศึกษาครู 40,000 บาท",
    Additional_Notes: "เตรียมความพร้อมนักศึกษาสู่การทดสอบใบประกอบวิชาชีพครู",
    Updated_At: "2571-04-18",
  }
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
    Downloads: 348,
    Updated_At: "2570-01-15",
  },
  {
    Work_ID: "WRK-EDU-02",
    Staff_ID: "EDU-002",
    Instructor_Name: "มะซีดิ สาแล",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2570,
    Title: "เทคนิคการวิจัยเชิงคุณภาพทางอิสลามศึกษาและปรัชญาการศึกษา",
    Category: "งานวิจัย / เอกสารวิชาการ",
    Work_Type: "PDF",
    File_Or_Link_URL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    Description: "เอกสารประกอบการสอนวิจัยระดับบัณฑิตศึกษา เน้นการวิเคราะห์เชิงลึกและการเทียบเคียงทัศนะ",
    Is_Public: true,
    Downloads: 236,
    Updated_At: "2570-02-20",
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
    Downloads: 198,
    Updated_At: "2571-03-12",
  },
  {
    Work_ID: "WRK-EDU-04",
    Staff_ID: "EDU-005",
    Instructor_Name: "อับดุลรอฮมาน สามะอาลี",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2571,
    Title: "นวัตกรรมการพัฒนาทรัพยากรมนุษย์ตามแนวทางอิสลามศึกษา",
    Category: "ตำรา / E-Book",
    Work_Type: "PDF",
    File_Or_Link_URL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    Description: "E-Book ถ่ายทอดผลการศึกษาและประสบการณ์วิจัยจากมหาวิทยาลัยชั้นนำในต่างประเทศ",
    Is_Public: true,
    Downloads: 165,
    Updated_At: "2571-04-25",
  },
  {
    Work_ID: "WRK-EDU-05",
    Staff_ID: "EDU-001",
    Instructor_Name: "ซอลีฮะห์ หะยีสะมะแอ",
    Department: "สาขาวิชาอิสลามศึกษา",
    Academic_Year: 2569,
    Title: "เอกสารร่างแบบฝึกทักษะภาษาอังกฤษเพื่อการสื่อสารครู (ฉบับภายใน)",
    Category: "เอกสารภายใน",
    Work_Type: "PDF",
    File_Or_Link_URL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    Description: "เอกสารพัฒนาทักษะภาษาอังกฤษสำหรับนักศึกษาครู (ตั้งค่าเป็นเอกสารภายใน ไม่เผยแพร่สาธารณะ)",
    Is_Public: false,
    Downloads: 18,
    Updated_At: "2569-11-10",
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
    Updated_At: "2570-01-20",
  },
  {
    Exec_ID: "PLAN-EXEC-302",
    Staff_ID: "HEAD-02",
    Executive_Name: "หัวหน้าสาขาวิชาภาษาอาหรับ",
    Department: "สาขาวิชาภาษาอาหรับ",
    Academic_Year: 2570,
    Curriculum_Status: "ปรับปรุงหลักสูตรตามกรอบมาตรฐานคุณวุฒิระดับอุดมศึกษา",
    Faculty_Count: 6,
    Total_Graduates: 65,
    Quality_Score: 4.70,
    Strategic_Plan_2570_2574: "สร้างความร่วมมือทางวิชาการกับมหาวิทยาลัยในกลุ่มประเทศอาหรับ และพัฒนานวัตกรรมสื่อการสอนภาษาอาหรับเพื่อวิชาชีพครู",
    Budget_Needs: "งบประมาณเชิญผู้เชี่ยวชาญภาษาอาหรับเจ้าของภาษามาบรรยายพิเศษ",
    Issues_Found: "ไม่มี",
    Updated_At: "2570-02-15",
  },
];

export function createDefaultSurvey(teacher: TeacherInfo, isSubmitted = false): TeacherSurveyPlan {
  const highestDeg = teacher.degrees && teacher.degrees[0];
  const degText = highestDeg ? `${highestDeg.level} (${highestDeg.degree}) - ${highestDeg.institution}` : "อาจารย์ประจำคณะศึกษาศาสตร์";

  return {
    Survey_ID: `SRV-${teacher.id}`,
    Staff_ID: teacher.id,
    Full_Name: teacher.name,
    Department: teacher.program,
    Degree_Level: degText,

    // หมวด 1: ข้อมูลด้านงานวิจัย
    research_classroom: 2,
    research_education: 1,
    research_development: 1,
    research_other: 0,
    research_other_specify: "",
    research_funding_sources: {
      "ทุนคณะศึกษาศาสตร์": [2570, 2571],
      "สำนักงานการวิจัยแห่งชาติ (วช.)": [2572, 2573],
      "ทุนมหาวิทยาลัยฟาฏอนี": [2571],
    },
    research_funding_other_specify: "",
    research_budgets: {
      "2570": "50,001-300,000",
      "2571": "300,001-500,000",
      "2572": "300,001-500,000",
      "2573": "500,001-1,000,000",
      "2574": "300,001-500,000",
    },

    // หมวด 2: ข้อมูลด้านการเรียนการสอน
    teaching_load: {
      "1/2568": "10-12 ชั่วโมง/สัปดาห์",
      "2/2568": "13-16 ชั่วโมง/สัปดาห์",
      "1/2569": "10-12 ชั่วโมง/สัปดาห์",
      "2/2569": "13-16 ชั่วโมง/สัปดาห์",
    },
    fieldwork_presence: {
      "1/2568": "มี",
      "2/2568": "มี",
      "1/2569": "มี",
      "2/2569": "มี",
      "1/2570": "มี",
      "2/2570": "มี",
    },
    fieldwork_agencies: {
      "1/2568": "โรงเรียนของรัฐ",
      "2/2568": "โรงเรียนเอกชน",
      "1/2569": "โรงเรียนของรัฐ",
      "2/2569": "โรงเรียนเอกชน",
      "1/2570": "โรงเรียนของรัฐ",
      "2/2570": "โรงเรียนเอกชน",
    },
    fieldwork_agency_other_specify: "",

    // หมวด 3: ข้อมูลด้านบริการวิชาการ
    academic_services_count: {
      "2570": 2,
      "2571": 3,
      "2572": 2,
      "2573": 3,
      "2574": 2,
    },
    target_communities: {
      "โรงเรียนรัฐบาล": [2570, 2571],
      "โรงเรียนเอกชนสอนศาสนาอิสลาม": [2570, 2571, 2572],
      "ครูและบุคลากรทางการศึกษา": [2570, 2571, 2572, 2573, 2574],
      "โรงเรียนตาดีกา": [2572, 2574],
    },
    target_community_other_specify: "",
    selection_criteria_percentage: "70%",

    Is_Submitted: isSubmitted,
    Updated_At: "2569-12-20",
  };
}

// ฐานข้อมูลเริ่มต้นสำหรับแบบสำรวจแผน 2570–2574 (สร้างให้คณาจารย์ทั้ง 67 ท่าน)
export const INITIAL_TEACHER_SURVEYS: TeacherSurveyPlan[] = INITIAL_TEACHERS.map((teacher, index) => {
  // ให้ EDU-001 และ EDU-003 ส่งแล้วล่วงหน้า เพื่อเป็นตัวอย่างผลลัพธ์
  const isSubmitted = index === 0 || index === 2;
  return createDefaultSurvey(teacher, isSubmitted);
});

export function createDefaultExecutiveSurvey(
  department: string,
  index = 0,
  isSubmitted = false
): ExecutiveSurveyPlan {
  const defaultWeights: { [k: string]: string } = {};
  EXEC_SELECTION_CRITERIA_LIST.forEach((c, idx) => {
    defaultWeights[c] = idx < 4 ? "90%" : idx < 8 ? "80%" : "70%";
  });

  const isMaster = department.includes("ป.โท") || department.includes("บริหาร");

  return {
    Exec_Survey_ID: `EXEC-SRV-${String(index + 1).padStart(2, "0")}`,
    Department: department,
    Updated_By_Staff_ID: `HEAD-${String(index + 1).padStart(2, "0")}`,
    Updated_By_Name: `หัวหน้า${department}`,
    Program_Level: isMaster ? "ปริญญาโท" : "ปริญญาตรี",

    // หมวด 1: ข้อมูลการรับนักศึกษาใหม่ (2570-2574)
    student_intake_targets: {
      "2570": 60,
      "2571": 60,
      "2572": 60,
      "2573": 60,
      "2574": 60,
    },
    student_intake_by_type: {
      quota: 20,
      portfolio: 20,
      regular: 20,
      other: 0,
    },

    // หมวด 2: ข้อมูลด้านงานวิจัยของสาขาวิชา (2570-2574)
    research_classroom: 3,
    research_education: 3,
    research_development: 2,
    research_other: 0,
    research_funding_sources: {
      "ทุนคณะศึกษาศาสตร์": [2570, 2571, 2572, 2573, 2574],
      "ทุนมหาวิทยาลัยฟาฏอนี": [2570, 2571, 2572],
      "สำนักงานการวิจัยแห่งชาติ (วช.)": [2571, 2572, 2573],
      "หน่วยบริหารและจัดการทุนพัฒนาระดับพื้นที่ (บพท.)": [2572, 2573, 2574],
    },
    research_budgets: {
      "2570": "300,001-500,000",
      "2571": "300,001-500,000",
      "2572": "500,001-1,000,000",
      "2573": "500,001-1,000,000",
      "2574": "500,001-1,000,000",
    },

    // หมวด 3: ข้อมูลด้านบริการวิชาการของสาขาวิชา (2570-2574)
    academic_services_count: {
      "2570": 2,
      "2571": 3,
      "2572": 3,
      "2573": 3,
      "2574": 4,
    },
    target_communities: {
      "โรงเรียนรัฐบาล": [2570, 2571, 2572, 2573, 2574],
      "โรงเรียนเอกชนสอนศาสนาอิสลาม": [2570, 2571, 2572, 2573, 2574],
      "ครูและบุคลากรทางการศึกษา": [2570, 2571, 2572, 2573, 2574],
      "โรงเรียนตาดีกา": [2571, 2572, 2573],
    },
    selection_criteria_weights: defaultWeights,

    // หมวด 4: ด้านบุคลากรสายวิชาการ (แผนรับเพิ่ม 2570-2574)
    staff_recruitment_total: {
      "2570": 1,
      "2571": 1,
      "2572": 1,
      "2573": 1,
      "2574": 1,
    },
    staff_recruitment_master: {
      "2570": 1,
      "2571": 0,
      "2572": 1,
      "2573": 0,
      "2574": 0,
    },
    staff_recruitment_doctoral: {
      "2570": 0,
      "2571": 1,
      "2572": 0,
      "2573": 1,
      "2574": 1,
    },
    staff_recruitment_adjunct: {
      "2570": 2,
      "2571": 2,
      "2572": 2,
      "2573": 2,
      "2574": 2,
    },

    // หมวด 5: ข้อเสนอแนะ
    suggestions: `ส่งเสริมการบูรณาการงานวิจัยและบริการวิชาการของ${department} ร่วมกับโรงเรียนเครือข่ายในพื้นที่ และสนับสนุนทุนพัฒนาตำรา/E-Book ประจำหลักสูตร`,

    Is_Submitted: isSubmitted,
    Updated_At: "2570-01-20",
  };
}

export const INITIAL_EXECUTIVE_SURVEYS: ExecutiveSurveyPlan[] = EDUCATION_PROGRAMS.map(
  (prog, idx) => createDefaultExecutiveSurvey(prog, idx, idx < 3)
);
