
# GPG 2D Container Depot Planner

Phần mềm hoạch định bãi container

## Authors

- [@quanglochuynh](https://github.com/quanglochuynh/)

## Documentation

### 1. Cách tạo layout cho một depot mới

- Bước 1: Tạo file mặt bằng sơ đồ bãi bằng các phần mềm CAD, hoặc Adobe Illustrator.
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
- Bước 2: Tạo JSON Object chứa thuộc tính depot từ file SVG ở bước 1:
  - 2.1: tạo file python có cấu trúc như sau:
    - Phần import thư viện:

        ```python
        import sys
        sys.path.append("/Users/lochuynhquang/Documents/GPG_3D_yardplan")
        from gpg import *
        ```

        Đường dẫn trong câu thứ 2 là đường dẫn đến thư mục chứa file `gpg.py`
    - Phần tạo object Depot

        Tạo đối tượng `Layout` với đường dẫn tới file SVG của depot.

        ```python
        std_layout = Layout("./std.svg")
        ```

        Phóng to/thu nhỏ layout bằng method `scale`

        ```python
        std_layout.scale(cox=6, coy=6)
        ```

    - Phần xuất object python ra thành JSON string
