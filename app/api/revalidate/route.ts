import type { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

import { TAG_LANDING, TAG_PAKET, TAG_PROPERTI } from "@/lib/api/server";

/**
 * Webhook pembaruan cache landing page (`standar_cms.txt` bagian 4).
 *
 * Dipanggil oleh backend/dashboard saat tim marketing menekan "Publish
 * Perubahan Landing Page", sehingga konten CMS, daftar properti, dan daftar
 * paket tampil terbaru tanpa menunggu masa berlaku cache. Route Handler tidak
 * mendukung `updateTag`, maka data kedaluwarsa segera melalui `{ expire: 0 }`.
 *
 * Parameter: `?secret=<REVALIDATION_TOKEN>&path=/`
 */
export async function GET(request: NextRequest) {
  const rahasia = request.nextUrl.searchParams.get("secret");
  // Di Docker, nilai berasal dari backend/.env (env_file) sebagai satu-satunya
  // sumber; pada pengembangan lokal diambil dari frontend/.env.local.
  const token = process.env.APP_REVALIDATION_TOKEN || process.env.REVALIDATION_TOKEN;

  if (!token || rahasia !== token) {
    return Response.json(
      { success: false, error: { code: "unauthorized", message: "Token revalidasi tidak valid." } },
      { status: 401 },
    );
  }

  const path = request.nextUrl.searchParams.get("path") ?? "/";

  revalidateTag(TAG_LANDING, { expire: 0 });
  revalidateTag(TAG_PAKET, { expire: 0 });
  revalidateTag(TAG_PROPERTI, { expire: 0 });
  revalidatePath(path);

  return Response.json({ success: true, revalidated: true, path });
}
