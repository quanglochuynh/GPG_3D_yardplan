const depotName = ["CHD", "CTC", "CSD", "GKP", "TBD", "PCD", "ECD", "ETD", "GKD", "CLD", "CPD"];
const depotID   = [    0,     1,     3,     4,    18,    27,    28,    32,    38,    39,    40] 
const tokenURL = 'https://apiedepot.gsotgroup.vn/api/data/util/gettoken'
const yardPlanURL = 'https://apiedepot.gsotgroup.vn/api/data/process/GetDataYardPlan'
const depotConfigURL = 'https://apiedepot.gsotgroup.vn/api/data/process/GetDepotConfigByDepotID'
const loginURL = 'https://apiedepot.gsotgroup.vn/api/Users/Login'
const teuArrayURL = 'https://apiedepot.gsotgroup.vn/api/data/process/GetDataTable'
const tbname = "Qiu5/cH4+qip8kYFFBGmqA4etTF6KqA7YrFxBgiGZGw=";

async function getDepotConfig(dpName){
    cArray = [];
    var myDepot = depotID[depotName.indexOf(dpName)]
    var data = {
        "DepotID": myDepot,
    };
    
    var tokenAPI = {
        method:"POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify({
            "reqid": "GetDepotConfigByDepotID",
            "data": data
        })
    }
    // var ci=1;
    const new_tk = await fetch(tokenURL, tokenAPI).then(response => response.json())
    // console.log(new_tk);
    let depotConfigAPI = {
            method:"POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify({
                "token":new_tk.token,
                "reqtime":new_tk.reqtime,
                "data": JSON.stringify(data),
                "appversion":24
            })
        }
    const depotConfig = await fetch(depotConfigURL, depotConfigAPI).then(response => response.json())
    // console.log(depotConfig)
    console.log("status 200");
    if (depotConfig.data.length==0){
        console.log("No data on DB");
    }
    return JSON.parse(depotConfig.data[0].Depot_Config.v);
    // return depotConfig
}

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
    return cArray
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
            "appversion":2023
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

// API yardplan setting

async function login(user, pass){
    let apiBody = {
        "user": user,
        "password": pass,
        "appversion": 2023
    }

    let loginAPI = {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(apiBody)
    }

    const res = await fetch(loginURL,loginAPI).then(response => response.json())
    return res
}
// let tk = getToken("GetDataTable",{
//     "tablename": "vw_eDepot_GPG_CMS_DepotYard_Setting",
//     "moreExp": "depotID=1"
// });

// console.log(tk)

async function getYardPlanSetting(user, pass, tablename, filter="1=1"){
    let loginRes = await login(user,pass);
    console.log(loginRes);

    var tokenAPI = {
        method:"POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Authorization": "Bearer " + loginRes.token
        },
        body: JSON.stringify({
            "reqid": "GetDataTable",
            "data": JSON.stringify({
                "tablename": tablename,
                "moreExp": filter
            })
        })
    }
    const new_tk = await fetch(tokenURL, tokenAPI).then(response => response.json())
    console.log(new_tk)

    let apiBody = {
        "token": new_tk.token,
        "reqtime": new_tk.reqtime,
        "data": JSON.stringify({
            "tablename": tablename,
            "moreExp": filter,
        }),
        "appversion": 2023
    }
    let yardPlanSettingAPI = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + loginRes.token
        },
        body: JSON.stringify(apiBody)
    }
    const resData = await fetch(teuArrayURL, yardPlanSettingAPI).then(res => res.json())
    console.log(resData)
    return resData
}

async function queryDatabase(tablename){
    let loginRes = await login(user,pass);
    var tokenAPI = {
        method:"POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            "Authorization": "Bearer " + loginRes.token
        },
        body: JSON.stringify({
            "reqid": "GetDataTable",
            "data": JSON.stringify({
                "tablename": tablename
               
            })
        })
    }
    const new_tk = await fetch(tokenURL, tokenAPI).then(response => response.json())
    console.log(new_tk)

    let apiBody = {
        "token": new_tk.token,
        "reqtime": new_tk.reqtime,
        "data": JSON.stringify({
            "tablename": tablename,
            "row":JSON.stringify([
                {
                    // "ID:"
                }
            ])
        }),
        "appversion": 2023
    }
    let yardPlanSettingAPI = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + loginRes.token
        },
        body: JSON.stringify(apiBody)
    }
    const resData = await fetch(teuArrayURL, yardPlanSettingAPI).then(res => res.json())
    console.log(resData)
    return resData
}