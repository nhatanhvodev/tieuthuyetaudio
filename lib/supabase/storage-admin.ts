import { createClient } from "@supabase/supabase-js";

type UploadParams = {
  bucket: string;
  objectPath: string;
  body: ArrayBuffer | Buffer;
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
};

function getSupabaseStorageAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Thieu cau hinh Supabase Storage. Can NEXT_PUBLIC_SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

export async function uploadBufferToSupabaseStorage({
  bucket,
  objectPath,
  body,
  contentType,
  cacheControl = "3600",
  upsert = false
}: UploadParams): Promise<{ path: string; publicUrl: string }> {
  const supabase = getSupabaseStorageAdminClient();

  const { data, error } = await supabase.storage.from(bucket).upload(objectPath, body, {
    contentType,
    cacheControl,
    upsert
  });

  if (error || !data?.path) {
    throw new Error(error?.message ?? "Upload Supabase thất bại.");
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  if (!publicData?.publicUrl) {
    throw new Error("Không lấy được public URL từ Supabase.");
  }

  return { path: data.path, publicUrl: publicData.publicUrl };
}
