var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = $(".chart").width() - margin.left - margin.right,
    height = $(".chart").height() - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */ 

// setup x 
var xValue = function(d) { return d.W;}, // Wins
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d["Est. Payroll"];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// add the graph canvas to the body of the webpage
var theSvg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var theData;
var theTeams;
var theYears;
var currYear = 2014;

$(document).ready(function() {
	getData();    
});

function getData() {

	d3.csv("data/mlb_payrolls.csv", function(data) {
		
		theData = data.filter(function(d) {
			return d.Year > 1984;
		});

		theTeams = d3.nest()
			.key(function(d) {
				return d.Tm;
			})
			.map(theData);

		theYears = d3.nest()
			.key(function(d) {
				return d.Year;
			})
			.map(theData);

		drawChart();

	});




}




function drawChart() {

	var minMaxWins = d3.extent(theData, function(d) {
		return +d.W;
	});

	var minMaxSalary = d3.extent(theData, function(d) {	
		var payroll = d["Est. Payroll"].replace("$", "");
		return (+payroll)/1000000;
	});

	xScale.domain(minMaxWins);
	yScale.domain(minMaxSalary);

	// Add the x-axis.
	theSvg.append("g")
	  .attr("class", "x axis")
	  .attr("transform", "translate(0," + height + ")")
	  .call(d3.svg.axis().scale(xScale).orient("bottom"))
	  .append("text")
	  .attr("class", "label")
	  .attr("x", width)
	  .attr("y", -6)
	  .style("text-anchor", "end")
	  .text("Number of wins");

	// Add the y-axis
	theSvg.append("g")
	  .attr("class", "y axis")
	  .call(d3.svg.axis().scale(yScale).orient("left"))
	  .append("text")
	  .attr("class", "label")
	  .attr("transform", "rotate(-90)")
	  .attr("y", 6)
	  .attr("dy", ".71em")
	  .style("text-anchor", "end")
	  .text("Est. Payroll");

	updateChart();

}




function updateChart() {

	var teamGroups = theSvg.selectAll(".teamClass")
		.data(theYears[currYear]);

	var newGroups = teamGroups.enter()
		.append("g")
		.attr("class","teamClass")
		.attr("transform",function(d){
			var payroll = d["Est. Payroll"].replace("$", "");
			return "translate("+xScale(d.W)+","+yScale((+payroll)/1000000)+")"
		});
		
	newGroups.append("circle")
		.attr("cx", 0)
		.attr("cy", 0)
		.attr("r", function(d) {
			var avgAtt = +d["Attend/G"];
			return avgAtt/1000;
		})
		.style("fill", "#66cc66")
		.style("stroke", "#FFFFFF")
		.attr("opacity", .7)
		.on("click", function(d) {
			console.log(d);
		});

	newGroups.append("text")
		.attr("class","teamLabel")
		.attr("x",0)
		.attr("y",0)
		.text(function(d){
			return d.Tm;
		});

	teamGroups.exit()
		.transition()
		.duration(3000)
		.remove();

	teamGroups.transition()
		.duration(3000)
		.attr("transform",function(d){
			var payroll = d["Est. Payroll"].replace("$", "");
			return "translate("+xScale(d.W)+","+yScale((+payroll)/1000000)+")"
		})

	teamGroups.selectAll("circle")
		.attr("r", function(d) {
			var avgAtt = +d["Attend/G"];
			return avgAtt/1000;
		})

	

}






