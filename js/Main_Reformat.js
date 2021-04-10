//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

//pseudo-global variables
var attrArray = ["CornNoTill", "Erosion", "SoyNoTill", "CornSyNoTill", "PercentCCResidue"]
var expressed = attrArray[0]; //initial attribute

//chart dimensions
var chartWidth = window.innerWidth * .425, 
chartHeight = 473,
leftPadding = 25, 
rightPadding = 2, 
topBottomPadding = 5,
chartInnerWidth = chartWidth - leftPadding - rightPadding,
chartInnerHeight = chartHeight - topBottomPadding * 2,
translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

//scale to size bars in regards to the frame and axis
var yScale = d3.scaleLinear()
.range([463, 0])
.domain([0, 100]);

//begin script when window loads
window.onload = setMap();

function setMap(){
  //map frame dimensions
  var width = window.innerWidth * 0.5,
    height = 960;

  //create new svg container for the map
  var map = d3.select("body")
    .append("svg")
    .attr("class", "map")
    .attr("width", width)
    .attr("height", height);

    var projection = d3.geoAlbers()
      .center([0, 39.90])
      .rotate([89.25, 0])
      .parallels([40, 45])
      .scale(8775)
      .translate([width / 2, height / 2])


  var path = d3.geoPath()
    .projection(projection);

  var promises = [];
  promises.push(d3.csv("data/ILAGDATA.csv"));
  promises.push(d3.json("data/UsaStates_.topojson"));
  promises.push(d3.json("data/IllinoisCounties_.topojson"));
  Promise.all(promises).then(callback);

	function callback(data){

    [csvData, backstates, ilcounties] = data;


		//create graticule generator
		var graticule = d3.geoGraticule()


		//create graticule background
		var gratBackground = map.append("path")
			.datum(graticule.outline()) //bind graticule background
			.attr("class", "gratBackground") //assign class for styling
			.attr("d", path) //project graticule



		var usaStates = topojson.feature(backstates, backstates.objects.UsaStates_),
			illinoisCounties = topojson.feature(ilcounties, ilcounties.objects.IllinoisCounties_).features;

		var usaStates = map.append("path")
			.datum(usaStates)
			.attr("class", "states")
			.attr("d", path);

	illinoisCounties = dataJoin(illinoisCounties, csvData);

  var colorScale = makeColorScale(csvData);

  setEnumerationUnits(illinoisCounties, map, path, colorScale);

  setChart(csvData, colorScale);

  createDropdown(csvData)



	};


};//Last line of set map

function dataJoin(illinoisCounties, csvData){

  for (var i=0; i<csvData.length; i++){
    var csvCounty = csvData[i]; //current county in loop
    var csvKey = csvCounty.COUNTYFP; //primary key

    //loop through counties
    for (var a=0; a<illinoisCounties.length; a++){
      var geojsonProps = illinoisCounties[a].properties;
      var geojsonKey = geojsonProps.COUNTYFP;

      if (geojsonKey == csvKey) {

        //assign attributes
        attrArray.forEach(function(attr){
          var value = parseFloat(csvCounty[attr]);
          geojsonProps[attr] = value;
        });
      };
    };
  };
console.log(illinoisCounties);
return illinoisCounties;
};

function makeColorScale(data){
  var colorClasses = ['#a6611a','#dfc27d','#bae4b3','#a6d96a','#1a9641']; //Creidt:ColorBrewer2.org

//color scale generator quantile // 

var colorScale = d3.scaleQuantile()
  .range(colorClasses);

  var domainArray = [];
  for (var i=0; i<data.length; i++){
    var value = parseFloat(data[i][expressed]);
    domainArray.push(value);
  };

  colorScale.domain(domainArray);

//   var minmax = [
//     d3.min(data, function(d) {return parseFloat(d[expressed]); }),
//     d3.max(data, function(d) {return parseFloat(d[expressed]); })
//   ];
//   colorScale.domain(minmax);
// //End of equal interval

//Jenks Natural Breaks
// var colorScale = d3.scaleThreshold()
//   .range(colorClasses);

// var domainArray = [];
// for (var i=0; i<data.length; i++){
//   var value =parseFloat(data[i][expressed]);
//   domainArray.push(value);
// };

// var clusters = ss.ckmeans(domainArray, 5);
// domainArray = clusters.map(function(d){
//   return d3.min(d);
// });
// domainArray.shift();

// colorScale.domain(domainArray);

///End of Jenks 
  return colorScale;
}



function setEnumerationUnits(illinoisCounties, map, path, colorScale){
    var counties = map.selectAll(".counties")
    .data(illinoisCounties)
    .enter()
    .append("path")
    .attr("class", function(d){
      return "counties " + d.properties.COUNTYFP;
    })
    .attr("d", path)
    .style("fill", function(d){
      return colorScale(d.properties[expressed]);
    })
    // .style("fill", function(d){
    //   return choropleth(d.properties, colorScale);
    // });    
    // .on("mouseover", function(d){
    //   console.log(d)
    // })
    // .on("mouseout", function(d){
    //   dehighlight(d.properties)
    // })
    .on('mouseover', function (d,i){
      d3.select(this).transition()
      .duration('50')
      .attr('opacity', '.85')
    })
    .on('mouseout', function(d,i){
      d3.select(this).transition()
        .duration('150')
        .attr('opacity', '1');
    });
};

