"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Download,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Search,
  Upload,
} from "lucide-react";
import {
  EDUCATION_PROGRAMS,
  SURVEY_YEARS,
  type PortfolioWork,
} from "@/data/seedData";

interface RepositoryPortalViewProps {
  isDark: boolean;
  works: PortfolioWork[];
  onOpenPdfWork: (work: PortfolioWork) => void;
  onIncrementDownload: (workId: string) => void;
  onOpenUploadModal: () => void;
}

export function RepositoryPortalView({
  isDark,
  works,
  onOpenPdfWork,
  onIncrementDownload,
  onOpenUploadModal,
}: RepositoryPortalViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");

  const publicWorks = useMemo(() => {
    return works.filter((w) => w.Is_Public);
  }, [works]);

  const filteredWorks = useMemo(() => {
    return publicWorks.filter((w) => {
      const matchDept = selectedDept === "ALL" || w.Department === selectedDept;
      const matchCat =
        selectedCategory === "ALL" || w.Category === selectedCategory;
      const matchYear =
        selectedYear === "ALL" || String(w.Academic_Year) === selectedYear;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        w.Title.toLowerCase().includes(q) ||
        w.Instructor_Name.toLowerCase().includes(q) ||
        w.Department.toLowerCase().includes(q) ||
        (w.Description || "").toLowerCase().includes(q);
      return matchDept && matchCat && matchYear && matchSearch;
    });
  }, [publicWorks, selectedDept, selectedCategory, selectedYear, searchQuery]);

  const categories = useMemo(() => {
    const set = new Set<string>(["ตำรา / E-Book", "เอกสารประกอบการสอน", "งานวิจัย / เอกสารวิชาการ", "สื่อการสอน / นวัตกรรม"]);
    publicWorks.forEach((w) => {
      if (w.Category) set.add(w.Category);
    });
    return Array.from(set);
  }, [publicWorks]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div
        className={`rounded-3xl p-5 sm:p-7 border shadow-xl relative overflow-hidden ${
          isDark
            ? "bg-gradient-to-br from-[#231347] via-[#170D30] to-[#110924] border-purple-500/30 text-white"
            : "bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 border-purple-700 text-white"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-purple-200">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>คลังรวมข้อมูลและสื่อวิชาการสาธารณะ • คณะศึกษาศาสตร์</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              คลังค้นหาข้อมูล ตำรา E-Book และผลงานวิชาการ (PDF Reader ในตัว)
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/85">
              เปิดอ่านไฟล์ PDF บนเว็บแอปได้ทันที หรือดาวน์โหลดเอกสารไปศึกษาต่อได้โดยไม่ต้องติดตั้งโปรแกรมเสริม
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="px-4 py-3 rounded-2xl bg-white text-purple-950 hover:bg-purple-50 text-xs sm:text-sm font-black shadow-lg flex items-center justify-center gap-2 shrink-0 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4 text-purple-700" />
            <span>อัปโหลดผลงานสู่คลังสาธารณะ</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-purple-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหนังสือ E-Book, งานวิจัย, ชื่ออาจารย์ หรือสาขาวิชา..."
              className="w-full pl-10 pr-4 h-11 rounded-xl bg-black/35 border border-white/20 text-white placeholder:text-purple-200/60 text-xs sm:text-sm font-semibold focus:outline-none focus:border-purple-300"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 h-11 rounded-xl bg-black/35 border border-white/20 text-white text-xs font-bold focus:outline-none"
          >
            <option value="ALL" className="bg-slate-900">
              ทุกสาขาวิชา (12 สาขา)
            </option>
            {EDUCATION_PROGRAMS.map((p) => (
              <option key={p} value={p} className="bg-slate-900">
                {p}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 h-11 rounded-xl bg-black/35 border border-white/20 text-white text-xs font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">
                ทุกหมวดหมู่
              </option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2.5 h-11 rounded-xl bg-black/35 border border-white/20 text-white text-xs font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900">
                ทุกปี พ.ศ.
              </option>
              {[2568, 2569, ...SURVEY_YEARS].map((y) => (
                <option key={y} value={String(y)} className="bg-slate-900">
                  พ.ศ. {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm font-bold opacity-80">
          พบผลงานที่เผยแพร่สู่สาธารณะ{" "}
          <span className="text-purple-600 dark:text-purple-300 font-black">
            {filteredWorks.length}
          </span>{" "}
          รายการ
        </p>
        {(searchQuery || selectedDept !== "ALL" || selectedCategory !== "ALL" || selectedYear !== "ALL") && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedDept("ALL");
              setSelectedCategory("ALL");
              setSelectedYear("ALL");
            }}
            className="text-xs font-bold text-purple-600 dark:text-purple-300 hover:underline"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>

      {filteredWorks.length === 0 ? (
        <div
          className={`rounded-3xl p-8 sm:p-12 text-center border flex flex-col items-center justify-center gap-3.5 transition-all ${
            isDark
              ? "bg-[#150D2A]/60 border-white/10 text-purple-200"
              : "bg-white border-slate-200/90 text-slate-700"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-base sm:text-lg">
              {searchQuery || selectedDept !== "ALL" || selectedCategory !== "ALL" || selectedYear !== "ALL"
                ? "ไม่พบผลงานที่ตรงตามเงื่อนไขการค้นหา"
                : "ยังไม่มีผลงานหรือเอกสารวิชาการในคลังขณะนี้"}
            </h3>
            <p className="text-xs sm:text-sm opacity-70 max-w-md mx-auto">
              {searchQuery || selectedDept !== "ALL" || selectedCategory !== "ALL" || selectedYear !== "ALL"
                ? "ลองปรับคำค้นหาหรือเลือกหมวดหมู่อื่นเพื่อค้นหาเอกสาร"
                : "อาจารย์สามารถกดปุ่ม 'อัปโหลดผลงานสู่คลังสาธารณะ' เพื่อเริ่มเผยแพร่ตำรา E-Book หรือเอกสารวิชาการได้ทันที"}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="mt-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>อัปโหลดผลงานแรก</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorks.map((work) => {
            const isPdf =
              work.Work_Type === "PDF" ||
              work.File_Or_Link_URL.toLowerCase().endsWith(".pdf") ||
              work.File_Or_Link_URL.startsWith("data:application/pdf");

            return (
              <div
                key={work.Work_ID}
                className={`rounded-3xl p-5 border flex flex-col justify-between gap-4 transition-all hover:shadow-lg ${
                  isDark
                    ? "bg-[#150D2A]/90 border-white/10 hover:border-purple-500/40"
                    : "bg-white border-slate-200/90 hover:border-purple-300"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
                        isPdf
                          ? "bg-purple-600 text-white"
                          : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
                      }`}
                    >
                      {isPdf ? (
                        <>
                          <FileText className="w-3.5 h-3.5" />
                          <span>PDF เปิดอ่านได้</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>ลิงก์สื่อการสอน</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] font-bold opacity-65">
                      พ.ศ. {work.Academic_Year}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base leading-snug line-clamp-2">
                    {work.Title}
                  </h3>

                  <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
                    {work.Description}
                  </p>

                  <div className="pt-1 text-xs space-y-0.5">
                    <p className="font-bold text-purple-600 dark:text-purple-300">
                      {work.Instructor_Name}
                    </p>
                    <p className="opacity-70 text-[11px]">{work.Department}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] opacity-70 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-purple-500" />
                    <span>{work.Downloads} ครั้ง</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenPdfWork(work)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isPdf ? "เปิดอ่าน PDF บนเว็บ" : "เปิดดูผลงาน"}</span>
                    </button>

                    <a
                      href={work.File_Or_Link_URL}
                      download={
                        work.File_Or_Link_URL.startsWith("data:")
                          ? `${work.Title.replace(/\s+/g, "_")}.pdf`
                          : undefined
                      }
                      target={
                        work.File_Or_Link_URL.startsWith("data:")
                          ? undefined
                          : "_blank"
                      }
                      rel="noreferrer"
                      onClick={() => onIncrementDownload(work.Work_ID)}
                      className={`p-2 rounded-xl border transition-all ${
                        isDark
                          ? "border-white/15 bg-white/5 hover:bg-white/10"
                          : "border-slate-200 bg-slate-100 hover:bg-slate-200"
                      }`}
                      title="ดาวน์โหลดไฟล์"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
