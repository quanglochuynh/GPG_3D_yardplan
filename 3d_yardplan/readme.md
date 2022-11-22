# GPG 3D Depot Simulator

Phần mềm hoạch mô phỏng bãi container 3D

## Authors

- [@quanglochuynh](https://github.com/quanglochuynh/)

## Demo

[Chân Thật Long Thạnh Mỹ depot](https://editor.p5js.org/quanglochuynh/full/vrqGwNupw)

## Documentation

![alt text](https://github.com/quanglochuynh/GPG_3D_yardplan/blob/master/img/Screenshot%202022-11-22%20at%2009.11.42.png?raw=true)

### 1. Dependencies

- Các thư viện phục vụ cho app gồm có:
  - p5

  ```html
  <script src="https://cdn.jsdelivr.net/npm/p5@1.4.2/lib/p5.min.js"></script>
  ```

  - JQuery

  ```html
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
  ```

  - p5.EasyCam

  ```html
  <script src="https://cdn.jsdelivr.net/gh/freshfork/p5.EasyCam@1.2.1/p5.easycam.min.js"></script>
  ```

### 2. Cấu trúc dữ liệu đầu vào

- Hiện tại, phần mềm đang đọc file json local nằm trong các thư mục `data`
- Trong các thư mục data cho mỗi depot, có 2 file json cần phải đọc (mỗi depot BẮT BUỘC phải có 2 JSON này):
  1. Cấu hình của - `depot`: được xuất ra từ `yardplan_creator` - GPG 2D Container Depot Planner
  2. Dữ liệu container - `container stock`: được lấy trực tiếp từ CMS -> Quản lý số lượng -> Stock Full
    -Cấu trúc dữ liệu: một array gồm nhiều Container Object

    ```javascript
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
    - ContID: Số container (ISO 6346)
    - ContTypeSizeID: Loại container
    - HangTauID: Tên viết tắt hãng tàu
    - Block: tên block
    - Bay: Số bay
    - Row: Số row
    - Tier: Số tier

      - Ví dụ:

      ```javascript
      Container = {
        "ContID": "CAIU7676581",
        "ContTypeSizeID": 4500,
        "HangTauID": "YML",
        "Block": "A",
        "Bay": 16,
        "Row": 9,
        "Tier": 1
        }
      ```

### 3. Đọc JSON dữ liệu đầu vào

- Phần xử lí dữ liệu đầu vào được thực hiện trong hàm `preload()` - hiện tại đang đọc file JSON local bằng hàm `$.getJSON` của JQuery

- Mục đích chính của `preload()` là để đưa hết data vào 2 biến `cArray` - chứa dữ liệu stock - và `depot` - chứa cấu hình depot.

> Lưu ý: nếu anh/chị có bất kì chỉnh sửa gì về API nhận JSON data đầu vào, vui lòng **chỉ** chỉnh sửa trong hàm `preload()`

  ```javascript
  function preload(){
    let path = [
      './data4/cont4.json',
      '../../yardplan_creator/data4/cld.json'
    ];
    $.getJSON(path[0], function(data){
    cArray = data;
    $.getJSON(path[1], function(data){
        depot = data;
        updateStat();
        processCont(cArray);
        init();
        loop();
      })
    })
  }
  ```

## Lưu ý

- Một số lỗi có thể xảy ra như sau:
  - Đối tượng Container nằm ở Block không được liệt kê ở object `depot`
    - Ví dụ:
      1. Tên Block của container: 'A', tên Block của depot: 'a'
      2. Tên Block của container: 'A', object depot không có block 'A'
    - Hướng giải quyết: xuất lại file `depot.json` từ `GPG 2D Container Depot Planner` với tên block chính xác

  - JSON stock full chứa container có thông tin không hợp lệ:
    - Ví dụ:
      1. Thông tin Hãng tàu là rỗng (`HangTauID=''`)
      2. Thiếu bất kì thông số nào khác.
