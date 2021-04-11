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
  .range([chartHeight -10, 0])
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
        .scale(8775) //      .scale(8775)
        .translate([width / 2, height / 2])
  
  
        
    var path = d3.geoPath()
      .projection(projection);
  
    var promises = [];
    promises.push(d3.csv("data/ILAGDATA_.csv"));
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
        .attr('opacity', '.25')
  
  
  
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
      var csvKey = csvCounty.NAME; //primary key
  
      //loop through counties
      for (var a=0; a<illinoisCounties.length; a++){
        var geojsonProps = illinoisCounties[a].properties;
        var geojsonKey = geojsonProps.NAME;
  
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
    console.log(colorScale)
    return colorScale;
  }
  
  
  
  function setEnumerationUnits(illinoisCounties, map, path, colorScale){
      var counties = map.selectAll(".counties")
      .data(illinoisCounties)
      .enter()
      .append("path")
      .attr("class", function(d){
        return "counties " + d.properties.NAME;
      })
      .attr("d", path)
      .style("fill", function(d){
        return colorScale(d.properties[expressed]);
      })
      .on("mouseover", function(d){
        console.log(d.properties)
        highlight(d.properties);
      })
      .on("mouseout", function(d){
        dehighlight(d.properties)
      })
      .on("mousemove", moveLabel);
  
      var desc = counties.append("desc")
      .text('{"stroke": "#000", "stroke-width": "0.5px"}');
  
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
    
  //scale to size bars in regards to the frame and axis
  var yScaleT = d3.scaleLinear()
  .range([463, 0])
  .domain([0, 100]);
    
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
        return "bar " + d.NAME; //Bars or Bar?
      })
      .attr("width", chartInnerWidth / csvData.length - 1)
      .on("mouseover", highlight)
      .on("mouseout", dehighlight)
      .on("mousemove", moveLabel);
      
      var desc = bars.append("desc")
      .text('{"stroke": "none", "stroke-width": "0.5px"}');
  
  
      var chartTitle = chart.append("text")
          .attr("x", 30)
          .attr("y", 40)
          .attr("class", "chartTitle")
          .text("Percentage of  " + expressed + " in each county");
  
      // var yAxis = d3.axisLeft()
      //   .scale(yScaleT)
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
      .transition()
      .delay(function(d,i){
        return i * 20
      })
      .duration(500)
      .style("fill", function(d){
        return choropleth(d, colorScale);
      });
      updateChart(bars, csvData.length, colorScale);
  
      
  
      // //re-sort, resize, and recolor bars
      // var bars = d3.selectAll(".bar")
      //     //re-sort bars
      //     .sort(function(a, b){
      //         return b[expressed] - a[expressed];
      //     })
      //     .transition() //add animation
      //     .delay(function(d, i){
      //         return i * 20
      //     })
      //     .transition()
      //     .delay(function(d,i){
      //       return i * 20
      //     })
      //     .duration(500);
  
      // updateChart(bars, csvData.length, colorScale);    
      
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
    console.log(props)
    var selected = d3.selectAll("." + props.NAME) //select the joined element
    .style("stroke", "white").style("stroke-width", "5")
    .attr('opacity', '.85')
  
    setLabel(props)
  };
  
  function dehighlight(props){
    var selected = d3.selectAll("." + props.NAME)
      .style("stroke", function(){
        return getStyle(this,"stroke")
      })
      .style("stroke-width", function(){
        return getStyle(this, "stroke-width")
      })
      .attr('opacity', '1');
  
      d3.select(".infolabel")
        .remove();
  
      function getStyle(element,styleName){
        var styleText = d3.select(element)
          .select("desc")
          .text();
        var styleObject = JSON.parse(styleText);
  
        return styleObject[styleName];
      };
  }
  
  function setLabel(props){
    var labelAttribute = "<h1>" + props[expressed] +
      "</h1><b>" + expressed + "</b>";
    var infolabel = d3.select("body")
      .append("div")
      .attr("class", "infolabel")
      .attr("id", props.NAME + "_label")
      .html(labelAttribute)
  
    var countyName = infolabel.append("div")
      .attr("class", "labelname")
      .html(props.NAME)
  };
  
  //use current position of the mouse to place the label
  function moveLabel(){
    //determine width of label
    var labelWidth = d3.select(".infolabel")
      .node()
      .getBoundingClientRect()
      .width;
  
    //offset the label cordinates upon the mousemove
    var x1 = d3.event.clientX + 10, 
      y1 = d3.event.clientY - 75,
      x2 = d3.event.clientX - labelWidth - 10,
      y2 = d3.event.clientY + 25; 
  
    //test for overflow with comparrisons
    //horizontal
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
    //vertical
    var y = d3.event.clientY < 75 ? y2 : y1; 
  
    //adjust label in relation to the comparrison operators
    d3.select(".infolabel")
      .style("left", x + "px")
      .style("top", y + "px");
  }
  
  })(); //last line of main.js
  