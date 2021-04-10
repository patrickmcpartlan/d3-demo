//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){

	var attrArray = ["Erosion", "SoyNoTill"]


	//map frame dimensions
	var width = 900,
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

		csvData = data[0];
		states = data[1];
		counties = data[2];

		//create graticule generator
		var graticule = d3.geoGraticule()


		//create graticule background
		var gratBackground = map.append("path")
			.datum(graticule.outline()) //bind graticule background
			.attr("class", "gratBackground") //assign class for styling
			.attr("d", path) //project graticule



		var usaStates = topojson.feature(states, states.objects.UsaStates_),
			illinoisCounties = topojson.feature(counties, counties.objects.IllinoisCounties_).features;


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


		var usaStates = map.append("path")
			.datum(usaStates)
			.attr("class", "states")
			.attr("d", path);

		var ilCounties = map.selectAll(".ilCounties")
			.data(illinoisCounties)
			.enter()
			.append("path")
			.attr("class", function(d){
				return d.properties.COUNTYFP;
			})
			.attr("d", path)



			illinoisCounties = dataJoin(illinoisCounties, csvData);
	};
};
