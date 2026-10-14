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

export const GOOGLE_FORM_INSTRUCTOR_URL = "https://forms.gle/Ycbv8WByAnGdNvaA9";
export const GOOGLE_FORM_EXECUTIVE_URL = "https://forms.gle/uMUJA4XqC33Jiv5p9";
export const SHEET_TEACHER_HISTORY_URL = "https://docs.google.com/spreadsheets/d/1ylS_eLE-1lCvH482NnYHjmuo9KHB7o_uCMKcUDRDFyw/edit?gid=1839438727#gid=1839438727";

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

// สร้างรายชื่อ Staff อัตโนมัติจากอาจารย์ 67 ท่าน + หัวหน้าสาขา 12 สาขา + แอดมิน
export const INITIAL_STAFF: StaffMember[] = [
  ...INITIAL_TEACHERS.map((t) => ({
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
