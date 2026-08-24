import os
import re
from typing import List, Optional, Dict, Any
from sqlmodel import Session, select
from app.models import Product

# ==============================================================================
# HỆ THỐNG TRI THỨC CHUYÊN SÂU NHÀ MAY THÚY DIỄM (TAILOR EXPERT KNOWLEDGE BASE)
# ==============================================================================

STORE_INFO = {
    "name": "Nhà May Thúy Diễm",
    "address": "Số 123 Đường Thời Trang, Phường May Đo, TP. Hồ Chí Minh",
    "phone": "0988.123.456 / 0909.888.999",
    "open_hours": "08:00 - 21:00 (Tất cả các ngày trong tuần, kể cả Chủ Nhật và ngày lễ)",
    "policy": "Bảo hành chỉnh sửa miễn phí trọn đời đường may và hỗ trợ bóp/nới theo số đo khách hàng."
}

# 1. BẢNG GIÁ DỊCH VỤ MAY ĐO THAM KHẢO
PRICE_GUIDE = """
📌 **BẢNG GIÁ MAY ĐO THAM KHẢO TẠI NHÀ MAY THÚY DIỄM**:
• **Áo Sơ mi (Nam/Nữ)**:
  - Tiền công may: 180.000đ - 250.000đ/áo
  - Trọn gói (công + vải Bamboo/Cotton cao cấp): 280.000đ - 420.000đ/áo
• **Quần Tây / Quần Âu (Nam/Nữ)**:
  - Tiền công may: 190.000đ - 280.000đ/quần
  - Trọn gói (công + vải Tuyết mưa/Kaki thun 4 chiều): 290.000đ - 450.000đ/quần
• **Đầm Thiết Kế / Đầm Công Sở / Đầm Dự Tiệc**:
  - Tiền công may: 250.000đ - 450.000đ (đầm suông/chữ A) | 450.000đ - 750.000đ (đầm dạ hội/xòe nhiều tầng)
  - Trọn gói (công + lụa Satin/Mango/Tơ tằm): 380.000đ - 850.000đ/bộ
• **Áo Dài Truyền Thống & Cách Tân**:
  - Tiền công may: 350.000đ - 550.000đ (áo dài 2 tà) | 550.000đ - 900.000đ (áo dài 4 tà, đính kết/thêu tay)
  - Trọn gói cả bộ (áo + quần phi lụa): 550.000đ - 1.200.000đ/bộ
• **Bộ Vest / Suit / Blazer**:
  - Áo Blazer nữ thời trang: 500.000đ - 850.000đ
  - Áo Vest nam cao cấp (ép mex chuẩn form): 900.000đ - 1.600.000đ
  - Cả bộ Suit (Áo vest + Quần âu): 1.300.000đ - 2.200.000đ
• **Đồ Bộ Mặc Nhà / Pyjama Cao Cấp**:
  - Trọn gói lụa Satin / Đũi xốp: 230.000đ - 350.000đ/bộ

💡 *Lưu ý: Tiệm nhận may cả vải của khách mang đến lẫn may trọn gói bao vải với nguồn vải tuyển chọn loại 1.*
"""

# 2. QUY TRÌNH MAY ĐO & DỊCH VỤ MAY GẤP
WORKFLOW_GUIDE = """
✨ **QUY TRÌNH ĐẶT MAY TẠI NHÀ MAY THÚY DIỄM**:
1. **Tư vấn & Chọn mẫu**: Chọn mẫu có sẵn trên website hoặc gửi ảnh mẫu bạn thích qua chat/Zalo.
2. **Chọn chất liệu vải**: Tư vấn loại vải phù hợp nhất với kiểu dáng, vóc dáng và ngân sách.
3. **Lấy số đo chuẩn**:
   - Trực tiếp: Đến tiệm để thợ chính đo trực tiếp.
   - Từ xa: Tiệm gửi bảng hướng dẫn tự đo tại nhà đơn giản và chuẩn xác.
4. **Cắt may & Thử đồ (Fitting)**: Sau 3-5 ngày, bạn có thể ghé thử phom hoặc nhận hàng tận nhà.
5. **Chỉnh sửa hoàn thiện**: Hỗ trợ căn chỉnh bóp/nới hoàn toàn MIỄN PHÍ đến khi bạn thật sự ưng ý!

⚡ **DỊCH VỤ MAY GẤP (HỎA TỐC)**:
- Tiệm có nhận **May gấp trong 24h - 48h** cho khách cần đi tiệc, sự kiện hoặc công tác đột xuất (phụ thu nhẹ từ 50.000đ - 100.000đ tiền tăng ca thợ).
"""

