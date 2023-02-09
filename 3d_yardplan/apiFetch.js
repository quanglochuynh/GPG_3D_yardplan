var depotID = [0, 1, 3, 4, 18, 27, 28, 32, 38, 39, 40, 15];
const tokenURL = "https://apiedepot.gsotgroup.vn/api/data/util/gettoken";
const yardPlanURL =
  "https://apiedepot.gsotgroup.vn/api/data/process/GetDataYardPlan";
const depotConfigURL =
  "https://apiedepot.gsotgroup.vn/api/data/process/GetDepotConfigByDepotID";
const loginURL = "https://apiedepot.gsotgroup.vn/api/Users/Login";
const teuArrayURL =
  "https://apiedepot.gsotgroup.vn/api/data/process/GetDataTable";
const updateTableURL =
  "https://apiedepot.gsotgroup.vn/api/data/process/UpdateData";
const tbname = "Qiu5/cH4+qip8kYFFBGmqA4etTF6KqA7YrFxBgiGZGw=";
const updateDepotConfigURl =
  "https://apiedepot.gsotgroup.vn/api/data/process/UpdateDepotConfigByDepotID";
var li;
async function getDepotConfigByDepotID(dpID) {
  console.log("getDepotConfig");
  cArray = [];
  var data = {
    DepotID: dpID,
  };

  var tokenAPI = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      reqid: "GetDepotConfigByDepotID",
      data: data,
    }),
  };
  // var ci=1;
  const new_tk = await fetch(tokenURL, tokenAPI).then((response) =>
    response.json()
  );
  // console.log(new_tk);
  let depotConfigAPI = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      token: new_tk.token,
      reqtime: new_tk.reqtime,
      data: JSON.stringify(data),
      appversion: 24,
    }),
  };
  const depotConfig = await fetch(depotConfigURL, depotConfigAPI).then(
    (response) => response.json()
  );
  // console.log(depotConfig)
  console.log("status 200");
  if (depotConfig.data.length == 0) {
    console.log("No data on DB");
  }
  console.log(depotConfig);
  return JSON.parse(depotConfig.data[0].Depot_Config.v);
  // return depotConfig
}

async function getContArray(dpID) {
  cArray = [];
  var data = {
    moreExp: "DepotID=" + dpID,
    sortExp: "ID",
    current_index: 1,
    next_index: 1,
  };

  var tokenAPI = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      reqid: "GetDataYardPlan",
      data: data,
    }),
  };
  var ci = 1;
  const res = await batchLoadCont(tokenAPI, ci, myDepot);
  // console.log("done", cArray)
  for (let i = 0; i < cArray.length; i++) {
    cArray[i].Bay = parseInt(cArray[i].Bay.r);
    cArray[i].Block = cArray[i].Block.r;
    cArray[i].Row = parseInt(cArray[i].Row.r);
    cArray[i].Tier = parseInt(cArray[i].Tier.r);
    cArray[i].ContID = cArray[i].ContID.r;
    cArray[i].ContTypeSizeID = cArray[i].ContTypeSizeID.r;
    cArray[i].HangTauID = cArray[i].HangTauID.r;
    delete cArray[i].total_row;
  }
  return cArray;
}

async function batchLoadCont(tokenAPI, ci, myDepot) {
  let idata = {
    moreExp: "DepotID=" + myDepot,
    sortExp: "ID",
    current_index: ci,
    next_index: 900,
  };
  tokenAPI.body = JSON.stringify({
    reqid: "GetDataYardPlan",
    data: idata,
  });

  const new_tk = await fetch(tokenURL, tokenAPI).then((response) =>
    response.json()
  );
  let yardPlanAPI = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify({
      token: new_tk.token,
      reqtime: new_tk.reqtime,
      data: idata,
      appversion: 2023,
    }),
  };
  const contArray = await fetch(yardPlanURL, yardPlanAPI).then((response) =>
    response.json()
  );
  cArray = cArray.concat(contArray.data);
  if (contArray.data.length == 0) {
    return true;
  }
  ci += 1;
  return batchLoadCont(tokenAPI, ci, myDepot);
}

