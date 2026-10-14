/**
 * ============================================================================
 * GOOGLE APPS SCRIPT BACKEND API (Code.gs)
 * คณะศึกษาศาสตร์: ระบบฐานข้อมูลแผน 2570-2574, คลังผลงาน E-Book & ทำเนียบคณาจารย์
 * ฐานข้อมูล Google Sheets 6 แท็บ + อัปโหลดไฟล์ Google Drive + Cache ความเร็วสูง
 * ============================================================================
 */

// ระบุ Folder ID ของ Google Drive ที่ต้องการเก็บไฟล์ PDF (หากเว้นว่างไว้ ระบบจะสร้างโฟลเดอร์ "Faculty_Education_EBooks" ให้อัตโนมัติ)
const DRIVE_FOLDER_ID = ""; 

/**
 * รันฟังก์ชันนี้เพียง 1 ครั้งเพื่อสร้างโครงสร้างตารางทั้ง 6 แท็บให้อัตโนมัติ
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const schemas = {
    "Staff_Directory": [
      "Staff_ID", "Full_Name", "Department", "Role", "Password", "Is_Default_Pwd", "Updated_At"
    ],
    "Faculty_Qualifications": [
      "Staff_ID", "Full_Name", "Department", "Degree_Level", "Grad_Year", "Degree_Name", "Major", "Institution", "Updated_At"
    ],
    "Instructor_Plan_Forms": [
      "Record_ID", "Staff_ID", "Full_Name", "Department", "Academic_Year", 
      "Course_Code", "Course_Name", "Teaching_Method", "Target_KPI", 
      "Teaching_Summary", "Research_Output", "Ebook_Planned", "Additional_Notes", "Updated_At"
    ],
    "Executive_Plan_Forms": [
      "Exec_ID", "Staff_ID", "Executive_Name", "Department", "Academic_Year", 
      "Curriculum_Status", "Faculty_Count", "Total_Graduates", "Quality_Score", 
      "Strategic_Plan_2570_2574", "Budget_Needs", "Issues_Found", "Updated_At"
    ],
    "Portfolio_EBooks": [
      "Work_ID", "Staff_ID", "Instructor_Name", "Department", "Academic_Year", 
      "Title", "Category", "Work_Type", "File_Or_Link_URL", "Description", "Is_Public", "Downloads", "Updated_At"
    ],
    "System_Settings": [
      "Setting_Key", "Setting_Value", "Updated_At"
    ]
  };

  Object.keys(schemas).forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(schemas[sheetName]);
      sheet.getRange(1, 1, 1, schemas[sheetName].length).setFontWeight("bold").setBackground("#F1F5F9");
      sheet.setFrozenRows(1);
    }
  });

  // เพิ่มบัญชีผู้ดูแลระบบเริ่มต้น (หากยังไม่มีข้อมูล)
  const staffSheet = ss.getSheetByName("Staff_Directory");
  if (staffSheet.getLastRow() === 1) {
    const now = new Date().toISOString();
    staffSheet.appendRow(["ADMIN", "ผู้ดูแลระบบ คณะศึกษาศาสตร์ (Admin)", "สำนักงานคณบดี", "ADMIN", "admin999", false, now]);
    staffSheet.appendRow(["EDU-001", "ซอลีฮะห์ หะยีสะมะแอ", "สาขาวิชาอิสลามศึกษา", "INSTRUCTOR", "123456", true, now]);
    staffSheet.appendRow(["HEAD-01", "หัวหน้าสาขาวิชาอิสลามศึกษา", "สาขาวิชาอิสลามศึกษา", "EXECUTIVE", "exec123", false, now]);
  }
}

/**
 * ดึงข้อมูลแบบรวดเร็ว (GET Request)
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "init";
  const cache = CacheService.getScriptCache();

  if (action === "init") {
    const cached = cache.get("ALL_EDU_APP_DATA");
    if (cached && e.parameter.nocache !== "1") {
      return jsonResponse(JSON.parse(cached));
    }
    const payload = getAllDatabaseRecords();
    try {
      cache.put("ALL_EDU_APP_DATA", JSON.stringify(payload), 60); // แคช 60 วินาทีเพื่อความเร็วสูงสุด
    } catch (err) {}
    return jsonResponse(payload);
  }

  return jsonResponse({ status: "ok", message: "Education System API is running" });
}

/**
 * บันทึก/แก้ไขข้อมูล และอัปโหลดไฟล์ (POST Request)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // ป้องกันข้อมูลชนกัน

  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date().toISOString();

    // ล้างแคชเพื่อให้ข้อมูลอัปเดตเรียลไทม์ทันที
    CacheService.getScriptCache().remove("ALL_EDU_APP_DATA");

    // 1. เปลี่ยนรหัสผ่านอาจารย์/บุคลากร
    if (action === "changePassword") {
      const sheet = ss.getSheetByName("Staff_Directory");
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).toUpperCase() === String(body.staffId).toUpperCase()) {
          sheet.getRange(i + 1, 5).setValue(body.newPassword);
          sheet.getRange(i + 1, 6).setValue(false);
          sheet.getRange(i + 1, 7).setValue(now);
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ success: false, error: "ไม่พบรหัสบุคลากร" });
    }

    // 2. บันทึกหรือแก้ไขฟอร์มสำรวจแผน 2570–2574 ของอาจารย์ผู้สอน
    if (action === "upsertInstructorForm" || action === "upsertInstructorPlan") {
      let sheet = ss.getSheetByName("Instructor_Plan_Forms");
      if (!sheet) sheet = ss.getSheetByName("Instructor_Forms");
      
      const recordId = body.recordId || "PLAN-INST-" + Date.now();
      const rowData = [
        recordId,
        body.staffId,
        body.fullName,
        body.department,
        body.academicYear,
        body.courseCode,
        body.courseName,
        body.teachingMethod || body.teachingSummary || "",
        body.targetKpi || "",
        body.teachingSummary || "",
        body.researchOutput || "",
        body.ebookPlanned || "",
        body.additionalNotes || "",
        now
      ];
      upsertRowById(sheet, 0, recordId, rowData);
      return jsonResponse({ success: true, recordId: recordId });
    }

    // 3. อัปโหลดผลงานวิชาการ / E-Book (รองรับ PDF Base64 ขึ้น Google Drive และลิงก์ภายนอก)
    if (action === "upsertPortfolioWork") {
      let sheet = ss.getSheetByName("Portfolio_EBooks");
      if (!sheet) sheet = ss.getSheetByName("Portfolio_Works");
      
      let fileUrl = body.fileOrLinkUrl;

      // แปลง PDF Base64 บันทึกลง Google Drive พร้อมแชร์ Public Link
      if (body.base64Data && body.fileName) {
        fileUrl = saveBase64FileToDrive(body.base64Data, body.fileName, body.mimeType || "application/pdf");
      }

      const workId = body.workId || "WRK-EDU-" + Date.now();
      const rowData = [
        workId,
        body.staffId,
        body.instructorName,
        body.department,
        body.academicYear,
        body.title,
        body.category,
        body.workType, // 'PDF' หรือ 'LINK'
        fileUrl,
        body.description,
        Boolean(body.isPublic),
        Number(body.downloads || 0),
        now
      ];
      upsertRowById(sheet, 0, workId, rowData);
      return jsonResponse({ success: true, workId: workId, fileUrl: fileUrl });
    }

    // 4. สลับสถานะเปิดเผยแพร่สาธารณะ (Public/Private)
    if (action === "toggleWorkPublic") {
      let sheet = ss.getSheetByName("Portfolio_EBooks");
      if (!sheet) sheet = ss.getSheetByName("Portfolio_Works");
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.workId)) {
          sheet.getRange(i + 1, 11).setValue(Boolean(body.isPublic));
          sheet.getRange(i + 1, 13).setValue(now);
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ success: false });
    }

    // 5. บันทึกหรือแก้ไขข้อมูลฟอร์มผู้บริหาร / หัวหน้าสาขาวิชา (แผน 2570–2574)
    if (action === "upsertExecutiveForm" || action === "upsertExecutivePlan") {
      let sheet = ss.getSheetByName("Executive_Plan_Forms");
      if (!sheet) sheet = ss.getSheetByName("Executive_Forms");
      
      const execId = body.execId || "PLAN-EXEC-" + Date.now();
      const rowData = [
        execId,
        body.staffId,
        body.executiveName,
        body.department,
        body.academicYear,
        body.curriculumStatus || "ปกติ",
        Number(body.facultyCount || 0),
        Number(body.totalGraduates || 0),
        Number(body.qualityScore || 0),
        body.strategicPlan || body.strategicSummary || "",
        body.budgetNeeds || "",
        body.issuesFound || "",
        now
      ];
      upsertRowById(sheet, 0, execId, rowData);
      return jsonResponse({ success: true, execId: execId });
    }

    // 6. แอดมินเพิ่มหรือแก้ไขข้อมูลบุคลากร
    if (action === "upsertStaff") {
      const sheet = ss.getSheetByName("Staff_Directory");
      const rowData = [
        body.staffId,
        body.fullName,
        body.department,
        body.role,
        body.password || "123456",
        Boolean(body.isDefaultPwd),
        now
      ];
      upsertRowById(sheet, 0, body.staffId, rowData);
      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, error: "Unknown action" });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * ฟังก์ชันช่วยบันทึกหรืออัปเดตแถวตาม ID ในชีต
 */
