import "server-only";

import { getCloudinary } from "@/lib/cloudinary";

export const MAX_COURSE_THUMBNAIL_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const COURSE_THUMBNAIL_FOLDER = "class-hub/course-thumbnails";

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function validateCourseThumbnail(image: File) {
  if (
    !ALLOWED_IMAGE_TYPES.has(image.type) ||
    !ALLOWED_EXTENSIONS.has(getExtension(image.name))
  ) {
    return "Only JPG, JPEG, PNG, and WEBP images are allowed";
  }

  if (image.size > MAX_COURSE_THUMBNAIL_SIZE) {
    return "Image must be 5 MB or smaller";
  }

  return null;
}

export async function uploadCourseThumbnail(image: File) {
  const bytes = Buffer.from(await image.arrayBuffer());
  const cloudinary = getCloudinary();

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: COURSE_THUMBNAIL_FOLDER,
        resource_type: "image",
        transformation: [
          {
            width: 1600,
            height: 900,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      },
    );

    upload.end(bytes);
  });
}

export async function deleteCourseThumbnail(publicId?: string) {
  if (!publicId?.startsWith(`${COURSE_THUMBNAIL_FOLDER}/`)) {
    return;
  }

  await getCloudinary().uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
}

export function getCourseThumbnailPublicId(url?: string) {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname !== "res.cloudinary.com") {
      return undefined;
    }

    const uploadMarker = "/image/upload/";
    const uploadIndex = parsed.pathname.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return undefined;
    }

    const pathAfterUpload = parsed.pathname.slice(
      uploadIndex + uploadMarker.length,
    );
    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    const publicId = decodeURIComponent(withoutVersion).replace(/\.[^/.]+$/, "");

    return publicId.startsWith(`${COURSE_THUMBNAIL_FOLDER}/`)
      ? publicId
      : undefined;
  } catch {
    return undefined;
  }
}