// API yardplan setting

async function login(user, pass) {
  console.log("loging in");
  let apiBody = {
    user: user,
    password: pass,
    appversion: 2023,
  };

  let loginAPI = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(apiBody),
  };

  const res = await fetch(loginURL, loginAPI).then((response) =>
    response.json()
  );
  console.log("Loged in");
  return res;
}

async function getCMSTable(
  tablename,
  filter = "1=1",
  logres = undefined,
  user = undefined,
  pass = undefined
) {
  console.log("getCMSTable " + tablename);
  let loginRes = logres;
  if (loginRes === undefined) {
    loginRes = await login(user, pass);
  }
  var tokenAPI = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      Authorization: "Bearer " + loginRes.token,
    },
    body: JSON.stringify({
      reqid: "GetDataTable",
      data: JSON.stringify({
        tablename: tablename,
        moreExp: filter,
      }),
    }),
  };
  // console.log(tokenAPI)
  const new_tk = await fetch(tokenURL, tokenAPI).then((response) =>
    response.json()
  );
  let apiBody = {
    token: new_tk.token,
    reqtime: new_tk.reqtime,
    data: JSON.stringify({
      tablename: tablename,
      moreExp: filter,
    }),
    appversion: 2023,
  };
  let yardPlanSettingAPI = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + loginRes.token,
    },
    body: JSON.stringify(apiBody),
  };
  const resData = await fetch(teuArrayURL, yardPlanSettingAPI).then((res) =>
    res.json()
  );
  return resData;
}

async function queryDatabase(
  jsonData,
  logres = undefined,
  user = undefined,
  pass = undefined
) {
  console.log("queryDatabase");
  let loginRes = logres;
  if (loginRes === undefined) {
    loginRes = await login(user, pass);
  }
  var tokenAPI = {
    method: "POST",
    headers: {
      // "Content-Type": "application/json;charset=utf-8",
      Authorization: "Bearer " + loginRes.token,
    },
    body: JSON.stringify({
      reqid: "UpdateData",
      data: JSON.stringify(jsonData),
    }),
  };
  const new_tk = await fetch(tokenURL, tokenAPI).then((response) =>
    response.json()
  );
  // console.log(new_tk)

  let apiBody = {
    token: new_tk.token,
    reqtime: new_tk.reqtime,
    data: JSON.stringify(jsonData),
    appversion: 2023,
  };
  let yardPlanSettingAPI = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + loginRes.token,
    },
    body: JSON.stringify(apiBody),
  };
  // console.log(yardPlanSettingAPI);
  const resData = await fetch(updateTableURL, yardPlanSettingAPI).then((res) =>
    res.json()
  );
  // console.log(resData)
  return resData;
}

async function getDepotArea(depotID, loginToken) {
  //depotyard
  let res1 = await getCMSTable(
    "vw_eDepot_GPG_CMS_DepotYard",
    "Depot=" + depotID,
    loginToken
  );
  return res1.data;
}

// vw_eDepot_GPG_CMS_DepotYard => depot.Area          GY4EHGl/J7m1PZBHXIZi0CFPqCsTkuBE+cXl5iYRCuQ=
// vw_eDepot_GPG_CMS_DepotYard_Setting => teuArray    Qiu5/cH4+qip8kYFFBGmqA4etTF6KqA7YrFxBgiGZGw=
// GPG_CMS_Depot                                      Qd2GYXhV49FT/u2kN8MTNgN1JsXGktJxb7gQEh6jAPY=

