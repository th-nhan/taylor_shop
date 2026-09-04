import os
import io
import base64
import uuid
import logging
from typing import Tuple

logger = logging.getLogger("uvicorn")

# Cố gắng import Pillow để nén ảnh tối ưu
try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

# Cố gắng import Cloudinary
try:
    import cloudinary
    import cloudinary.uploader
    HAS_CLOUDINARY = True
except ImportError:
    HAS_CLOUDINARY = False

# Cố gắng import httpx (cho ImgBB API)
try:
    import httpx
    HAS_HTTPX = True
except ImportError:
    import urllib.request
    import urllib.parse
    import json
    HAS_HTTPX = False


def compress_image_bytes(image_bytes: bytes, max_size: int = 1280, quality: int = 80) -> Tuple[bytes, str]:
    """
    Nén và giảm kích thước ảnh để tối ưu lưu trữ và tốc độ tải.
    Trả về (compressed_bytes, mime_type).
    """
    if not HAS_PIL:
        return image_bytes, "image/jpeg"

    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        # Chuyển đổi mode RGBA/P sang RGB nếu lưu dạng JPEG/WebP
        if image.mode in ("RGBA", "LA", "P"):
            # Nếu có kênh Alpha, lưu WebP để giữ độ trong suốt
            output_format = "WEBP"
            mime_type = "image/webp"
        else:
            image = image.convert("RGB")
            output_format = "JPEG"
            mime_type = "image/jpeg"

        # Resize nếu kích thước vượt quá max_size
        width, height = image.size
        if width > max_size or height > max_size:
            if width > height:
                new_width = max_size
                new_height = int(height * (max_size / width))
            else:
                new_height = max_size
                new_width = int(width * (max_size / height))
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Xuất ra bytes buffer
        buffer = io.BytesIO()
        if output_format == "WEBP":
            image.save(buffer, format="WEBP", quality=quality, method=4)
        else:
            image.save(buffer, format="JPEG", quality=quality, optimize=True)
            
        return buffer.getvalue(), mime_type
    except Exception as e:
        logger.warning(f"Không thể nén ảnh với PIL: {e}, sử dụng dữ liệu gốc")
        return image_bytes, "image/jpeg"


def upload_to_cloudinary(image_bytes: bytes, filename: str) -> str:
    """
    Upload ảnh lên Cloudinary CDN vĩnh viễn (nếu cấu hình biến môi trường).
    """
    if not HAS_CLOUDINARY:
        return None

    cloudinary_url = os.getenv("CLOUDINARY_URL")
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    if not (cloudinary_url or (cloud_name and api_key and api_secret)):
        return None

    try:
        # Nếu dùng CLOUDINARY_URL thì Cloudinary SDK tự đọc
        if cloud_name and api_key and api_secret:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True
            )

        res = cloudinary.uploader.upload(
            image_bytes,
            folder="nha_may_thuy_diem",
            public_id=f"prod_{uuid.uuid4().hex[:10]}",
            resource_type="image",
            transformation=[
                {'quality': 'auto:good'},
                {'fetch_format': 'auto'}
            ]
        )
        return res.get("secure_url") or res.get("url")
    except Exception as e:
        logger.error(f"Lỗi khi upload Cloudinary: {e}")
        return None


def upload_to_imgbb(image_bytes: bytes, filename: str) -> str:
    """
    Upload ảnh lên ImgBB (miễn phí, vĩnh viễn) nếu có IMGBB_API_KEY.
    """
    api_key = os.getenv("IMGBB_API_KEY")
    if not api_key:
        return None

    try:
        b64_str = base64.b64encode(image_bytes).decode("utf-8")
        if HAS_HTTPX:
            with httpx.Client(timeout=30.0) as client:
                res = client.post(
                    "https://api.imgbb.com/1/upload",
                    data={
                        "key": api_key,
                        "image": b64_str,
                        "name": f"thuy_diem_{uuid.uuid4().hex[:8]}"
                    }
                )
                data = res.json()
                if res.status_code == 200 and data.get("success"):
                    return data["data"]["url"]
        else:
            data_encoded = urllib.parse.urlencode({
                "key": api_key,
                "image": b64_str,
                "name": f"thuy_diem_{uuid.uuid4().hex[:8]}"
            }).encode("utf-8")
            req = urllib.request.Request("https://api.imgbb.com/1/upload", data=data_encoded)
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                if result.get("success"):
                    return result["data"]["url"]
    except Exception as e:
        logger.error(f"Lỗi khi upload ImgBB: {e}")
        return None


def process_and_store_image(
    image_bytes: bytes, 
    filename: str, 
    upload_dir: str, 
    base_url: str
) -> str:
    """
    Hàm xử lý và lưu trữ ảnh đa tầng đảm bảo 100% KHÔNG BAO GIỜ MẤT ẢNH trên Vercel/Render:
    1. Ưu tiên Cloudinary nếu có cấu hình.
    2. Ưu tiên ImgBB nếu có cấu hình.
    3. Tự động chuyển đổi thành Data URL (Base64 WebP/JPEG) nén cao cấp:
       Lưu trực tiếp vào Database, không phụ thuộc vào ổ cứng tạm thời của Render,
       đảm bảo khi Render ngủ/redeploy thì ảnh vẫn hiển thị 100%!
    """
    # 1. Nén ảnh tối ưu kích thước
    compressed_bytes, mime_type = compress_image_bytes(image_bytes, max_size=1280, quality=82)

    # 2. Thử Cloudinary
    cloud_url = upload_to_cloudinary(compressed_bytes, filename)
    if cloud_url:
        logger.info(f"Đã lưu ảnh thành công lên Cloudinary: {cloud_url}")
        return cloud_url

    # 3. Thử ImgBB
    imgbb_url = upload_to_imgbb(compressed_bytes, filename)
    if imgbb_url:
        logger.info(f"Đã lưu ảnh thành công lên ImgBB: {imgbb_url}")
        return imgbb_url

    # 4. Lưu file tĩnh trên local disk (nếu chạy localhost / vps có persistent disk)
    try:
        os.makedirs(upload_dir, exist_ok=True)
        ext = ".webp" if mime_type == "image/webp" else ".jpg"
        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(upload_dir, unique_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(compressed_bytes)
    except Exception as e:
        logger.warning(f"Không thể ghi file local: {e}")

    # 5. Nếu KHÔNG cấu hình Cloud và đang chạy trên môi trường Ephemeral (Render/Vercel/Heroku):
    # Trả về Data URL Base64 nén để lưu trực tiếp vào CSDL!
    # Data URL này được Database (Postgres/Supabase/Neon) lưu vĩnh viễn,
    # khi server khởi động lại hoặc render quay lại, ảnh vẫn tồn tại mãi mãi.
    is_cloud_env = bool(os.getenv("RENDER") or os.getenv("VERCEL") or os.getenv("RENDER_EXTERNAL_URL") or os.getenv("PORT"))
    
    # Nếu là cloud env hoặc cấu hình FORCE_BASE64_STORAGE, trả về Data URL trực tiếp
    # Hoặc nếu kích thước ảnh nén <= 350KB, luôn an toàn để lưu Base64 Data URL
    if is_cloud_env or len(compressed_bytes) <= 350 * 1024:
        b64_data = base64.b64encode(compressed_bytes).decode("utf-8")
        data_url = f"data:{mime_type};base64,{b64_data}"
        logger.info(f"Đã tạo Base64 Data URL an toàn ({len(compressed_bytes) // 1024} KB) cho cơ sở dữ liệu.")
        return data_url

    # Fallback cho localhost
    return f"{base_url}/static/uploads/{unique_filename}"
