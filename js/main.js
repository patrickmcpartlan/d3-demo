//Begin Script
window.onload = initialize();

//Functions

//First function
function initialize(){
    setMap();
};
//set chloropath map using queue
function setMap(){
    queue()
        .defer(d3.csv, "data/AgData.csv") //Load Csv
        .defer(d3.json, "data/STATES.topojson") //Load topojson supporting background
        .defer(d3.json, "data/IL_COUNTIES.topojson") //Load topojson primary vectors
        .await(callback); //Allow callback to proceed after data is loaded
        console.log("hello")
        function callback(error, csvData, statesData, countiesData){
        console.log(statesData);
    };
}


function setMap(){
    
    var width = 960; //map frame height
    var height = 460; //map fram width

    //create svg
    var map = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

    //create

}



//








/////Tutorial2

// let stateName = "data/STATES.json";
// let countiesName = "data/IL_COUNTIES.json"

// let stateData
// let countyData

// let canvas = d3.select('#canvas')

// let drawMap = () => {

//     canvas.selectAll('path')
//         .data(countyData)
//         .enter()
//         .append('path')
//         .attr('d', d3.geoPath())
//         .attr('class', 'county')

// }

// d3.json(stateName).then (
//     (data,error) => {
//         if(error){
//             console.log(log)
//         } else {
//             stateData = topojson.feature(data, data.objects.STATES).features

//             console.log(stateData)

//             d3.json(countiesName).then(
//                 (data,error) => {
//                     if(error){
//                         console.log(error)
//                 }else{
//                     countyData = data
//                     console.log(countyData)
//                     drawMap()
//                 }
//                 }
//             )
//         }
//     }
// )