// var container = d3.select("body") //get the <body> element from the DOM
//     .append("svg") //put a new svg in the body
//     console.log(container)

// //create variables for boxes
// var w = 1000;
// var h = 1600;

//     //Create Container
// var outerBox = d3.select("body") 
//     .append("svg")
//     .attr("width", w)
//     .attr("height", h)
//     .attr("class", "outerbox")
//     .style("background-color", "rgba(0,0,0,0.2)");

// // create interior box and fill with attributes
// var innerBox = outerBox.append("rect")
//     .datum(400)
//     .attr("width", function(d){
//         return d*2})
//     .attr("height", function(d){
//         return d})
//     .attr("class","innerBox")
//     .attr("x", 50)
//     .attr("y", 50)
//     .style("fill", "#4c4c4c"); 

// //add array

// var array1 = [2, 13, 23, 35, 50];

// var cityPop = [
//     { 
//         city: 'Madison',
//         population: 233209
//     },
//     {
//         city: 'Milwaukee',
//         population: 594833
//     },
//     {
//         city: 'GreenBay',
//         population: 104057
//     },
//     {
//         city: 'Superior',
//         population: 27244
//     }
// ];

// var x = d3.scaleLinear()  //create the scale
//     .range([90, 810]) //output min and max
//     .domain([0, 3]); //input min and max

// var minPop = d3.min(cityPop, function(d){
//     return d.population
// });
// var maxPop = d3.max(cityPop, function(d){
//     return d.population
// });
// var y = d3.scaleLinear()
//     .range([404, 95])
//     .domain([0,1000000]);
// var color = d3.scaleLinear()
//     .range(["#003300", "#ffff99", "#663300"])
//     .domain([minPop, maxPop])

// var circles = outerBox.selectAll(".circles")
//         .data(cityPop)
//         .enter()
//         .append("circle")
//         .attr("class", "circles")
//         .attr("r", function (d){
//             var area = d.population * 0.01;
//             return Math.sqrt(area/Math.PI)
//         })
//         .attr("cx", function(d, i){
//             return x(i);
//         })
//         .attr("cy", function(d) {
//             return y(d.population)
//         })
//         .style("fill", function(d,i){
//             return color(d.population)
//         })
//         .style("stroke", "#000")

// var yAxis = d3.axisLeft(y)
//         .scale(y)
// var axis = outerBox.append("g")
//         .attr("class", "axis")
//         .attr("transform", "translate(50,0)")
//         .call(yAxis);

// yAxis(axis);

// var title = outerBox.append("text")
//         .attr("class", "title")
//         .attr("x", 50)
//         .attr("y", 75)
//         .text("Random Populations")
//         .attr("text-anchor", "left")


//         //place labels in relation to the y-axis
// // var labels = outerBox.selectAll(".labels")
// //         .data(cityPop)
// //         .enter()
// //         .append("text")
// //         .attr("class", "labels")
        
// //         .attr("text-anchor", "left")
// //         .attr("x", function(d,i){
// //             return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
// //         })
// //         .attr("y", function(d){
// //             return y(d.population) + 5
// //         })
// //         .text(function(d){
// //             return d.city + ", Pop. " + d.population;
// //         })

// //Copy from Lab text// 

//     //Example 3.14 line 1...create circle labels
//     var labels = outerBox.selectAll(".labels")
//         .data(cityPop)
//         .enter()
//         .append("text")
//         .attr("class", "labels")
//         .attr("text-anchor", "left")
//         .attr("y", function(d){
//             //vertical position centered on each circle
//             return y(d.population) + 5;
//         });

//     //first line of label
//     var nameLine = labels.append("tspan")
//         .attr("class", "nameLine")
//         .attr("x", function(d,i){
//             //horizontal position to the right of each circle
//             return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
//         })
//         .text(function(d){
//             return d.city;
//         });

//     //second line of label
//     var popLine = labels.append("tspan")
//         .attr("class", "popLine")
//         .attr("x", function(d,i){
//             return x(i) + Math.sqrt(d.population * 0.01 / Math.PI) + 5;
//         })
//         .attr("dy", "15") //vertical offset
//         .text(function(d){
//             return "Pop. " + d.population;
//         });

        
// //Set map class 

// // //begin script when window loads
// // window.onload = setMap();

// // //set up choropleth map
// // function setMap(){
// //     //use queue to parallelize asynchronous data loading
// //     d3.queue()
// //         .defer(d3.csv, "data/AgData.csv") //load attributes from csv
// //         .defer(d3.json, "data/States.topojson") //load background spatial data
// //         .defer(d3.json, "data/Counties.topojson") //load choropleth spatial data
// //         .await(callback);

// //     function callback(error, csvData, usaStates, countyData){
// //         // var usaStates = topojson.feature(usaStates, usaStates.objects.UsaStates),
// //         //     ilCounties = topojson.feature(countyData, countyData.objects.IlCounties).features;


// //         console.log(error);
// //         console.log(csvData);
// //         console.log(usaStates);
// //         console.log(countyData);
// //     };
// // };

//Set Map Outside tutorial

window.onload = initialize()

function initialize(){
    setMap();
};

function setMap(){
    //frame dimensions
    var width = 960;
    var height = 460;

    //create svg elecment
    var map = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geoAlbers()
        .center([-89, 0])
        .rotate([-10,0])
        .parallels([43,62])
        .scale(2500)
        .translate([width/2, height/2]);

    var path = d3.geoPath()
         .projection(projection);
    
    d3.queue() //promise 
        .defer(d3.csv, "data/AgData.csv") //load attributes from csv
        .defer(d3.json, "data/States.topojson") //load background spatial data
        .defer(d3.json, "data/Counties.topojson") //load choropleth spatial data
        .await(callback);

        function callback(error,csvData, statesData, countiesData){
            console.log(error);
            // console.log(csvData);
            // console.log(statesData);
            // console.log(countiesData);

            // var usaStates = topojson.feature(statesData, statesData.objects.UsaStates),
            //     ilCounties = topojson.feature(countiesData, countiesData.objects.IlCounties)
            topojsonObject = topojson.feature(countiesData, countiesData.objects);
            topojsonDataSet = topojsonObject.features;

            d3.select(".subunit-label")
                .data(topojsonDataSet)
                .enter('path')
                .attr("d", d3.geoPath());

            // console.log(usaStates);
            // console.log(ilCounties);
        }

        //promise
        
    
    //function callback(error, csvData, States, Counties){
    //         var usaStates = topojson.feature(usaStates, usaStates.objects.UsaStates),
    //             ilCounties = topojson.feature(countyData, countyData.objects.IlCounties).features;
    //     var states = map.append("path")
    //             .datum(topojson.feature(usaStates.objects.States))
    //             .attr("class", "states")
    //             .attr("d", path)
    //     };
}




// Create a d3-demo web directory and Git repository. Sync this repository with GitHub.
// Using D3, create an SVG bubble chart based on city population data for four cities (you must find your own data!). The circles on your chart should be sized, positioned, and colored proportionately the population data.
// Add a vertical axis, title, and labels to your chart. Keep your code neat and include explanatory comments where appropriate. You will be graded on the neatness and legibility of your D3 code.
// Be sure to include your dataset in the data folder of your repository and include in your commit. With the above tasks completed, commit changes to your d3-demo web directory and sync with GitHub.
// Based on the instructions in the D3 Lab Activity, find and format a multivariate dataset of interest to you that you will use to complete the Lab.
