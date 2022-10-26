
from sys import argv
import pandas as pd

path = argv[1]
excel = pd.read_excel(path, index_col=None)

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

cont = excel.values.tolist()
cont_array = []
for c in cont:
    cont_array.append(Container(*c))
print(cont_array[1].ContID)
from json import JSONEncoder


class depotEncoder(JSONEncoder):
    def default(self, o):
        return o.__dict__

jn = (depotEncoder().encode(cont_array))

outfile = "cont.json"
ofile = open(outfile, "w")
ofile.write(jn)
ofile.close()
