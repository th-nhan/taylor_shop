import os
from sqlmodel import SQLModel, create_engine, Session, select
from app.models import Product, User

# Đường dẫn DB mặc định
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nhamay.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def seed_data():
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Seed Admin User if not exists
        existing_admin = session.exec(select(User).where(User.phone == "0999999999")).first()
        if not existing_admin:
            admin_user = User(
                full_name="Quản trị viên",
                phone="0999999999",
                password_hash="admin123",
                role="admin"
            )
            session.add(admin_user)
            session.commit()
            print("[SUCCESS] Da tu dong khoi tao tai khoan Admin mac dinh!")

        existing_product = session.exec(select(Product)).first()
        if existing_product:
            print("[INFO] CSDL da co du lieu san pham.")
            return

        sample_products = [
            Product(
                name="Đầm Xòe Cổ Đổ Dạ Hội",
                categories=["Đầm"],
                target_gender="Nữ",
                price_estimate="450.000đ - 650.000đ",
                description="Phong cách sang trọng, tôn dáng, phù hợp dự tiệc hoặc sự kiện đặc biệt.",
                design_details={
                    "Kiểu tùng váy": "Xòe chữ A nhẹ",
                    "Kiểu cổ": "Cổ đổ nữ tính",
                    "Độ dài": "Qua đầu gối (105cm)",
                    "Khóa kéo": "Dây kéo giọt nước phía sau"
                },
                fabric_recommendations=["Lụa Satin high-end", "Tần lụa mềm", "Vải Gấm chìm"],
                image_urls=["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80"]
            ),
            Product(
                name="Đầm Suông Lụa Cổ V Công Sở",
                categories=["Đầm"],
                target_gender="Nữ",
                price_estimate="380.000đ - 500.000đ",
                description="Thiết kế thoải mái, che khuyết điểm vòng 2 cực tốt, thanh lịch cho quý cô công sở.",
                design_details={
                    "Phom dáng": "Suông nhẹ giấu bụng",
                    "Kiểu cổ": "Cổ V khoét vừa phải",
                    "Tay áo": "Tay lỡ bo nhún nhẹ",
                    "Túi": "2 túi mổ bên hông tiện lợi"
                },
                fabric_recommendations=["Lụa Mango", "Lụa Thần Hà", "Vải Đũi xốp"],
                image_urls=["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80"]
            ),
            Product(
                name="Quần Tây Nam 1 Ly Ống Đứng",
                categories=["Quần tây"],
                target_gender="Nam",
                price_estimate="320.000đ - 450.000đ",
                description="Chuẩn phom công sở lịch lãm, co giãn nhẹ giúp di chuyển thoải mái cả ngày.",
                design_details={
                    "Kiểu ống": "Ống đứng (Straight fit 18cm)",
                    "Lưng quần": "Cạp vừa, nút gài ẩn chắc chắn",
                    "Túi": "2 túi xéo hông sâu, 1 túi mổ phía sau",
                    "Xếp ly": "1 ly trước giữ phom đứng"
                },
                fabric_recommendations=["Kaki thun cao cấp", "Tuyết mưa phom chuẩn", "Vải Wool pha Spandex"],
                image_urls=["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80"]
            ),
            Product(
                name="Quần Tây Nữ Cạp Cao Ống Rộng",
                categories=["Quần tây"],
                target_gender="Nữ",
                price_estimate="290.000đ - 390.000đ",
                description="Hack dáng kéo dài chân tối đa, kết hợp hoàn hảo với áo sơ mi hoặc croptop.",
                design_details={
                    "Lưng quần": "Cạp siêu cao (trên rốn 3cm)",
                    "Kiểu ống": "Ống suông rộng (Wide leg 24cm)",
                    "Khóa kéo": "Khóa đơm phía trước",
                    "Chi tiết": "Xếp 2 ly xuôi tạo độ rủ"
                },
                fabric_recommendations=["Tuyết mưa cao cấp", "Vải Hàn Quốc co giãn 4 chiều"],
                image_urls=["https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&auto=format&fit=crop&q=80"]
            ),
            Product(
                name="Đồ Bộ Nữ Tay Phồng Cổ Vuông",
                categories=["Đồ bộ"],
                target_gender="Nữ",
                price_estimate="230.000đ - 300.000đ",
                description="Bộ mặc nhà tiểu thư sang trọng, chất vải thoáng mát, may sắc nét từng đường kim mũi chỉ.",
                design_details={
                    "Kiểu áo": "Tay phồng chun nhún, cổ vuông quyến rũ",
                    "Kiểu quần": "Quần đùi rộng lửng bèo lai",
                    "Điểm nhấn": "Hàng nút bọc dệt dán thủ công"
                },
                fabric_recommendations=["Lụa Bảo Anh", "Tơ đũi xốp mềm", "Lụa Satin Mịn"],
                image_urls=["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80"]
            ),
            Product(
                name="Áo Sơ Mi Nam Tay Dài Slimfit",
                categories=["Sơ mi"],
                target_gender="Nam",
                price_estimate="280.000đ - 380.000đ",
                description="Áo sơ mi may đo chuẩn phom dáng nam giới Việt Nam, chống nhăn hiệu quả.",
                design_details={
                    "Phom dáng": "Slim-fit tôn ngực vai",
                    "Cổ áo": "Cổ Đức đứng (Stiff collar)",
                    "Măng séc": "Măng séc vát góc cài nút"
                },
                fabric_recommendations=["Vải Bamboo sợi tre", "Cotton 100% chống nhăn", "Vải Oxford mềm"],
                image_urls=["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80"]
            ),
            Product(
                name="Áo Sơ Mi Nữ Lụa Cổ Thắt Nơ",
                categories=["Sơ mi"],
                target_gender="Nữ",
                price_estimate="260.000đ - 350.000đ",
                description="Phong cách nữ tính, thanh lịch, thích hợp đi làm, gặp đối tác hoặc dạo phố.",
                design_details={
                    "Điểm nhấn": "Nơ thắt cổ rời linh hoạt",
                    "Tay áo": "Tay dài bo măng séc 2 nút",
                    "Thắt eo": "May chiết eo nhẹ"
                },
                fabric_recommendations=["Lụa Tơ Tằm nhân tạo", "Lụa Latin mềm rủ"],
                image_urls=["https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&auto=format&fit=crop&q=80"]
            )
        ]
        
        session.add_all(sample_products)
        session.commit()
        print("[SUCCESS] Da tu dong khoi tao Bang & Seed thanh cong du lieu mau vao CSDL!")

if __name__ == "__main__":
    seed_data()
