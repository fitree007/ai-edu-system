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

export const INITIAL_INSTRUCTOR_FORMS: InstructorPlanRecord[] = [];

export const INITIAL_PORTFOLIO_WORKS: PortfolioWork[] = [];

export const INITIAL_EXECUTIVE_FORMS: ExecutivePlanRecord[] = [];

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
    research_classroom: 0,
    research_education: 0,
    research_development: 0,
    research_other: 0,
    research_other_specify: "",
    research_funding_sources: {},
    research_funding_other_specify: "",
    research_budgets: {},

    // หมวด 2: ข้อมูลด้านการเรียนการสอน
    teaching_load: {},
    fieldwork_presence: {},
    fieldwork_agencies: {},
    fieldwork_agency_other_specify: "",

    // หมวด 3: ข้อมูลด้านบริการวิชาการ
    academic_services_count: {},
    target_communities: {},
    target_community_other_specify: "",
    selection_criteria_percentage: "",

    Is_Submitted: isSubmitted,
    Updated_At: "-",
  };
}

// ฐานข้อมูลเริ่มต้นสำหรับแบบสำรวจแผน 2570–2574 (สร้างให้คณาจารย์ทั้ง 67 ท่าน โดยสถานะเริ่มต้นยังไม่ส่ง เพื่อให้อาจารย์ยืนยันและกรอกตามจริง)
export const INITIAL_TEACHER_SURVEYS: TeacherSurveyPlan[] = INITIAL_TEACHERS.map((teacher) => {
  return createDefaultSurvey(teacher, false);
});

export function createDefaultExecutiveSurvey(
  department: string,
  index = 0,
  isSubmitted = false
): ExecutiveSurveyPlan {
  const isMaster = department.includes("ป.โท") || department.includes("บริหาร");

  return {
    Exec_Survey_ID: `EXEC-SRV-${String(index + 1).padStart(2, "0")}`,
    Department: department,
    Updated_By_Staff_ID: `HEAD-${String(index + 1).padStart(2, "0")}`,
    Updated_By_Name: `หัวหน้า${department}`,
    Program_Level: isMaster ? "ปริญญาโท" : "ปริญญาตรี",

    // หมวด 1: ข้อมูลการรับนักศึกษาใหม่ (2570-2574)
    student_intake_targets: {},
    student_intake_by_type: {
      quota: 0,
      portfolio: 0,
      regular: 0,
      other: 0,
    },

    // หมวด 2: ข้อมูลด้านงานวิจัยของสาขาวิชา (2570-2574)
    research_classroom: 0,
    research_education: 0,
    research_development: 0,
    research_other: 0,
    research_funding_sources: {},
    research_budgets: {},

    // หมวด 3: ข้อมูลด้านบริการวิชาการของสาขาวิชา (2570-2574)
    academic_services_count: {},
    target_communities: {},
    selection_criteria_weights: {},

    // หมวด 4: ด้านบุคลากรสายวิชาการ (แผนรับเพิ่ม 2570-2574)
    staff_recruitment_total: {},
    staff_recruitment_master: {},
    staff_recruitment_doctoral: {},
    staff_recruitment_adjunct: {},

    // หมวด 5: ข้อเสนอแนะ
    suggestions: "",

    Is_Submitted: isSubmitted,
    Updated_At: "-",
  };
}

export const INITIAL_EXECUTIVE_SURVEYS: ExecutiveSurveyPlan[] = EDUCATION_PROGRAMS.map(
  (prog, idx) => createDefaultExecutiveSurvey(prog, idx, false)
);
