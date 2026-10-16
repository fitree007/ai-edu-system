"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Upload,
  Globe,
  Lock,
  BookOpen,
  Maximize2,
  Minimize2,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { EDUCATION_PROGRAMS, SURVEY_YEARS, type PortfolioWork } from "@/data/seedData";

interface PdfReaderModalProps {
  work: PortfolioWork | null;
  onClose: () => void;
  onIncrementDownload: (workId: string) => void;
  isDark: boolean;
}

export function PdfReaderModal({
  work,
  onClose,
  onIncrementDownload,
  isDark,
}: PdfReaderModalProps) {
  const [viewerMode, setViewerMode] = useState<"NATIVE" | "GOOGLE">("NATIVE");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resolvedPdfUrl, setResolvedPdfUrl] = useState<string>("");

  useEffect(() => {
    if (!work) {
      setResolvedPdfUrl("");
      return;
    }

    const rawUrl = work.File_Or_Link_URL || "";
    // หากเป็นไฟล์ PDF ที่อัปโหลดในเครื่อง (Data URL base64) ให้แปลงเป็น Blob URL เพื่อให้เปิดอ่านใน iframe/object บนเว็บแอปได้ทันที
    if (rawUrl.startsWith("data:application/pdf")) {
      try {
        const parts = rawUrl.split(",");
        const base64 = parts[1] || "";
        const binaryStr = atob(base64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setResolvedPdfUrl(blobUrl);
        setViewerMode("NATIVE");
        return () => URL.revokeObjectURL(blobUrl);
      } catch {
        setResolvedPdfUrl(rawUrl);
      }
    } else {
      setResolvedPdfUrl(rawUrl);
      // หากเป็น URL ภายนอกทั่วไป สามารถสลับโหมด Google Viewer ได้หากมือถือบางรุ่นไม่แสดง PDF ใน iframe โดยตรง
      setViewerMode("NATIVE");
    }
  }, [work]);

  if (!work) return null;

  const isPdf =
    work.Work_Type === "PDF" ||
    work.File_Or_Link_URL.toLowerCase().endsWith(".pdf") ||
    work.File_Or_Link_URL.startsWith("data:application/pdf") ||
    work.File_Or_Link_URL.includes("drive.google.com");

  const isDataUrl = work.File_Or_Link_URL.startsWith("data:");
  const googleViewerUrl =
    !isDataUrl && work.File_Or_Link_URL.startsWith("http")
      ? `https://docs.google.com/gview?url=${encodeURIComponent(work.File_Or_Link_URL)}&embedded=true`
      : resolvedPdfUrl;

  const activeIframeSrc =
    viewerMode === "GOOGLE" && !isDataUrl ? googleViewerUrl : resolvedPdfUrl;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overscroll-contain"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all overscroll-contain ${
          isFullscreen
            ? "w-full h-[96vh] max-w-none"
            : "w-full max-w-4xl max-h-[92vh]"
        } ${
          isDark
            ? "bg-[#181030] border-white/15 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Top Toolbar */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-2 shrink-0 ${
            isDark ? "bg-white/[0.04] border-white/10" : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-bold">
                {work.Work_Type === "PDF" ? "PDF E-Book" : "ลิงก์สื่อออนไลน์"}
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-300">
                {work.Category}
              </span>
              <span className="opacity-60">• พ.ศ. {work.Academic_Year}</span>
            </div>
            <h3 className="font-bold text-sm sm:text-base truncate mt-0.5">
              {work.Title}
            </h3>
            <p className="text-xs opacity-70 truncate">
              โดย {work.Instructor_Name} ({work.Department})
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isPdf && (
              <button
                type="button"
                onClick={() => setIsFullscreen((prev) => !prev)}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                  isDark
                    ? "border-white/15 bg-white/5 hover:bg-white/10"
                    : "border-slate-200 bg-white hover:bg-slate-100"
                }`}
                title={isFullscreen ? "ย่อขนาดหน้าต่าง" : "ขยายเต็มจอ"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isFullscreen ? "ย่อจอ" : "เต็มจอ"}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: Description + Embedded PDF Viewer */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {work.Description && (
            <div
              className={`p-3 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                isDark
                  ? "bg-white/[0.03] border-white/10 text-purple-100"
                  : "bg-slate-50 border-slate-200/70 text-slate-700"
              }`}
            >
              {work.Description}
            </div>
          )}

          {isPdf ? (
            <div className="space-y-2">
              {/* Reader Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span className="font-bold">ระบบอ่านไฟล์ PDF บนเว็บแอป</span>
                </div>

                {!isDataUrl && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setViewerMode("NATIVE")}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                        viewerMode === "NATIVE"
                          ? "bg-purple-600 text-white border-purple-500"
                          : isDark
                          ? "border-white/15 bg-white/5"
                          : "border-slate-200 bg-slate-100"
                      }`}
                    >
                      ตัวอ่านหลัก
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewerMode("GOOGLE")}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border ${
                        viewerMode === "GOOGLE"
                          ? "bg-purple-600 text-white border-purple-500"
                          : isDark
                          ? "border-white/15 bg-white/5"
                          : "border-slate-200 bg-slate-100"
                      }`}
                    >
                      ตัวอ่านสำรอง (มือถือ)
                    </button>
                  </div>
                )}
              </div>

              {/* Embedded PDF Frame */}
              <div
                className={`w-full rounded-2xl border overflow-hidden bg-slate-900 ${
                  isFullscreen ? "h-[72vh]" : "h-[52vh] sm:h-[60vh]"
                } ${isDark ? "border-white/15" : "border-slate-300"}`}
              >
                <iframe
                  src={activeIframeSrc}
                  title={work.Title}
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          ) : (
            <div
              className={`p-6 rounded-2xl border text-center space-y-3 ${
                isDark ? "bg-white/[0.02] border-white/10" : "bg-slate-50 border-slate-200"
              }`}
            >
              <ExternalLink className="w-10 h-10 text-purple-500 mx-auto" />
              <p className="text-sm font-bold">
                ผลงานนี้เป็นลิงก์สื่อการสอน / วิดีโอภายนอก
              </p>
              <p className="text-xs opacity-70 break-all">{work.File_Or_Link_URL}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isDark ? "bg-white/[0.03] border-white/10" : "bg-slate-50 border-slate-200/80"
          }`}
        >
          <span className="text-xs opacity-75 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-purple-500" />
            <span>เข้าชม / ดาวน์โหลดแล้ว {work.Downloads} ครั้ง</span>
          </span>

          <div className="flex items-center gap-2">
            <a
              href={resolvedPdfUrl || work.File_Or_Link_URL}
              download={
                isDataUrl
                  ? `${work.Title.replace(/\s+/g, "_")}.pdf`
                  : undefined
              }
              target={isDataUrl ? undefined : "_blank"}
              rel="noreferrer"
              onClick={() => onIncrementDownload(work.Work_ID)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isPdf ? "ดาวน์โหลด PDF / เปิดแท็บใหม่" : "เปิดลิงก์ผลงาน"}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface UploadWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWork: (newWork: PortfolioWork, base64Data?: string, fileName?: string) => void;
  defaultStaffId: string;
  defaultInstructorName: string;
  defaultDepartment: string;
  isDark: boolean;
}