async function test() {
  li = await login("3307", "P@ssw0rd300807");
  // let res = await getCMSTable("vw_eDepot_GPG_CMS_DepotYard", "Depot=15",li)
  let res = await getCMSTable(
    "vw_eDepot_GPG_CMS_DepotYard_Setting",
    undefined,
    li
  );
  // let res = await getCMSTable("GPG_CMS_Depot", undefined,li)
  // let res = pushNewArea({
  //     "name": "TestAPI",
  //     "angle": 1.127010721276371,
  //     "x_coor": 150.3772643261807,
  //     "y_coor": 796.7181437880097,
  //     "x_flip": false,
  //     "y_flip": false,
  //     "one_face": true,
  //     "num_bay": 14,
  //     "num_row": 8,
  //     "orient": false
  // },15,li)
  // let res = updateDepotConfig(15, depot, li)
  console.log(res);
  // let data = {
  //     "tbname": "Qiu5/cH4+qip8kYFFBGmqA4etTF6KqA7YrFxBgiGZGw=",
  //     "rows": [
  //         {
  //             "ID": 1,
  //             "state": 1,
  //             "ground_x": 1,
  //             "ground_y": 1,
  //             "ground": 0,
  //             "orient": 0
  //         }
  //     ]
  // }
  // let res2 = await queryDatabase(data, li)
  // console.log(res2)

  // let query = "";
  // let areaArray = await getDepotArea(32, li);
  // areaArray.forEach(element => {
  //     query += "DepotYardID=" + element.ID + " OR "
  // });
  // query = query.substring(0, query.length-4)
  // console.log(query)
  // let res3 = await getCMSTable("vw_eDepot_GPG_CMS_DepotYard_Setting",query,li);
  // console.log(res3)
  // let res = await getTeuArray(15, li);
  // console.log(res);

  // let rows = []
  // let teuArray = await getCMSTable("vw_eDepot_GPG_CMS_DepotYard_Setting", "(DepotYardID=56) OR (DepotYardID=148)", li);
  // teuArray.data.forEach(element => {
  //     // query += "(DepotYardID=" + element.ID + ") OR "
  //     rows.push({
  //         "ID": element.ID,
  //         "state":1,
  //         "ground_x": 1,
  //         "ground_y": 1,
  //         "ground": 0,
  //         "orient": 0,
  //     })
  //     // console.log(element.ID)
  // });
  // console.log(rows)

  // let data = {
  //     "tablename": "Qiu5/cH4+qip8kYFFBGmqA4etTF6KqA7YrFxBgiGZGw=",
  //     "rows": JSON.stringify(rows[0]),
  // }
  // let res4 = await queryDatabase(data,li);
  // console.log(res4)
  // let res5 = await getHangtauID(li);
  // console.log(res5);
}

// test();

async function pushNewArea(area, depotID, li) {
  let data = {
    tbname: "GY4EHGl/J7m1PZBHXIZi0CFPqCsTkuBE+cXl5iYRCuQ=",
    rows: [
      {
        ID: "-1",
        state: "2",
        Depot: "" + depotID,
        AreaName: "VP_TCT",
        BayTo: area.num_bay + "",
        BlockName: area.name,
        RowTo: area.num_row + "",
        TierTo: "7",
        KhongBatRule: "True",
        LoaiBai: "2",
        STT: "0",
        ViTri: "1",
      },
    ],
  };
  // console.log(data);
  let res2 = await queryDatabase(data, li);
  console.log(res2);
}

async function removeAreaByID(id, li) {
  let data = {
    tbname: "GY4EHGl/J7m1PZBHXIZi0CFPqCsTkuBE+cXl5iYRCuQ=",
    rows: [
      {
        ID: "" + id,
        state: "3",
      },
    ],
  };
  // console.log(data);
  let res2 = await queryDatabase(data, li);
  console.log(res2);
}