function choropleth(props, colorScale){
  //verify value is a number
  var value = parseFloat(props[expressed]);
  //Assign gray if not a color
  if (typeof value == 'number' && !isNaN(value)){
    return colorScale(value);
  } else {
    return "#D3D3D3";
  };
};

///Create synced bar chart
function setChart(csvData, colorScale){
  //dimensions

//second svg onto the webpage for the chart
  var chart =  d3.select("body")
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("class", "chart");
  
  var chartBackground = chart.append("rect")
    .attr("class", "chartBackground")
    .attr("width", chartInnerWidth)
    .attr("height", chartInnerHeight)
    .attr("transform", translate);

  var bars = chart.selectAll(".bar")
    .data(csvData)
    .enter()
    .append("rect")
    .sort(function(a,b){
      return b[expressed]-a[expressed]
    })
    .attr("class", function(d){
      return "bar " + d.COUNTYFP; //Bars or Bar?
    })
    .attr("width", chartInnerWidth/ csvData.length - 1)
    .on("mouseover", highlight)
    // .on("mouseout", dehighlight)


    var chartTitle = chart.append("text")
        .attr("x", 30)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Percentage of  " + expressed + " in each county");

    // var yAxis = d3.axisLeft()
    //   .scale(yScale)
    //   .orient("left");

    // var axis = chart.append("g")
    //   .attr("class", "axis")
    //   .attr("transform", translate)
    //   .call(yAxis)

    var chartFrame = chart.append("g")
    .attr("class", "chartFrame")
    .attr("width", chartInnerWidth)
    .attr("height", chartInnerHeight)
    .attr("transform", translate);

    //Implement update Chart function
    updateChart(bars, csvData.length, colorScale);
  }; //End of Set Chart

//create dropdown menu for attribute selection
function createDropdown(csvData){
  //Container for the menu
  var dropdown = d3.select("body")
    .append("select")
    .attr("class", "dropdown")
    .on("change", function(){
      changeAttribute(this.value, csvData)
    });

  var initialOption = dropdown.append("option")
    .attr("class", "initialOption")
    .attr("disabled", "true")
    .text("Select Attribute");

  var attrOptions = dropdown.selectAll("attrOptions")
    .data(attrArray)
    .enter()
    .append("option")
    .attr("value", function(d){ return d})
    .text(function(d){return d});
}; //End Create Dropdown

//
function changeAttribute(attribute, csvData){
  //
  expressed = attribute;

  //
  var colorScale = makeColorScale(csvData);

  //
  var counties = d3.selectAll(".counties")
      .transition()
      .duration(1000)
      .style("fill", function(d){
          return choropleth(d.properties, colorScale)
      });



    /////change color of bars
    var bars = d3.selectAll(".bar")
    .sort(function(a,b){
      return b[expressed] - a[expressed];
    })
    .attr("x", function(d,i){
      return i * (chartInnerWidth / csvData.length) + leftPadding;
    })
    .attr("height", function(d,i){
      return 463 - yScale(parseFloat(d[expressed]));
    })
    .attr("y", function(d, i){
      return yScale(parseFloat(d[expressed])) + topBottomPadding; 
    })
    .transition()
    .delay(function(d,i){
      return i * 20
    })
    .duration(500)
    .style("fill", function(d){
      return choropleth(d, colorScale);
    });
};

//adjust bars on the chart based off changed attribute
function updateChart(bars, n, colorScale){
  //position bars
  bars.attr("x", function(d,i){
    return i * (chartInnerWidth / n) + leftPadding;
  })
      //resize bars
      .attr("height", function(d,i){
        return 463 - yScale(parseFloat(d[expressed]));
      })
      .attr("y", function(d,i){
        return yScale(parseFloat(d[expressed])) + topBottomPadding;
      })
      //recolor bars
      .style("fill", function(d){
        return choropleth(d,colorScale);
      });
  //Update the title to go with the bars
  var chartTitle = d3.select(".chartTitle")
      .text("Percentage of " + expressed + " in each county")
};

//highlight counties and bars

function highlight(props){
  //change outline
  var selected = d3.selectAll("." + props.COUNTYFP) //select the joined element
    .style("stroke", "green")
    .style("stroke-width", "3")
};

function dehighlight(props){
  var selected = d3.selectAll("." + props.COUNTYFP)
      .style("stroke", function(){
          return getStyle(this, "stroke")
      })
      .style("stroke-width", function(){
          return getStyle(this, "stroke-width")
      });
    }


})(); //last line of main.js
