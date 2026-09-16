# Admin đã tách riêng

Giao diện quản trị nằm tại `../websivi-admin`, chạy mặc định ở http://127.0.0.1:5174.
Web khách hàng chạy ở http://127.0.0.1:5173; cả hai gọi cùng Laravel API.

Các route `/quan-tri/*`, link đăng nhập admin và module API/admin đã được gỡ khỏi ứng dụng khách hàng. Route cũ trở về trang chủ. Test admin đã chuyển sang ứng dụng admin; các luồng khách hàng giữ test tại đây.

Xem `../websivi-admin/README.md` để chạy, tạo tài khoản quản trị, cấu hình cookie và quản lý ảnh. Không cần database mới. Thay đổi này chưa commit/push.
