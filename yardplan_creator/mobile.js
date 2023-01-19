var depot;
let ground;
let areaList;
let bayNameArray;
let optArray;
let countBay;
let countOpt;;
let sumAll;
let teuArray;
let gridAngle = 0;
var blocklist
let areaGrid = [];


//fetch API
async function loadDepot(dp, callback){
    depot = await getDepotConfig(dp);
    ground = depot.ground;
    // let dPath =   './data/etdv2.json';
    // let teupath = dPath.substring(0, dPath.indexOf('.json')) + '_reservation.json';
    // await $.getJSON(teupath, function (json) {
    //     teuArray = json;
    // })
    callback();
}

loadDepot(32, init);

function init(){
    // updateStat();
    // initTeuArray();
    // processTeu()
    document.getElementById("depot_name").innerText = depot.name
    blocklist = document.getElementById("depot_block_list");
    for (let i=0; i<depot.Area.length; i++){
        // console.log(depot.Area[i].name)
        singleBlock = document.createElement('div')
        singleBlock.setAttribute('class', 'single_block_container')
        singleBlock.setAttribute('onclick', 'block_pressed('+ i +')')
        singleBlock.innerHTML = `<div class="block_overview_div">
        <div class="tenblock">` + depot.Area[i].name + `</div>
        <div class="block_sep">
        </div>
        <div class="propdiv">
            <div class="checkbox_div">
                <input class="checkbox_all" type="checkbox">
                <input class="checkbox_all" type="checkbox">
            </div>
        </div>
    </div>
    <div class="block_detail_div" id="block_detail_container_`+ i +`" style="display: none;">
        <h2>Detail</h2>
    </div>`
        // console.log(singleBlock)
        blocklist.appendChild(singleBlock)
    }
}

function block_pressed(id){
    // console.log(depot.Area[id].name)
    let detailContainer = document.getElementById("block_detail_container_"+id);
    if (detailContainer.style.display == "none"){
        detailContainer.setAttribute('style', "display: inline-block")
    }else{
        detailContainer.setAttribute('style', "display: none")
    }
}

function processTeu(){
    // console.log(ground[])
    areaGrid = [];
    for (let i=0; i<bayNameArray.length; i++){
        let origin = findAreaOrigin(bayNameArray[i])
        let id = origin.ground;
        console.log(origin)
        ar = []
        for (let j=0; j<origin.hei; j++){
            row = []
            for (let k=0; k<origin.wid;k++){
                row.push({num_of_tier:0, hangtau:"", gateIn:0, gateOut:0, bay:"", row:0});
            }
            ar.push(row)
        }
        areaGrid.push(ar)
    }
    for (let i=0; i<teuArray.length; i++){
        const index = depot.Area.findIndex(object => {
            return object.name == teuArray[i].bay_name;
        });
        areaGrid[index][parseInt((teuArray[i].bay+1)/2-1)][parseInt((teuArray[i].row-1))]= teuArray[i]
    }
}

function pushTeu(){
    teuArray = [];
    for (let i=0; i<bayNameArray.length; i++){
        let origin = findAreaOrigin(bayNameArray[i])
        for (let j=0; j<origin.hei; j++){
            for (let k=0; k<origin.wid;k++){
                teuArray.push(areaGrid[i][j][k])
            }
        }
    }
    console.log(teuArray)
}



