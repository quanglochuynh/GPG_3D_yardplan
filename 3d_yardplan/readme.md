# GPG 3D Depot Simulator

Phần mềm hoạch mô phỏng bãi container 3D

## Authors

- [@quanglochuynh](https://github.com/quanglochuynh/)

## Documentation

### 1. Cấu trúc dữ liệu đầu vào

- Hiện tại, phần mềm đang đọc file json local nằm trong các thư mục `data`
- Trong các thư mục data cho mỗi depot, có 2 file json cần phải đọc (mỗi depot BẮT BUỘC phải có 2 JSON này):
  - 1. Cấu hình của - `depot`: được xuất ra từ `yardplan_creator` - GPG 2D Container Depot Planner
  - 2. Dữ liệu container - `container stock`: được lấy trực tiếp từ CMS -> Quản lý số lượng -> Stock Full
    -Cấu trúc dữ liệu: một array gồm nhiều Container Object

    ```json
    [
      Container,
      Container,
      Container,
      ...,
      ...,
      Container
    ]
    ```

    - Mỗi object `Container` có các thuộc tính sau:

    ```json
    Container = {
      "ContID": "CAIU7676581",
      "ContTypeSizeID": 4500,
      "HangTauID": "YML",
      "Block": "A",
      "Bay": 16.0,
      "Row": 9.0,
      "Tier": 1.0,
      "angle": 0,
      "x": 0,
      "y": 0,
      "z": 0
    }
    ```
