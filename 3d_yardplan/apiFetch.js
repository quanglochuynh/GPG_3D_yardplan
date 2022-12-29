var sumAll;
var cArray;
const depotName = ["CHD", "CTC", "CSD", "GKP", "TBD", "PCD", "ECD", "ETD", "GKD", "CLD", "CPD"];
const depotID   = [    0,     1,     3,     4,    18,    27,    28,    32,    38,    39,    40] 
const tokenURL = 'https://apiedepot.gsotgroup.vn/api/data/util/gettoken'
const yardPlanURL = 'https://apiedepot.gsotgroup.vn/api/data/process/GetDataYardPlan'


async function getContArray(dpName){
    cArray = [];
    var myDepot = depotID[depotName.indexOf(dpName)]
    var data = {
        "moreExp": "DepotID=" + myDepot,
        "sortExp":"ID",
        "current_index":1,
        "next_index":1
    };
    
    var tokenAPI = {
        method:"POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify({
            "reqid": "GetDataYardPlan",
            "data": data
        })
    }
    var ci=1;
    const res = await batchLoadCont(tokenAPI,ci,myDepot);
    // console.log("done", cArray)
    for (let i=0; i<cArray.length;i++){
        cArray[i].Bay = parseInt(cArray[i].Bay.r);
        cArray[i].Block = cArray[i].Block.r;
        cArray[i].Row = parseInt(cArray[i].Row.r);
        cArray[i].Tier = parseInt(cArray[i].Tier.r);
        cArray[i].ContID = cArray[i].ContID.r;
        cArray[i].ContTypeSizeID = cArray[i].ContTypeSizeID.r;
        cArray[i].HangTauID = cArray[i].HangTauID.r;
        delete cArray[i].total_row;
    }
}

async function batchLoadCont(tokenAPI,ci,myDepot){
    let idata = {
        "moreExp": "DepotID=" + myDepot,
        "sortExp":"ID",
        "current_index":ci,
        "next_index":900
    };
    tokenAPI.body = JSON.stringify({
        "reqid": "GetDataYardPlan",
        "data": idata
    })

    const new_tk = await fetch(tokenURL, tokenAPI).then(response => response.json())
    let yardPlanAPI = {
        method:"POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify({
            "token":new_tk.token,
            "reqtime":new_tk.reqtime,
            "data":idata,
            "appversion":17
        })
    }
    const contArray = await fetch(yardPlanURL, yardPlanAPI).then(response => response.json())
    cArray = cArray.concat(contArray.data)
    if (contArray.data.length ==0){
        return true;
    }
    ci += 1;
    return batchLoadCont(tokenAPI,ci,myDepot);
}