async function updateDepotConfig(depotID, depotConfig, loginRes) {
  console.log("updateDepotConfig");
  let jsonData = {
    Depot_Config: JSON.stringify(depotConfig),
    DepotID: depotID,
  };

  var tokenAPI = {
    method: "POST",
    headers: {
      // "Content-Type": "application/json;charset=utf-8",
      Authorization: "Bearer " + loginRes.token,
    },
    body: JSON.stringify({
      reqid: "UpdateDepotConfigByDepotID",
      data: JSON.stringify(jsonData),
    }),
  };
  const new_tk = await fetch(tokenURL, tokenAPI).then((response) =>
    response.json()
  );
  // console.log(new_tk)

  let apiBody = {
    token: new_tk.token,
    reqtime: new_tk.reqtime,
    data: JSON.stringify(jsonData),
    appversion: 2023,
  };
  let yardPlanSettingAPI = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + loginRes.token,
    },
    body: JSON.stringify(apiBody),
  };
  // console.log(yardPlanSettingAPI);
  const resData = await fetch(updateDepotConfigURl, yardPlanSettingAPI).then(
    (res) => res.json()
  );
  // console.log(resData)
  return resData;
}

function processNone(str) {
  if (str == "") {
    return 0;
  } else {
    return str;
  }
}

async function getTeuArray(depotID, li) {
  let teuArray = [];
  let lineName = [];
  let query = "";
  let areaArray = await getDepotArea(depotID, li);
  areaArray.forEach((element) => {
    query += "(DepotYardID=" + element.ID + ") OR ";
    lineName.push({
      id: element.ID,
      line: element.BlockName,
      kv: element.AreaName,
    });
  });
  query = query.substring(0, query.length - 4);
  // console.log(lineName)
  let res3 = await getCMSTable(
    "vw_eDepot_GPG_CMS_DepotYard_Setting",
    query,
    li
  );
  // console.log(res3.data);

  res3.data.forEach((element) => {
    teuArray.push(
      new Teu(
        element.ground_x.v,
        element.ground_y.v,
        element.orient.v,
        element.HangTauID.v,
        element.TierSetting.v,
        lineName.find((o) => o.id == element.DepotYardID.v).line.v,
        element.DepotYardID.v,
        element.BaySetting.v,
        element.RowSetting_From.v,
        element.ground.v,
        element.ID
      )
    );
    // teuArray.push(element)
    // teuArray[teuArray.length-1].BlockName = lineName.find(o => o.id==element.DepotYardID.v).line;
  });
  return teuArray;
}

async function pushTeuArrayByDepotID(depotID, teuArray, li) {}

async function removeAllTeuByDepotID(depotID, li) {
  let areaArray = await getTeuArray(depotID, li);
  rows = [];
  areaArray.forEach((element) => {
    rows.push({ ID: element.id, state: 3 });
  });
  let data = {
    tbname: "Qiu5/cH4+qip8kYFFBGmqA4etTF6KqA7YrFxBgiGZGw=",
    rows: rows,
  };
  console.log(data);
  let res2 = await queryDatabase(data, li);
  console.log(res2);
}

async function getHangtauID(li) {
  let res = await getCMSTable("vw_GPG_CMS_HangTau", undefined, li);
  return res;
}

async function getTeuByDepotLine(lineID, li) {
  let res = await getCMSTable(
    "vw_eDepot_GPG_CMS_DepotYard_Setting",
    "DepotYardID=" + lineID,
    li
  );
  return res;
}

async function upSertTeuByID(teuID, teu, li) {
  let res = await getCMSTable(
    "vw_eDepot_GPG_CMS_DepotYard_Setting",
    "ID=" + teuID,
    li
  );
  console.log(res);
  if (res.data.length > 0) {
    console.log("update");
  } else {
    console.log("insert");
    let data = {
      tablename: "Qiu5/cH4+qip8kYFFBGmqA4etTF6KqA7YrFxBgiGZGw=",
      rows: [
        {
          ID: -1,
          state: 2,
          ID: "22",
          DepotYardID: teu.bay_id,
          BaySetting: teu.bay,
          RowSetting_From: teu.row,
          RowSetting_To: teu.row,
          TierSetting: teu.num_of_tier,
          HangTauID: "11",
          PhanLoaiID: "1;3",
          ContTypeSizeID: "67;49",
          Ha: "True",
          Nang: "True",
          ground_x: teu.y,
          ground_y: teu.x,
          ground: teu.ground,
          orient: "False",
        },
      ],
    };
    let res2 = await queryDatabase(data, li);
    console.log(res2.result);
  }
}