# 3. CẨM NANG HƯỚNG DẪN TỰ LẤY SỐ ĐO TẠI NHÀ
MEASUREMENT_GUIDE = """
📏 **HƯỚNG DẪN CÁCH TỰ ĐO KÍCH THƯỚC TẠI NHÀ BẰNG THƯỚC DÂY**:
1. **Vòng Ngực (V1)**: Đo quanh phần nở nhất của ngực (mặc áo ngực vừa vặn khi đo).
2. **Vòng Eo (V2)**: Đo phần thắt nhỏ nhất của bụng (thường cách rốn 2-3cm phía trên).
3. **Vòng Mông (V3)**: Đo quanh phần nở nhất của vòng 3.
4. **Rộng Vai**: Đo từ đỉnh xương vai bên này sang đỉnh xương vai bên kia qua gáy.
5. **Dài Tay**: Đo từ đỉnh vai xuống đến cổ tay hoặc vị trí tay áo bạn muốn.
6. **Dài Áo / Đầm**: Đo từ chân cổ sau xuôi thẳng xuống đến độ dài mong muốn (qua gối, ngang bắp chân hay chấm gót).
7. **Dài Quần**: Đo từ cạp quần (vị trí bạn muốn mặc lưng cao/vừa) xuống đến gấu quần (trên mắt cá hoặc phủ gót).

💡 *Bạn chỉ cần đo theo các bước trên rồi gửi số đo, thợ cắt may lành nghề của tiệm sẽ tự động cộng độ cử động và tạo phom dáng tôn dáng nhất cho bạn!*
"""

# 4. DANH MỤC CÁC CHỦ ĐỀ PROMPT GỢI Ý CHO GIAO DIỆN
QUICK_PROMPT_CATEGORIES = [
    {
        "category": "Tất cả",
        "prompts": [
            "May đầm dạ hội chọn vải gì sang trọng?",
            "Bảng giá may sơ mi và quần tây công sở?",
            "Tư vấn kiểu đầm cho người béo bụng?",
            "Nhà may có nhận may gấp trong 24h không?",
            "Hướng dẫn cách tự lấy số đo tại nhà?",
            "May áo dài cưới hoặc đi tiệc giá bao nhiêu?"
        ]
    },
    {
        "category": "Chất liệu vải",
        "prompts": [
            "Vải lụa Satin và lụa Mango khác nhau thế nào?",
            "Vải Bamboo may sơ mi có mát và chống nhăn không?",
            "May quần tây nên chọn vải Tuyết mưa hay Kaki thun?",
            "Vải Đũi (Linen) mặc hè có mát và nhăn không?",
            "Vải Tweed phù hợp may kiểu áo váy nào?"
        ]
    },
    {
        "category": "Vóc dáng & Phom dáng",
        "prompts": [
            "Người dáng quả lê (hông đùi to) nên mặc đầm gì?",
            "Người thấp bé (dưới 1m55) mặc quần gì để hack chân dài?",
            "Người gầy muốn mặc đầm trông đầy đặn hơn?",
            "Người có bắp tay to nên may kiểu tay áo nào?",
            "Dáng người tròn trịa mập mạp may kiểu gì thon gọn?"
        ]
    },
    {
        "category": "Bảng giá & Dịch vụ",
        "prompts": [
            "Tiền công may đầm và sơ mi bao nhiêu?",
            "May một bộ Suit/Vest nam trọn gói bao nhiêu tiền?",
            "Tiệm có nhận may bằng vải của khách tự mua không?",
            "Sau bao lâu thì có đồ và có được thử đồ chỉnh sửa không?",
            "Địa chỉ và giờ mở cửa của Nhà May Thúy Diễm?"
        ]
    },
    {
        "category": "Áo dài & Dạ hội",
        "prompts": [
            "May áo dài truyền thống 4 tà cần bao nhiêu mét vải?",
            "Áo dài cách tân trẻ trung hợp mặc dịp nào?",
            "Đầm dạ hội đuôi cá hay xòe chữ A tôn dáng hơn?",
            "Tư vấn trang phục đi đám cưới vừa thanh lịch vừa nổi bật"
        ]
    }
]