function upsertRowById(sheet, idColIndex, idValue, newRowData) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idColIndex]) === String(idValue)) {
      sheet.getRange(i + 1, 1, 1, newRowData.length).setValues([newRowData]);
      return;
    }
  }
  sheet.appendRow(newRowData);
}

/**
 * ฟังก์ชันแปลงไฟล์ Base64 บันทึกลง Google Drive และเปิดสิทธิ์ Public View
 */
function saveBase64FileToDrive(base64Data, fileName, mimeType) {
  let folder;
  if (DRIVE_FOLDER_ID) {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } else {
    const folders = DriveApp.getFoldersByName("Faculty_Education_EBooks");
    folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("Faculty_Education_EBooks");
  }
  const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const decoded = Utilities.base64Decode(cleanBase64);
  const blob = Utilities.newBlob(decoded, mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://drive.google.com/file/d/" + file.getId() + "/preview";
}

/**
 * ดึงข้อมูลทุกตารางแปลงเป็น JSON ตอบกลับ
 */
function getAllDatabaseRecords() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const readSheet = (name) => {
    const sheet = ss.getSheetByName(name);
    if (!sheet || sheet.getLastRow() <= 1) return [];
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    return rows.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });
  };

  return {
    staffList: readSheet("Staff_Directory"),
    instructorForms: readSheet("Instructor_Plan_Forms").length ? readSheet("Instructor_Plan_Forms") : readSheet("Instructor_Forms"),
    portfolioWorks: readSheet("Portfolio_EBooks").length ? readSheet("Portfolio_EBooks") : readSheet("Portfolio_Works"),
    executiveForms: readSheet("Executive_Plan_Forms").length ? readSheet("Executive_Plan_Forms") : readSheet("Executive_Forms"),
    qualificationsList: readSheet("Faculty_Qualifications")
  };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}