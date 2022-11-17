from json import JSONEncoder
import math

class depotEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__

class Point:
    def __init__(self,x,y) -> None:
        self.x = x
        self.y = y
    
    def translate(self, dx=0, dy=0):
        self.x += dx
        self.y += dy

    def scale(self, cox=1, coy=1):
        self.x *= cox
        self.y *= coy

class Line:
    def __init__(self,p1,p2) -> None:
        self.p1 = p1;
        self.p2 = p2;

class Shape:
    def __init__(self, seq, vis=1) -> None:
        self.seq = seq
        self.length = len(seq)
        self.visible = vis
    
    def scale(self,cox=1, coy=1):
        for i in range(self.length):
            self.seq[i].scale(cox,coy)
    
    def translate(self,dx=0, dy=0):
        for i in range(self.length):
            self.seq[i].translate(dx,dy)

class Container: 
    def __init__(self, contID, contSize, HangTau, Block, Bay, Row, Tier):
        self.ContID = contID
        self.ContTypeSizeID = contSize
        self.HangTauID = HangTau
        self.Block = Block
        self.Bay = Bay
        self.Row = Row
        self.Tier = Tier
        self.angle = 0
        self.x=0
        self.y=0
        self.z=0

class Text: 
    def __init__(self, content, x,y,size=8, angle=0) -> None:
        self.content = content
        self.position = Point(x,y)
        self.size = size
        self.angle = angle

# read text
def read_text(path):
    result = []
    fi = open(path, "r")
    str = fi.read()
    a = 0
    p = str.find("<text",a)
    while p>0:
        x = []
        y = []
        b = str.find("/text>",p)
        k = str[p+27:b]
        # print(k)
        text = k[k.find('">')+2:k.find("</")]
        
        k = k[0:k.find("rotate")]
        obr = k.find("(")
        cbr = k.find(")")
        translate = k[obr+1:cbr]
        # print(translate)

        sp = translate.find(" ")
        x = translate[0:sp]
        y = translate[sp+1: len(translate)]

        result.append(Text(text, int(x),int(y)))

        # print("x", x, "y", y)
        a = b
        p = str.find("<text",a)
    return result

def svg2layout(path):
    file = open(path, "r")
    str = file.read()
    layout_array = []
    a = 0
    p = str.find("<polygon",a)
    while p>0:
        x = []
        y = []
        b = str.find("/>",p)
        div = str[p+27:b-1] 
        # print("shape:", div)
        chr_id=0
        type = 0
        sp = div.find(" ",chr_id)
        while sp>0:
            if type:
                # print("y:",div[chr_id:sp])
                y.append(int(div[chr_id:sp]))
            else:
                # print("x:",div[chr_id:sp])
                x.append(int(div[chr_id:sp]))

            type = 1-type
            chr_id = sp
            sp = div.find(" ", sp+1)
        # print("y:",div[chr_id:len(div)])
        y.append(int(div[chr_id:len(div)]))

        a = b
        p = str.find("<polygon",a)
        # print(x)
        # print(y)
        seq = []
        for i in range(len(x)):
            seq.append(Point(x[i],y[i]))
        layout_array.append(Shape(seq))
    return layout_array

# read rect
def read_rect(path):
    result = []
    fi = open(path, "r")
    str = fi.read()
    a = 0
    p = str.find("<rect",a)
    while p>0:
        # x = []
        # y = []
        b = str.find("/>",p)
        k = str[p+5:b]
        print(k)
        px = k.find('x="');
        pxe = k.find('" ', px)
        x = k[px+3:pxe]
        print(x)

        py = k.find('y="')
        pye =k.find('" ', py)
        y = k[py+3:pye]
        print(y)

        pw = k.find('width="')
        pwe =k.find('" ', pw)
        w = k[pw+7:pwe]
        # print(w)

        ph = k.find('height="')
        phe =k.find('" ', ph)
        h = k[ph+8:phe]
        # print(h)

        a = b
        p = str.find("<rect",a)
    return result