def find_matching_products(query: str, session: Session) -> List[Product]:
    """Tìm kiếm các sản phẩm trong CSDL phù hợp với câu hỏi."""
    statement = select(Product)
    all_products = session.exec(statement).all()
    matched = []
    
    q_lower = query.lower()
    for p in all_products:
        # Khớp theo tên sản phẩm
        if p.name.lower() in q_lower or any(word in q_lower for word in p.name.lower().split() if len(word) > 2):
            matched.append(p)
            continue
        # Khớp theo danh mục
        if any(cat.lower() in q_lower for cat in p.categories):
            matched.append(p)
            continue
    return matched[:3]


def generate_expert_reply(user_text: str, session: Session) -> str:
    """
    Bộ não tư vấn chuyên gia của Nhà May Thúy Diễm (Rule-based NLP & Knowledge Base).
    Xử lý thông minh theo ngữ cảnh đa dạng của ngành may đo thời trang.
    """
    msg = user_text.strip().lower()

    # -------------------------------------------------------------------------
    # 0. NẾU HỎI VỀ SẢN PHẨM CỤ THỂ TRONG DATABASE (Từ nút "Tư vấn mẫu" hoặc gõ tên)
    # -------------------------------------------------------------------------
    all_products = session.exec(select(Product)).all()
    for p in all_products:
        if p.name.lower() in msg or (f"mẫu '{p.name.lower()}'" in msg):
            fabrics_str = ", ".join(p.fabric_recommendations) if p.fabric_recommendations else "Lụa cao cấp, Tuyết mưa"
            details_str = "\n".join([f"  • **{k}**: {v}" for k, v in p.design_details.items()]) if p.design_details else ""
            
            reply = f"👗 **Tư vấn chi tiết về mẫu: {p.name}**\n\n"
            reply += f"• **Phong cách & Kiểu dáng**: {p.description}\n"
            reply += f"• **Dành cho**: {p.target_gender} | Danh mục: {', '.join(p.categories)}\n"
            reply += f"• **Mức giá may ước tính**: {p.price_estimate}\n"
            if details_str:
                reply += f"• **Chi tiết thiết kế phom dáng**:\n{details_str}\n"
            reply += f"• **Chất liệu vải tối ưu**: {fabrics_str}\n\n"
            reply += "💡 *Mẹo từ Thợ may*: Bạn có thể yêu cầu may đo chuẩn theo số đo riêng của mình hoặc tùy chỉnh độ dài áo/váy, tay áo, cổ áo theo sở thích nhé! Bạn muốn tiệm tư vấn thêm về chọn vải hay đặt lịch lấy số đo ạ?"
            return reply

    # -------------------------------------------------------------------------
    # 1. HỎI VỀ BẢNG GIÁ, CHI PHÍ, TIỀN CÔNG MAY
    # -------------------------------------------------------------------------
    if any(k in msg for k in ["giá", "nhiêu", "chi phí", "tiền công", "bảng giá", "bao nhiêu tiền", "hết bao nhiêu"]):
        if any(k in msg for k in ["sơ mi", "áo sơ mi"]):
            return "👔 **Chi phí may Áo Sơ Mi tại Nhà May Thúy Diễm**:\n- Công may: 180.000đ - 250.000đ/áo\n- Trọn gói (công + vải Bamboo/Cotton cao cấp): 280.000đ - 420.000đ/áo\n- Miễn phí thêu tên cá nhân hóa lên măng séc/cổ áo.\nBạn muốn may sơ mi nam dáng Slimfit hay sơ mi nữ lụa cách điệu ạ?"
        if any(k in msg for k in ["quần", "quần tây", "quần âu"]):
            return "👖 **Chi phí may Quần Tây / Quần Âu**:\n- Tiền công may: 190.000đ - 280.000đ/quần\n- Trọn gói (công + vải Tuyết mưa phom đứng / Kaki thun 4 chiều): 290.000đ - 450.000đ/quần\nTiệm bảo hành chỉnh sửa form dáng miễn phí trọn đời cho bạn nhé!"
        if any(k in msg for k in ["áo dài", "ao dai"]):
            return "🌸 **Bảng giá may Áo Dài tại Nhà May Thúy Diễm**:\n- Công may áo dài truyền thống (2 tà): 350.000đ - 450.000đ/bộ\n- Công may áo dài cách tân / 4 tà: 450.000đ - 650.000đ/bộ\n- Trọn gói bao gồm vải Gấm / Tơ tằm / Lụa Tây Thi: từ 550.000đ - 1.200.000đ/bộ tuỳ mẫu.\nBạn đang chuẩn bị may áo dài cho dịp cưới hỏi, sự kiện hay đi dạy/đi làm ạ?"
        if any(k in msg for k in ["đầm", "váy", "dạ hội"]):
            return "👗 **Bảng giá may Đầm / Váy thiết kế**:\n- Đầm công sở / đầm suông nhẹ: 250.000đ - 450.000đ (công may)\n- Đầm dạ hội / đầm xòe công chúa dự tiệc: 450.000đ - 750.000đ (công may)\n- Giá trọn gói bao vải lụa Satin / Gấm / Voan: 380.000đ - 850.000đ/bộ.\nBạn có sẵn ảnh mẫu chưa, có thể gửi tiệm báo giá chính xác ngay nhé!"
        if any(k in msg for k in ["vest", "suit", "blazer"]):
            return "🤵 **Bảng giá may Vest / Suit / Blazer**:\n- Áo Blazer nữ thời trang: 500.000đ - 850.000đ (công + vải)\n- Áo Vest nam cao cấp dựng phom chuẩn: 900.000đ - 1.600.000đ\n- Cả bộ Suit nam (Áo vest + Quần tây): 1.300.000đ - 2.200.000đ\nTiệm dùng mex cao cấp ép nhiệt và đệm vai nhập khẩu giúp áo đứng phom tuyệt đối mà không bị nặng nề."
        return PRICE_GUIDE

    # -------------------------------------------------------------------------
    # 1.1 HỎI VỀ VIỆC MANG VẢI TỚI HAY DÙNG VẢI CỦA QUÁN / TIỆM
    # -------------------------------------------------------------------------
    if any(k in msg for k in [
        "vải chỗ khác", "vải của quán", "vải của tiệm", "vải tiệm", "mang vải", "đem vải",
        "tự mua vải", "tự mang vải", "vải tự mua", "vải ngoài", "có nhận vải", "lấy vải của quán",
        "dùng vải của quán", "vải ở tiệm", "tiệm có vải không", "có sẵn vải không", "vải của mình"
    ]):
        return (
            "🧵 **Dạ Nhà May Thúy Diễm NHẬN MAY CẢ 2 HÌNH THỨC tùy theo nhu cầu và sự thuận tiện của bạn ạ**:\n\n"
            "1. **Bạn tự mang vải tới (Chỉ tính tiền công may)**:\n"
            "   • Bạn có thể tự mua loại vải mình yêu thích đem tới tiệm hoặc gửi ship qua.\n"
            "   • Thợ may sẽ kiểm tra chất vải, tư vấn kiểu dáng phù hợp với độ co giãn và cắt may theo chuẩn số đo của bạn.\n\n"
            "2. **May trọn gói (Tiệm bao trọn gói cả vải + công may)**:\n"
            "   • Tiệm có sẵn kho vải cao cấp tuyển chọn loại 1 (Lụa Satin, Lụa Mango, Bamboo sợi tre, Tuyết mưa Hàn Quốc, Kaki thun 4 chiều, Vải Tweed, Gấm dệt, Linen...).\n"
            "   • Giá may trọn gói niêm yết rõ ràng, bạn không cần mất công đi tìm mua vải ở ngoài.\n\n"
            "✨ *Cam kết*: Cả 2 hình thức đều được thợ may chính cắt may tỉ mỉ và **bảo hành chỉnh sửa phom dáng, bóp/nới miễn phí 100%** đến khi bạn thật sự hài lòng!\n\n"
            "Bạn đang có sẵn vải muốn mang qua tiệm hay muốn tiệm tư vấn chọn vải có sẵn ạ?"
        )

    # -------------------------------------------------------------------------
    # 2. HỎI VỀ THỜI GIAN MAY, MAY GẤP, QUY TRÌNH ĐẶT MAY
    # -------------------------------------------------------------------------
    if any(k in msg for k in ["may gấp", "lấy liền", "gấp trong", "bao lâu", "mấy ngày", "quy trình", "thời gian may", "hỏa tốc"]):
        return WORKFLOW_GUIDE

    # -------------------------------------------------------------------------
    # 3. HỎI VỀ CÁCH LẤY SỐ ĐO, TỰ ĐO TẠI NHÀ
    # -------------------------------------------------------------------------
    if any(k in msg for k in ["số đo", "cách đo", "tự đo", "lấy số đo", "bảng size", "đo tại nhà"]):
        return MEASUREMENT_GUIDE

    # -------------------------------------------------------------------------
    # 4. HỎI VỀ ĐỊA CHỈ, LIÊN HỆ, GIỜ MỞ CỬA
    # -------------------------------------------------------------------------
    if any(k in msg for k in ["địa chỉ", "ở đâu", "tiệm ở đâu", "giờ mở cửa", "liên hệ", "số điện thoại", "sđt", "hotline"]):
        return f"🏡 **THÔNG TIN LIÊN HỆ NHÀ MAY THÚY DIỄM**:\n• **Địa chỉ**: {STORE_INFO['address']}\n• **Hotline / Zalo tư vấn**: {STORE_INFO['phone']}\n• **Giờ mở cửa**: {STORE_INFO['open_hours']}\n• **Chính sách**: {STORE_INFO['policy']}\n\nBạn có thể ghé trực tiếp bất cứ lúc nào để chọn vải và lấy số đo, hoặc nhắn tin cho tiệm để được phục vụ chu đáo nhất nhé!"

    # -------------------------------------------------------------------------
    # 5. TƯ VẤN CHUYÊN SÂU VỀ CHẤT LIỆU VẢI
    # -------------------------------------------------------------------------
    if any(k in msg for k in ["vải gì", "chất liệu", "vải lụa", "vải bamboo", "tuyết mưa", "kaki", "vải đũi", "linen", "vải tweed", "voan", "chiffon", "chọn vải"]):
        if any(k in msg for k in ["lụa", "satin", "mango", "latin", "tơ tằm"]):
            return "✨ **Cẩm nang về Vải Lụa tại Nhà May Thúy Diễm**:\n• **Lụa Satin**: Bề mặt bóng mịn óng ả, độ rủ cực đẹp, chuyên may đầm dạ hội, váy slip dress hoặc áo dài cao cấp.\n• **Lụa Mango / Lụa Latin**: Mềm mát, ít nhăn, độ co giãn nhẹ, rất thích hợp may đầm suông, áo sơ mi nữ thắt nơ hoặc đồ bộ mặc nhà.\n• **Lụa Tây Thi / Tơ Tằm**: Nhẹ bẫng, thoáng khí tuyệt đối, phù hợp may áo dài truyền thống và áo kiểu tiểu thư.\n\n💡 *Cách bảo quản*: Nên giặt tay bằng sữa tắm/nước giặt nhẹ, phơi nơi râm mát và ủi ở nhiệt độ lụa vừa phải."
        
        if any(k in msg for k in ["bamboo", "sợi tre", "cotton"]):
            return "🌿 **Tư vấn Vải Bamboo (Sợi tre) & Cotton 100%**:\n• **Vải Bamboo**: Kháng khuẩn tự nhiên, siêu thấm hút mồ hôi, mềm mịn mát lạnh khi chạm vào da và **chống nhăn tự nhiên cực tốt**.\n• **Vải Cotton 100%**: Đứng phom áo, thấm hút tốt, rất phù hợp may sơ mi công sở nam/nữ hoặc áo phông may đo.\n\n👉 Nếu bạn làm việc văn phòng máy lạnh hoặc hay di chuyển ngoài trời, vải Bamboo sợi tre là lựa chọn hoàn hảo số 1!"
        
        if any(k in msg for k in ["tuyết mưa", "kaki", "quần tây", "váy bút chì"]):
            return "👖 **Tư vấn Vải Tuyết Mưa & Kaki Thun**:\n• **Vải Tuyết Mưa cao cấp**: Không nhăn, không xù lông, bề mặt đanh mịn, độ đứng dáng chuẩn, chuyên dùng may Quần tây, Chân váy bút chì và Đầm công sở chữ A.\n• **Kaki Thun 4 chiều**: Co giãn tuyệt vời, dày dặn nhưng êm ái, rất phù hợp may quần tây nam nữ cho người hay phải vận động nhiều.\n\nCả 2 loại vải này đều giặt máy thoải mái mà không lo mất phom!"
            
        if any(k in msg for k in ["đũi", "linen"]):
            return "🍃 **Tư vấn Vải Đũi / Linen tự nhiên**:\n• **Đặc tính**: Vải dệt từ sợi lanh tự nhiên, cực kỳ mộc mạc, nhẹ và siêu thoáng mát trong ngày hè oi bức.\n• **Kiểu dáng thích hợp**: Đồ bộ mặc nhà, đầm suông dạo phố, set áo sát nách + quần culottes đi biển.\n• **Mẹo may**: Tiệm luôn xử lý giặt co trước khi cắt may để sau khi giặt đồ không bị rút ngắn!"

        if any(k in msg for k in ["tweed", "dạ tweed"]):
            return "🧥 **Tư vấn Vải Dạ Tweed sang trọng**:\n• **Đặc tính**: Sợi dệt nổi hạt đặc trưng theo phong cách Chanel quý phái, giữ ấm tốt và có phom dáng đứng cá tính.\n• **Kiểu dáng lý tưởng**: Áo khoác Blazer lửng croptop, set áo dạ + chân váy chữ A dự tiệc mùa thu đông.\nTiệm may lót lụa habutai mềm mượt bên trong để khi mặc không bị ngứa cộm da."

        return "🧵 **Tư vấn chọn vải theo loại trang phục**:\n• **Đầm dạ hội / đi tiệc**: Lụa Satin, Tần lụa, Vải Gấm dệt, Voan Chiffon.\n• **Áo sơ mi**: Vải Bamboo sợi tre, Cotton chống nhăn, Lụa Tây Thi.\n• **Quần tây & Chân váy**: Tuyết mưa Hàn Quốc, Kaki thun 4 chiều, Wool pha Spandex.\n• **Áo dài**: Lụa Tây Thi, Lụa Bảo Anh, Gấm hoa chìm, Ren thêu.\n• **Bộ mặc nhà**: Lụa Mango, Đũi xốp mềm, Lụa Satin mịn.\n\nBạn đang muốn may loại trang phục nào để thợ may chọn chất liệu ưng ý nhất cho bạn nhé!"

    # -------------------------------------------------------------------------
    # 6. TƯ VẤN VÓC DÁNG & CHE KHUYẾT ĐIỂM (BODY STYLING ADVICE)
    # -------------------------------------------------------------------------
    if any(k in msg for k in ["dáng", "béo", "mập", "bụng", "gầy", "ốm", "lùn", "thấp", "quả lê", "quả táo", "bắp tay", "đùi to", "vai to", "hack dáng", "che khuyết điểm"]):
        if any(k in msg for k in ["bụng", "béo bụng", "mỡ bụng", "bụng to", "vòng 2"]):
            return "👗 **Bí quyết chọn đồ Giấu Bụng & Tôn Dáng hoàn hảo**:\n1. **Đầm suông nhẹ chữ A**: Không bám sát eo, che trọn vòng 2 mà vẫn tạo cảm giác thon thả.\n2. **Đầm thắt eo cao (Empire waist)**: Điểm thắt eo nằm ngay dưới chân ngực giúp che bụng dưới khéo léo.\n3. **Quần tây cạp cao bản lưng 5cm**: Vừa định hình nịt nhẹ vòng eo, vừa làm đôi chân trông dài hơn.\n4. **Chất liệu khuyên dùng**: Vải Tuyết mưa, Lụa Mango hoặc Đũi có độ rủ tự nhiên, tránh chất liệu thun quá mỏng ôm sát.\n\nNhà May Thúy Diễm có nhiều mẫu đầm suông phối xếp ly giấu bụng cực đẹp, bạn có muốn xem thử không ạ?"

        if any(k in msg for k in ["lùn", "thấp", "chiều cao", "1m5", "1m4", "chân ngắn"]):
            return "👠 **Mẹo Hack Chiều Cao Cho Nàng/Chàng Khiêm Tốn Chiều Cao**:\n• **Với Quần Tây**: May cạp siêu cao trên rốn, ống đứng hoặc ống loe nhẹ dài trùm gót giày cao gót giúp đôi chân dài miên man.\n• **Với Đầm/Váy**: Chọn đầm có độ dài trên đầu gối 7-10cm hoặc hẳn đầm dài maxi lưng cao. Tránh váy lửng ngang bắp chân.\n• **Họa tiết & Cổ áo**: Ưu tiên cổ chữ V khoét sâu giúp cổ thanh thoát, họa tiết kẻ sọc dọc hoặc may đơn sắc (monochrome) từ trên xuống dưới."

        if any(k in msg for k in ["quả lê", "hông to", "đùi to"]):
            return "🍐 **Tư vấn trang phục cho Dáng Quả Lê (Vai nhỏ, Hông đùi đầy đặn)**:\n• **Thân trên**: May áo kiểu tay bồng, cổ vuông, cổ nơ hoặc đính kết để hút mắt nhìn lên thân trên và tạo sự cân đối cho vai.\n• **Thân dưới**: Đầm xòe chữ A mềm mại, chân váy midi xòe nhẹ hoặc quần tây ống suông rộng màu tối (đen, than chì, nâu đất) để che trọn phần đùi.\nTránh mặc quần quá ôm sát bó chẽn (skinny) hoặc đầm ôm bodycon quá căng phần hông đùi."

        if any(k in msg for k in ["gầy", "ốm", "mảnh khảnh", "ngực nhỏ"]):
            return "🌸 **Bí quyết phối đồ cho Nàng Dáng Mảnh Mai / Gầy**:\n• **Chi tiết thiết kế**: Nên chọn đầm có chi tiết xếp ly, nhún bèo ngực, tay bồng cánh tiên để tạo độ phồng tự nhiên cho cơ thể.\n• **Chất liệu**: Chọn vải có độ đứng phom như Vải Tweed, Vải Gấm dệt, Cotton xốp hoặc Organza nhiều tầng.\n• **Màu sắc**: Ưu tiên gam màu sáng và ngọt ngào như trắng kem, hồng phấn, pastel, hoa nhí tươi tắn để trông tràn đầy sức sống."

        if any(k in msg for k in ["bắp tay", "bắp tay to", "vai to", "vai thô"]):
            return "✨ **Mẹo Che Bắp Tay To & Vai Thô**:\n• **Kiểu tay áo**: Tay lỡ qua khuỷu tay bo nhún nhẹ, tay cánh dơi hoặc tay bồng nhẹ rủ mềm bằng voan.\n• **Kiểu cổ**: Tránh áo sát nách hay áo cúp ngực. Thay vào đó hãy chọn áo cổ tim, cổ chữ V hoặc cổ thuyền thoải mái.\nThợ may sẽ đo chính xác vòng bắp tay để chừa độ cử động thoải mái nhất khi bạn nâng tay làm việc!"

        return "🎯 **Tư vấn phom dáng theo vóc dáng riêng**:\nNhà May Thúy Diễm may theo số đo cá nhân hóa 100%, nên dù bạn có vóc dáng gầy, tròn, thấp hay cao, thợ may đều sẽ cân đối tỉ lệ vai - ngực - eo - mông để tạo ra bộ trang phục tôn ưu điểm và che khuyết điểm tốt nhất!\nBạn có thể cho tiệm biết chiều cao, cân nặng và kiểu đồ bạn muốn may nhé!"

    # -------------------------------------------------------------------------
    # 7. TƯ VẤN TRANG PHỤC THEO DỊP (SỰ KIỆN, ĐÁM CƯỚI, CÔNG SỞ, TẾT...)
    # -------------------------------------------------------------------------
    if any(k in msg for k in ["đi tiệc", "dự tiệc", "đám cưới", "công sở", "đi làm", "đi chơi", "du lịch", "tết", "lễ tết", "hội nghị", "sự kiện", "phỏng vấn"]):
        if any(k in msg for k in ["đám cưới", "dự tiệc", "đi tiệc", "dạ hội"]):
            return "🥂 **Gợi ý trang phục Dự Tiệc & Đám Cưới sang trọng**:\n• **Quý cô**: Đầm dạ hội lụa Satin cổ đổ nữ tính, đầm xòe gấm chìm tiểu thư, hoặc set Áo dài cách tân lụa thêu hoa duyên dáng.\n• **Quý ông**: Suit/Vest màu xanh navy hoặc xám ghi phối sơ mi trắng cổ Đức và cà vạt tinh tế.\n• **Màu sắc gợi ý**: Đỏ ruby, xanh ngọc bảo, vàng đồng, hồng pastel (tránh mặc đồ toàn màu trắng trùng cô dâu nhé!)."

        if any(k in msg for k in ["công sở", "đi làm", "phỏng vấn", "hội nghị"]):
            return "💼 **Gợi ý trang phục Công Sở Thanh Lịch & Chuyên Nghiệp**:\n• **Combo chuẩn**: Áo sơ mi vải Bamboo sợi tre (chống nhăn cả ngày) + Quần tây cạp cao ống đứng vải Tuyết Mưa.\n• **Đầm công sở**: Đầm chữ A cổ V thanh lịch vừa kín đáo vừa hiện đại.\n• **Khoác ngoài**: Áo Blazer cùng tone màu tạo nét quyền lực và chỉn chu khi gặp đối tác."

        if any(k in msg for k in ["tết", "lễ tết", "du xuân"]):
            return "🌸 **Trang phục Đón Tết & Du Xuân rực rỡ**:\n• Áo dài truyền thống gấm hoa đào/hoa mai 4 tà sang trọng.\n• Áo dài cách tân kết hợp chân váy xòe hoặc quần ống suông năng động.\n• Set đồ bộ lụa Bảo Anh cao cấp mặc chúc Tết gia đình vừa mát vừa lịch sự."

    # -------------------------------------------------------------------------
    # 8. HỎI VỀ MAY ÁO DÀI
    # -------------------------------------------------------------------------
    if any(k in msg for k in ["áo dài", "ao dai"]):
        return "🌸 **Tư vấn May Áo Dài tại Nhà May Thúy Diễm**:\n• **Các dòng áo dài**: Áo dài truyền thống 2 tà/4 tà, Áo dài cách tân, Áo dài cô dâu/bà sui, Áo dài học sinh/giáo viên.\n• **Chất liệu**: Lụa Tây Thi, Lụa Gấm, Tơ Tằm, Voan thêu ren cao cấp.\n• **Đặc điểm**: Cắt phom chuẩn eo cong quyến rũ, đường may mí sắc sảo, tà áo bay bổng không bị giật tà.\n• **Thời gian hoàn thiện**: 3 - 5 ngày (có nhận may gấp 48h).\nBạn muốn may áo dài cho dịp nào để tiệm gợi ý mẫu và chất vải ạ?"

    # -------------------------------------------------------------------------
    # 9. HỎI VỀ SƠ MI / QUẦN TÂY / BLAZER
    # -------------------------------------------------------------------------
    if any(k in msg for k in ["sơ mi", "ao so mi", "áo sơ mi"]):
        return "👔 **Tư vấn May Áo Sơ Mi Chuẩn May Đo**:\n• **Nam**: Sơ mi Slimfit tôn ngực vai hoặc Classic rộng rãi thoải mái. Cổ Đức cứng cáp, măng séc vát góc, thêu tên cá nhân.\n• **Nữ**: Sơ mi lụa cổ thắt nơ, sơ mi cổ vest bẻ, sơ mi tay bồng nhẹ phong cách Hàn Quốc.\n• **Chất liệu khuyên dùng**: Vải Bamboo kháng khuẩn mát lạnh, Cotton chống nhăn hoặc Lụa Latin mềm mại.\nGiá may trọn gói chỉ từ 280.000đ/áo."

    if any(k in msg for k in ["quần tây", "quan tay", "quần âu"]):
        return "👖 **Tư vấn May Quần Tây / Quần Âu**:\n• **Nữ**: Quần cạp siêu cao giấu bụng hack chân dài, ống suông rộng trendy hoặc ống đứng thanh lịch.\n• **Nam**: Quần tây 1 ly lịch lãm, form đứng chuẩn chỉ, túi xéo sâu tiện để điện thoại, lưng quần ôm êm ái.\n• **Chất liệu**: Tuyết mưa dệt đanh hoặc Kaki thun co giãn 4 chiều.\nGiá công may chỉ từ 190.000đ - 280.000đ/quần."

    # -------------------------------------------------------------------------
    # 10. PHẢN HỒI MẶC ĐỊNH THÂN THIỆN & HƯỚNG DẪN CỤ THỂ
    # -------------------------------------------------------------------------
    matched_prods = find_matching_products(user_text, session)
    if matched_prods:
        p_names = ", ".join([f"**{p.name}** ({p.price_estimate})" for p in matched_prods])
        return f"Dạ, về nhu cầu '{user_text}', Nhà May Thúy Diễm có các mẫu thiết kế rất phù hợp như: {p_names}.\n\nBạn có thể cho tiệm biết thêm về chiều cao, cân nặng hoặc dịp mặc (đi tiệc, đi làm, đi chơi) để thợ may tư vấn phom dáng và loại vải tối ưu nhất cho bạn nhé!"

    return f"Dạ, Nhà May Thúy Diễm rất hân hạnh được tư vấn cho bạn về '{user_text}' ạ! 🧵\n\nBạn đang quan tâm đến:\n1. **Tư vấn chọn mẫu & kiểu dáng** (Đầm, Áo dài, Sơ mi, Quần tây, Vest...)\n2. **Tư vấn loại vải & màu sắc** theo vóc dáng\n3. **Báo giá may đo & thời gian hoàn thiện**\n4. **Đặt lịch lấy số đo tại tiệm hoặc hướng dẫn tự đo tại nhà**\n\nBạn hãy gửi thêm thông tin để tiệm hỗ trợ chi tiết nhất nhé!"