export function UploadWorkModal({
  isOpen,
  onClose,
  onSaveWork,
  defaultStaffId,
  defaultInstructorName,
  defaultDepartment,
  isDark,
}: UploadWorkModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ตำรา / E-Book");
  const [academicYear, setAcademicYear] = useState<number>(2570);
  const [uploadMethod, setUploadMethod] = useState<"FILE_PDF" | "URL_LINK">("FILE_PDF");
  const [linkUrl, setLinkUrl] = useState("");
  const [pdfFileName, setPdfFileName] = useState("");
  const [pdfDataUrl, setPdfDataUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [fileError, setFileError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("กรุณาเลือกไฟล์นามสกุล .pdf เท่านั้น");
      return;
    }

    // จำกัดขนาดประมาณ 8MB เพื่อให้แสดงผลในเบราว์เซอร์ได้รวดเร็ว
    if (file.size > 8 * 1024 * 1024) {
      setFileError("ไฟล์ PDF มีขนาดใหญ่เกิน 8 MB กรุณาใช้ไฟล์ขนาดเล็กลงหรือแนบเป็นลิงก์ Google Drive");
      return;
    }

    setPdfFileName(file.name);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.pdf$/i, ""));
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPdfDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFileError("");

    if (!title.trim()) {
      setFileError("กรุณาระบุชื่อผลงานหรือหนังสือ E-Book");
      return;
    }

    let finalUrl = linkUrl.trim();
    let finalType: "PDF" | "LINK" = "LINK";

    if (uploadMethod === "FILE_PDF") {
      if (!pdfDataUrl) {
        setFileError("กรุณาเลือกไฟล์ PDF จากเครื่องของท่าน");
        return;
      }
      finalUrl = pdfDataUrl;
      finalType = "PDF";
    } else {
      if (!finalUrl) {
        setFileError("กรุณาวางลิงก์ไฟล์ PDF หรือลิงก์ผลงาน");
        return;
      }
      if (finalUrl.toLowerCase().endsWith(".pdf") || finalUrl.includes("drive.google.com")) {
        finalType = "PDF";
      }
    }

    const newWork: PortfolioWork = {
      Work_ID: `WRK-${Date.now().toString().slice(-6)}`,
      Staff_ID: defaultStaffId,
      Instructor_Name: defaultInstructorName,
      Department: defaultDepartment || EDUCATION_PROGRAMS[0],
      Academic_Year: Number(academicYear),
      Title: title.trim(),
      Category: category,
      Work_Type: finalType,
      File_Or_Link_URL: finalUrl,
      Description:
        description.trim() ||
        `เอกสารวิชาการ/สื่อการสอนโดย ${defaultInstructorName} (${defaultDepartment})`,
      Is_Public: isPublic,
      Downloads: 1,
      Updated_At: new Date().toISOString().split("T")[0],
    };

    onSaveWork(
      newWork,
      uploadMethod === "FILE_PDF" ? pdfDataUrl : undefined,
      uploadMethod === "FILE_PDF" ? pdfFileName : undefined
    );

    // Reset
    setTitle("");
    setLinkUrl("");
    setPdfFileName("");
    setPdfDataUrl("");
    setDescription("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`rounded-3xl max-w-lg w-full p-5 sm:p-6 border shadow-2xl space-y-4 my-auto ${
          isDark
            ? "bg-[#181030] border-white/15 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between border-b pb-3 border-slate-200/70 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">อัปโหลดผลงานสู่คลังข้อมูล</h3>
              <p className="text-xs opacity-70">{defaultInstructorName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-purple-500/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {fileError && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-500 dark:text-red-300 font-bold">
            {fileError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* เลือกรูปแบบการอัปโหลด */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl border border-purple-500/20 bg-purple-500/5">
            <button
              type="button"
              onClick={() => setUploadMethod("FILE_PDF")}
              className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                uploadMethod === "FILE_PDF"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>อัปโหลดไฟล์ PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod("URL_LINK")}
              className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                uploadMethod === "URL_LINK"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "opacity-75 hover:opacity-100"
              }`}
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>แนบลิงก์ PDF / สื่อ</span>
            </button>
          </div>

          {uploadMethod === "FILE_PDF" ? (
            <div>
              <label className="block font-bold mb-1.5">
                เลือกไฟล์ PDF จากอุปกรณ์ของท่าน (เปิดอ่านบนเว็บแอปได้ทันที)
              </label>
              <label
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  pdfDataUrl
                    ? "border-emerald-500/60 bg-emerald-500/10"
                    : isDark
                    ? "border-white/20 hover:border-purple-400 bg-white/[0.02]"
                    : "border-slate-300 hover:border-purple-500 bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {pdfDataUrl ? (
                  <div className="text-center space-y-1">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                    <p className="font-bold text-emerald-600 dark:text-emerald-300">
                      พร้อมอัปโหลด: {pdfFileName}
                    </p>
                    <p className="text-[11px] opacity-70">แตะเพื่อเปลี่ยนไฟล์ PDF อื่น</p>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <Upload className="w-7 h-7 text-purple-500 mx-auto" />
                    <p className="font-bold">แตะเพื่อเลือกไฟล์ PDF (.pdf)</p>
                    <p className="text-[11px] opacity-65">
                      รองรับการเปิดอ่านบนเว็บแอปและดาวน์โหลดได้โดยตรง
                    </p>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div>
              <label className="block font-bold mb-1">
                ลิงก์ไฟล์ PDF (Google Drive / เว็บไซต์) หรือสื่อการสอน
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className={`w-full px-3.5 h-10 rounded-xl border ${
                  isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
                }`}
              />
            </div>
          )}

          <div>
            <label className="block font-bold mb-1">ชื่อผลงาน / ชื่อหนังสือ E-Book</label>
            <input
              type="text"
              required
              placeholder="เช่น คู่มือการจัดการเรียนรู้เชิงรุก รายวิชา..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 h-10 rounded-xl border font-bold ${
                isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">หมวดหมู่ผลงาน</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 h-10 rounded-xl border font-bold ${
                  isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
                }`}
              >
                <option value="ตำรา / E-Book">ตำรา / E-Book</option>
                <option value="เอกสารประกอบการสอน">เอกสารประกอบการสอน</option>
                <option value="งานวิจัย / เอกสารวิชาการ">งานวิจัย / เอกสารวิชาการ</option>
                <option value="สื่อการสอน / นวัตกรรม">สื่อการสอน / นวัตกรรม</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">ปีการศึกษา (พ.ศ.)</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(Number(e.target.value))}
                className={`w-full px-3 h-10 rounded-xl border font-bold ${
                  isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
                }`}
              >
                {[2568, 2569, ...SURVEY_YEARS].map((y) => (
                  <option key={y} value={y}>
                    พ.ศ. {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">รายละเอียดโดยย่อ</label>
            <textarea
              rows={2}
              placeholder="อธิบายเนื้อหาโดยย่อเพื่อให้ผู้ชมและนักศึกษาค้นหาได้ง่าย..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-3 rounded-xl border ${
                isDark ? "bg-[#0D081D] border-white/15 text-white" : "bg-slate-50 border-slate-300"
              }`}
            />
          </div>

          {/* ตั้งค่าการเผยแพร่สาธารณะ */}
          <div
            onClick={() => setIsPublic((prev) => !prev)}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer select-none ${
              isPublic
                ? isDark
                  ? "bg-emerald-950/30 border-emerald-500/50"
                  : "bg-emerald-50 border-emerald-300"
                : isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-slate-100 border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isPublic ? (
                <Globe className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-amber-500 shrink-0" />
              )}
              <div>
                <p className="font-bold">
                  {isPublic
                    ? "เผยแพร่สู่คลังสาธารณะ (ทุกคนเปิดอ่านและดาวน์โหลดได้)"
                    : "เก็บเป็นเอกสารภายใน (เฉพาะฉันและแอดมิน)"}
                </p>
                <p className="text-[11px] opacity-70">แตะเพื่อสลับสถานะการเผยแพร่</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap ${
                isPublic ? "bg-emerald-600 text-white" : "bg-slate-600 text-white"
              }`}
            >
              {isPublic ? "สาธารณะ" : "ส่วนตัว"}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-purple-500/30 font-bold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>บันทึกและอัปโหลด</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
