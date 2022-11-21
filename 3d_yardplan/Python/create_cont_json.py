import pandas as pd
from json import JSONEncoder

class Container: 
    def __init__(self, contID, contSize, HangTau, Block, Bay, Row, Tier,):
        self.ContID = contID
        self.ContTypeSizeID = contSize
        self.HangTauID = HangTau
        self.Block = Block
        self.Bay = Bay
        self.Row = Row
        self.Tier = Tier
class depotEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__

if __name__ == "__main__":
    path = input("\b \b Kéo  file excel thả vào đây: \b \b")
    excel = pd.read_excel(path, index_col=None, header=5)
    excel = excel.drop(columns=['ContTareWeight','ContWeight',	'ContYear',	'Booking chỉ định',	'Cảng chỉ định', 'Area'	,	'PhanLoaiID',	'Phân loại đóng hàng',	'SoNgayLuuBai',	'Ngày hoàn thành PSC',	'Ngày báo giá',	'Mô tả hư hỏng',	'Mô tả',	'Description',	'DateIn',	'GhiChuStock',	'Ghi chú chỉ định',	'TrangthaiInstock',	'Ghi chú GateIn',	'Remark',	'BookingChiDinh'])
    excel = excel.drop([0], axis=0)
    print(excel)
    cont = excel.values.tolist()
    cont_array = []
    for c in cont:
        cont_array.append(Container(*c))
    jn = (depotEncoder().encode(cont_array))
    outfile = "cont3.json"
    ofile = open(outfile, "w")
    ofile.write(jn)
    ofile.close()