/**
 * API Client สำหรับเชื่อมต่อ Google Apps Script Web App API
 * รองรับทั้งการเชื่อมต่อจริง (Real-time Sync) และระบบ Local Cache Fallback
 */

export const GAS_API_URL = process.env.NEXT_PUBLIC_GAS_API_URL || "";

export interface ApiResponse<T = unknown> {
  success?: boolean;
  status?: string;
  data?: T;
  error?: string;
  [key: string]: unknown;
}

/**
 * ดึงข้อมูลทั้งหมดจาก Google Apps Script
 */
export async function fetchAllAppData(): Promise<Record<string, unknown> | null> {
  if (!GAS_API_URL) {
    console.info("⚡ [API] ใช้ข้อมูล LocalStorage Cache เนื่องจากไม่ได้ระบุ NEXT_PUBLIC_GAS_API_URL");
    return null;
  }

  try {
    const res = await fetch(`${GAS_API_URL}?action=init`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("⚠️ [API] ไม่สามารถดึงข้อมูลจาก GAS ได้ กำลังใช้งานข้อมูล Local Cache แทน:", err);
    return null;
  }
}

/**
 * ส่งคำร้องขอ POST ไปยัง Google Apps Script
 */
export async function postToGAS(payload: Record<string, unknown>): Promise<ApiResponse | null> {
  if (!GAS_API_URL) {
    console.info("⚡ [API] ข้อมูลถูกบันทึกลง Local Cache เรียบร้อยแล้ว (ออฟไลน์โหมด)");
    return { success: true };
  }

  try {
    const res = await fetch(GAS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("⚠️ [API] ไม่สามารถส่งข้อมูลไปยัง GAS ได้ (บันทึกลง Local Cache แล้ว):", err);
    return { success: false, error: String(err) };
  }
}
