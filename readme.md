
# GPG 2D Container Depot Planner

Phần mềm hoạch định bãi container

## Authors

- [@quanglochuynh](https://github.com/quanglochuynh/)

## Documentation

### 1. Cách tạo layout cho một depot mới

#### Bước 1: Tạo file mặt bằng sơ đồ bãi bằng các phần mềm CAD, hoặc Adobe Illustrator

- Layout cần có:
- Các đa giác cho từng khu vực
![alt text](https://github.com/quanglochuynh/GPG_3D_yardplan/blob/master/img/Screenshot%202022-11-18%20at%2010.32.28.png?raw=true)
- 1 đa giác cho toàn bộ bãi.
![alt text](https://github.com/quanglochuynh/GPG_3D_yardplan/blob/master/img/Screenshot%202022-11-18%20at%2010.36.47.png?raw=true)
- Các đa giác cho các khu vực nhà (Gate In/Out, MNR, văn phòng, vv)
![alt text](https://github.com/quanglochuynh/GPG_3D_yardplan/blob/master/img/Screenshot%202022-11-18%20at%2010.44.15.png?raw=true)
- Các nút bấm để chuyển đổi giữa các khu vực
![alt text](https://github.com/quanglochuynh/GPG_3D_yardplan/blob/master/img/Screenshot%202022-11-18%20at%2010.46.19.png?raw=true)
- Layout hoàn chỉnh như sau:
![alt text](https://github.com/quanglochuynh/GPG_3D_yardplan/blob/master/img/Screenshot%202022-11-18%20at%2010.52.06.png?raw=true)
- Bước 2: Export file layout bằng định dạng *.svg.
![alt text](https://github.com/quanglochuynh/GPG_3D_yardplan/blob/master/img/Screenshot%202022-11-18%20at%2010.59.38.png?raw=true)

    File SVG sẽ có định dạng giống như HTML5 như sau:

    ```html
    <svg xmlns="http://www.w3.org/2000/svg" width="504" height="400" viewBox="0 0 504 400">
    <g>
        <polygon class="a" points="15 165 76 166 153 202 182 202 15 122 15 165"/>
        <polygon class="a" points="15 165 12 295 253 296 253 399 503 399 503 368 348 202 322 175 321 167 304 154 272 144 260 178 258 188 258 202 153 202 76 166 15 165"/>
        <polygon class="a" points="321 167 427 65 404 51 353 21 304 154 304 154 321 167"/>
        <polygon class="a" points="324 3 353 21 304 154 272 144 324 3"/>
        <polygon class="a" points="327 180 300 202 258 202 253 296 253 399 503 399 503 368 327 180"/>
        <polygon class="b" points="16 122 0 165 1 161 16 122"/>
        <polygon class="a" points="260 120 262 122 260 123 260 120"/>
    </g>
    <g>
        <polygon class="c" points="15 122 12 296 253 296 253 399 503 399 503 368 322 175 321 167 427 65 324 3 260 178 258 188 258 202 182 202 15 122"/>
        <polygon class="c" points="300 172 300 202 270 202 270 187 271 183 277 168 280 166 300 172"/>
        <polygon class="c" points="481 399 481 383 327 221 348 202 503 368 503 399 481 399"/>
        <polygon class="c" points="366 88 404 51 427 65 385 106 366 88"/>
        <polygon class="c" points="253 326 275 326 275 399 253 399 253 326"/>
    </g>
    <g>
        <polygon class="a" points="45 126 18 113 16 119 44 133 45 126"/>
        <polygon class="a" points="347 145 323 167 328 172 350 151 347 145"/>
        <polygon class="a" points="5 166 5 196 11 196 11 165 5 166"/>
        <polygon class="a" points="315 1 305 29 310 33 321 3 315 1"/>
        <polygon class="a" points="353 196 333 174 327 180 350 204 353 196"/>
    </g>
    </svg>
    ```

  - Các thẻ "<" polygon ">" chính là các đa giác trong mặt bằng depot, trình tự các thẻ cũng tuân theo trình tự layer trong phầm mềm
    ![alt text](https://github.com/quanglochuynh/GPG_3D_yardplan/blob/master/img/Screenshot%202022-11-18%20at%2011.21.06.png?raw=true)

#### Bước 2: Tạo JSON Object chứa thuộc tính depot từ file SVG ở bước 1

- 2.1: tạo file python có cấu trúc như sau:

- 2.1.1 Phần import thư viện:

    ```python
    import sys
    sys.path.append("/Users/lochuynhquang/Documents/GPG_3D_yardplan")
    from gpg import *
    ```

    Đường dẫn trong câu thứ 2 là đường dẫn đến thư mục chứa file `gpg.py`

- 2.1.2 Phần tạo object `Depot`

  - 2.1.2.1 Tạo đối tượng `Layout` với đường dẫn tới file SVG của depot.

    ```python
    std_layout = Layout("./std.svg")
    ```

    - Phóng to/thu nhỏ layout bằng method `scale`

        ```python
        std_layout.scale(cox=6, coy=6)
        ```

    - Chỉnh độ đậm nhạt của các đa giác bằng cách gán giá trị từ 0 tới 1 cho

        ```python
            std_layout.shape[0].visible = 0.2
            std_layout.shape[1].visible = 0.2
            std_layout.shape[2].visible = 0.2
            std_layout.shape[3].visible = 0.2
            std_layout.shape[4].visible = 0.2
            std_layout.shape[5].visible = 0
            std_layout.shape[6].visible = 0
        ```

      - Lưu ý:
        - Chỉ số của shape là tương ứng với thứ tự của file svg và thứ tự layer trong phần mềm CAD
        - Các đa giác cho các nút chuyển khu vực nên được set `visible=0`

  - 2.1.2.2 Tạo object Nút bấm (`Button`) để chuyển đổi khu vực

    - Object Button có 3 thuộc tính:
      - Toạ độ điểm đầu: toạ độ điểm nằm ở góc trên bên trái của button
      - Tên button: chữ hiển thị bên trong button
      - Góc xoay: góc xoay của button so với trục ngang (đơn vị Radian, 360 $\degree = 2 $\pi radian)

    - Ví dụ depot có 5 cách đặt container, tương ứng với 5 khu vực khác nhau, chúng ta tạo 5 đối tượng Button cho từng khu vực.

        ```python
        btn0 = Button(std_layout.shape[12].seq[1], "Area 1", angle=-0.44378560551852564)
        btn1 = Button(std_layout.shape[13].seq[1], "Area 2", angle=0.7549448708775051)
        btn2 = Button(std_layout.shape[14].seq[1], "Area 3", angle=math.pi/2)
        btn3 = Button(std_layout.shape[15].seq[1], "Area 4", angle=1.2217304763960306)
        btn4 = Button(std_layout.shape[16].seq[1], "Area 5", angle=-0.8158514559173915)
        ```

  - 2.1.2.3 Tạo object `Ground`
    - Mỗi Ground tương ứng với 1 khu vực của depot
    - Ví dụ với depot Sóng Thần, chúng ta tạo 5 biến ground

        ```python
        ground0 = Ground(0, offsetX=std_layout.shape[0].seq[4].x-402, offsetY=std_layout.shape[0].seq[4].y-421, height=1680, width=920,  angle=1.127010721276371, button=btn0)
        ground1 = Ground(2, offsetX=std_layout.shape[3].seq[4].x-110, offsetY=std_layout.shape[3].seq[4].y-86,  height=880,  width=680,  angle=-0.8158514559173915, button=btn1)
        ground2 = Ground(0, offsetX=std_layout.shape[0].seq[4].x, offsetY=std_layout.shape[0].seq[4].y,         height=1640, width=2800, angle=0, button=btn2)
        ground3 = Ground(3, offsetX=std_layout.shape[3].seq[0].x, offsetY=std_layout.shape[3].seq[0].y,         height=960,  width=600,  angle=-0.3490658503988659, button=btn3)
        ground4 = Ground(4, offsetX=std_layout.shape[16].seq[2].x, offsetY=std_layout.shape[16].seq[2].y,       height=1200, width=1600, angle=-0.8158514559173915, button=btn4)
        ```

    - Object Ground có các thuộc tính sau:
      - ShapeID: số thứ tự của đa giác thể hiện khu vực trong file SVG.
      - OffsetX: Toạ độ x của điểm đầu của lưới rải cont.
      - OffsetY: Toạ độ y của điểm đầu của lưới rải cont.
      - OffsetZ: Cao độ của khu vực đó.
      - Height (Pixel): Độ dài của lưới rải cont.
      - Width (Pixel): Độ rộng của lưới rải cont.
      - Angle (Radian): Góc nghiêng của lưới rải cont so với trục ngang.
      - Button: object button (khai báo ở trên) tương ứng với khu vực đó.

  - 2.1.2.4 Tạo object `House`
    - Mỗi object House là một khu vực bị tô đen trên mặt bằng depot.

        ```python
        gatein = House(0, "Kho 1", std_layout.shape[8])
        gateout = House(0, "kho 2", std_layout.shape[9])
        vanphong = House(0, "Nha Kho", std_layout.shape[10])
        pccc = House(0, "Nha Kho", std_layout.shape[11])
        ```

  - 2.1.2.5 Tạo đối tượng `Depot`
    - Object Depot có những thuộc tính sau:
      - Name: Tên depot.
      - Layout: Object Layout của depot.
      - Ground: Array chứa các khu vực của depot.
      - House: Array chứa các khu vực đặc biệt của depot.
      - Container scale: hệ số độ dài container.
      - defaultGround (optional): chỉ số của khu vực được active đầu tiên, mặc định là khu vực 0.

        ```python
        std = Depot(
            "Song Than Depot", 
            std_layout, 
            ground=[ground0, ground1, ground2, ground3, ground4], 
            house=[gatein, gateout, vanphong, pccc], 
            container_scale=4,
            defaultGround=2
        )
        ```

- 2.1.3 Phần xuất object python ra thành JSON string

    ```python
    jn = (depotEncoder().encode(std))
    ofile = open("./std.json", "w")
    ofile.write(jn)
    ofile.close()
    ```
