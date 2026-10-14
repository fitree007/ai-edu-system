/**
 * ============================================================================
 * GOOGLE APPS SCRIPT BACKEND API (Code.gs)
 * ระบบฐานข้อมูล Google Sheets + อัปโหลดไฟล์ลง Google Drive + Cache ความเร็วสูง
 * ============================================================================
 */

// ใส่ Folder ID ของ Google Drive ที่ต้องการเก็บไฟล์ PDF (หากเว้นว่างไว้ ระบบจะสร้างโฟลเดอร์ให้อัตโนมัติ)
const DRIVE_FOLDER_ID = ""; 

/**
 * รันฟังก์ชันนี้เพียง 1 ครั้งเพื่อสร้างตารางทั้ง 5 แท็บและข้อมูลเริ่มต้นอัตโนมัติ
 */
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const schemas = {
    "Staff_Directory": [
      "Staff_ID", "Full_Name", "Department", "Role", "Password", "Is_Default_Pwd", "Updated_At"
    ],
    "Instructor_Forms": [
      "Record_ID", "Staff_ID", "Full_Name", "Department", "Academic_Year", 
      "Course_Code", "Course_Name", "Teaching_Summary", "Research_Output", "Additional_Notes", "Updated_At"
    ],
    "Portfolio_Works": [
      "Work_ID", "Staff_ID", "Instructor_Name", "Department", "Academic_Year", 
      "Title", "Category", "Work_Type", "File_Or_Link_URL", "Description", "Is_Public", "Downloads", "Updated_At"
    ],
    "Executive_Forms": [
      "Exec_ID", "Staff_ID", "Executive_Name", "Department", "Academic_Year", 
      "Curriculum_Status", "Total_Graduates", "Quality_Score", "Strategic_Summary", "Issues_Found", "Updated_At"
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

  // เพิ่มข้อมูลบุคลากรเริ่มต้น (หากยังไม่มีข้อมูล)
  const staffSheet = ss.getSheetByName("Staff_Directory");
  if (staffSheet.getLastRow() === 1) {
    const now = new Date().toISOString();
    staffSheet.appendRow(["T001", "ผศ.ดร. อารีรัตน์ วิทยาการ", "วิทยาการคอมพิวเตอร์", "INSTRUCTOR", "123456", true, now]);
    staffSheet.appendRow(["T002", "อาจารย์ นภัสสร นวัตกรรม", "เทคโนโลยีสารสนเทศ", "INSTRUCTOR", "123456", true, now]);
    staffSheet.appendRow(["E001", "รศ.ดร. คมสันต์ บริหารกิจ", "วิทยาการคอมพิวเตอร์", "EXECUTIVE", "exec123", false, now]);
    staffSheet.appendRow(["E002", "ผศ.ดร. ศิริพร พัฒนา", "เทคโนโลยีสารสนเทศ", "EXECUTIVE", "exec123", false, now]);
    staffSheet.appendRow(["ADMIN", "ผู้ดูแลระบบสูงสุด", "ส่วนกลาง", "ADMIN", "admin999", false, now]);
  }
}

/**
 * ดึงข้อมูลแบบรวดเร็ว (GET Request)
 */
function doGet(e) {
  const action = e.parameter.action || "init";
  const cache = CacheService.getScriptCache();

  if (action === "init") {
    const cached = cache.get("ALL_APP_DATA");
    if (cached && e.parameter.nocache !== "1") {
      return jsonResponse(JSON.parse(cached));
    }
    const payload = getAllDatabaseRecords();
    try {
      cache.put("ALL_APP_DATA", JSON.stringify(payload), 60); // แคช 60 วินาทีเพื่อความเร็วสูงสุด
    } catch (err) {}
    return jsonResponse(payload);
  }

  return jsonResponse({ status: "ok", message: "API is running" });
}

/**
 * บันทึก/แก้ไขข้อมูล และอัปโหลดไฟล์ (POST Request)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // ป้องกันข้อมูลชนกันเมื่อมีคนกดบันทึกพร้อมกัน

  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const now = new Date().toISOString();

    // ล้างแคชทุกครั้งที่มีการเปลี่ยนแปลงข้อมูลเพื่อให้ซิงค์เรียลไทม์
    CacheService.getScriptCache().remove("ALL_APP_DATA");

    // 1. เปลี่ยนรหัสผ่าน
    if (action === "changePassword") {
      const sheet = ss.getSheetByName("Staff_Directory");
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(body.staffId)) {
          sheet.getRange(i + 1, 5).setValue(body.newPassword);
          sheet.getRange(i + 1, 6).setValue(false);
          sheet.getRange(i + 1, 7).setValue(now);
          return jsonResponse({ success: true });
        }
      }
      return jsonResponse({ success: false, error: "ไม่พบรหัสบุคลากร" });
    }

    // 2. บันทึกหรือแก้ไขข้อมูลฟอร์มอาจารย์ผู้สอน
    if (action === "upsertInstructorForm") {
      const sheet = ss.getSheetByName("Instructor_Forms");
      const rowData = [
        body.recordId || "REC-" + Date.now(),
        body.staffId,
        body.fullName,
        body.department,
        body.academicYear,
        body.courseCode,
        body.courseName,
        body.teachingSummary,
        body.researchOutput,
        body.additionalNotes,
        now
      ];
      upsertRowById(sheet, 0, rowData[0], rowData);
      return jsonResponse({ success: true, record: rowData });
    }

    // 3. อัปโหลดผลงานอาจารย์ (รองรับไฟล์ PDF Base64 และลิงก์ภายนอก) + ตั้งค่าสาธารณะ
    if (action === "upsertPortfolioWork") {
      const sheet = ss.getSheetByName("Portfolio_Works");
      let fileUrl = body.fileOrLinkUrl;

      // หากมีการอัปโหลดไฟล์ PDF ใหม่แบบ Base64 ให้บันทึกลง Google Drive
      if (body.base64Data && body.fileName) {
        fileUrl = saveBase64FileToDrive(body.base64Data, body.fileName, body.mimeType || "application/pdf");
      }

      const rowData = [
        body.workId || "WRK-" + Date.now(),
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
      upsertRowById(sheet, 0, rowData[0], rowData);
      return jsonResponse({ success: true, fileUrl: fileUrl });
    }

    // 4. สลับสถานะเผยแพร่สาธารณะ (Public/Private)
    if (action === "toggleWorkPublic") {
      const sheet = ss.getSheetByName("Portfolio_Works");
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

    // 5. บันทึกหรือแก้ไขข้อมูลฟอร์มผู้บริหาร (หัวหน้าสาขา)
    if (action === "upsertExecutiveForm") {
      const sheet = ss.getSheetByName("Executive_Forms");
      const rowData = [
        body.execId || "EXE-" + Date.now(),
        body.staffId,
        body.executiveName,
        body.department,
        body.academicYear,
        body.curriculumStatus,
        Number(body.totalGraduates || 0),
        Number(body.qualityScore || 0),
        body.strategicSummary,
        body.issuesFound,
        now
      ];
      upsertRowById(sheet, 0, rowData[0], rowData);
      return jsonResponse({ success: true });
    }

    // 6. แอดมินเพิ่ม/แก้ไขรายชื่อบุคลากร
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
      upsertRowById(sheet, 0, rowData[0], rowData);
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
 * ฟังก์ชันช่วยบันทึกหรืออัปเดตแถวตาม ID
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
 * ฟังก์ชันแปลงไฟล์ Base64 เก็บลง Google Drive และเปิดสิทธิ์อ่านสาธารณะ
 */
function saveBase64FileToDrive(base64Data, fileName, mimeType) {
  let folder;
  if (DRIVE_FOLDER_ID) {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } else {
    const folders = DriveApp.getFoldersByName("Academic_Portfolio_Uploads");
    folder = folders.hasNext() ? folders.next() : DriveApp.createFolder("Academic_Portfolio_Uploads");
  }
  const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const decoded = Utilities.base64Decode(cleanBase64);
  const blob = Utilities.newBlob(decoded, mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://drive.google.com/file/d/" + file.getId() + "/preview";
}

/**
 * ดึงข้อมูลทุกตารางแปลงเป็น JSON
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
    instructorForms: readSheet("Instructor_Forms"),
    portfolioWorks: readSheet("Portfolio_Works"),
    executiveForms: readSheet("Executive_Forms")
  };
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}