def read_line(path):
    result = []
    fi = open(path, "r")
    str = fi.read()
    a = 0
    p = str.find("<line",a)
    while p>0:
        # x = []
        # y = []
        b = str.find("/>",p)
        k = str[p+16:b]
        # print(k)
        px = k.find('x1="');
        pxe = k.find('" ', px)
        x = k[px+4:pxe]
        # print(x)  

        py = k.find('y1="')
        pye =k.find('" ', py)
        y = k[py+4:pye]
        # print(y)

        pw = k.find('x2="')
        pwe =k.find('" ', pw)
        w = k[pw+4:pwe]
        # print(w)

        ph = k.find('y2="')
        phe =k.find('" ', ph)
        h = k[ph+4:phe]
        # print(h)
        result.append(Line(Point(int(x),int(y)), Point(int(w),int(h))))
        a = b
        p = str.find("<line",a)
    return result

class Area:
    def __init__(self, name, x, y, offsetX=0, offsetY=0, angle=0, x_flip=False, y_flip=False, shapeID=None, num_of_bay=15, num_of_row=6, num_of_tier=6) -> None:
        self.name = name
        self.num_of_bay = num_of_bay
        self.num_of_row = num_of_row
        self.num_of_tier = num_of_tier
        self.x_coor = x
        self.y_coor = y
        self.shapeID = shapeID
        self.angle = angle
        self.offset = Point(offsetX, offsetY)
        self.x_flip = x_flip
        self.y_flip = y_flip

class Layout:
    def __init__(self,name,svg_path) -> None:
        self.name = name
        self.shape = svg2layout(svg_path)
        self.text = read_text(svg_path)
        self.line = read_line(svg_path)

    def scale(self,cox=1, coy=1):
        for i in range(len(self.shape)):
            self.shape[i].scale(cox,coy)
        for i in range(len(self.text)):
            self.text[i].position.scale(cox, coy)
        for i in range(len(self.line)):
            self.line[i].p1.scale(cox,coy)
            self.line[i].p2.scale(cox,coy)
    
    def translate(self,dx=0, dy=0):
        for i in range(len(self.shape)):
            self.shape[i].translate(dx,dy)
        for i in range(len(self.text)):
            self.text[i].position.translate(dx, dy)
        for i in range(len(self.line)):
            self.line[i].p1.translate(dx,dy)
            self.line[i].p2.translate(dx,dy)

class Ground:
    def __init__(self, shapeID, id1, offsetX=0, offsetY=0, offsetZ=0, angle=0, height=None, width=None, button = None):
        self.shapeID = shapeID
        self.id1 = id1
        self.offsetX = offsetX
        self.offsetY = offsetY
        self.offsetZ = offsetZ
        self.angle = angle
        self.button = button
        self.hei = height
        self.wid = width

class House:
    def __init__(self, type, name, shape, id1=0, id2=2, height=100, angle=0, offsetX=0, offsetY=0) -> None:
        self.type = type
        self.name = name
        self.shape = shape
        self.id1 = id1
        self.id2 = id2
        self.height = height
        self.angle = angle
        self.offsetX = offsetX
        self.offsetY = offsetY

class Depot:
    def __init__(self, name, layout, ground=[], area=[], house=[], container_scale=1, offset=Point(0,0), scale=1, defaultGround=0) -> None:        
        self.name = name
        self.layout = layout
        self.contWidth = 8 * container_scale
        self.contHeight = 8.5 * container_scale
        self.contLength = 20 * container_scale
        self.contHalfLength = 10 * container_scale
        self.contGap = math.floor(self.contLength*0.084)
        self.fontSize = 3*container_scale   
        self.Area = area
        self.house = house
        self.ground=ground
        self.offset = offset
        self.scale = scale
        self.defaultGround = defaultGround

class Button:
    def __init__(self, p, text, angle) -> None:
        self.position = p
        self.text = text
        self.angle = angle
        
    def translate(self, x=0, y=0):
        self.position.x +=x;
        self.position.y +=y;

