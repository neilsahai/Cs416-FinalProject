import { useState, useEffect, useRef } from "react";
import { Scrollama, Step } from "react-scrollama";
import * as d3 from "d3";


const economicData = [
  { year: 2020, inflation: 1.23, gdpGrowth: -2.77, popGrowth: 0.36, govSpending: 44.0 },
  { year: 2021, inflation: 4.70, gdpGrowth: 5.95, popGrowth: 0.21, govSpending: 41.0 },
  { year: 2022, inflation: 8.00, gdpGrowth: 2.10, popGrowth: 0.38, govSpending: 38.0 },
  { year: 2023, inflation: 4.12, gdpGrowth: 2.53, popGrowth: 0.50, govSpending: 37.0 },
  { year: 2024, inflation: 2.90, gdpGrowth: 2.30, popGrowth: 0.49, govSpending: 36.5 },
  { year: 2025, inflation: 2.70, gdpGrowth: -0.50, popGrowth: 0.47, govSpending: 36.0 },
];

const Charts = ({ activeChart }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(economicData.map((d) => d.year))
      .range([0, chartWidth])
      .padding(0.1);

    if (activeChart === "inflation") {
    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(economicData, (d) => d.inflation) + 2])
        .range([chartHeight, 0]);

    const line = d3
        .line()
        .x((d) => xScale(d.year) + xScale.bandwidth() / 2)
        .y((d) => yScale(d.inflation))
        .curve(d3.curveMonotoneX);

    // Append the line path
    const path = g
        .append("path")
        .datum(economicData)
        .attr("fill", "none")
        .attr("stroke", "#4CAF50")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Get the total length of the path
    const totalLength = path.node().getTotalLength();

    // Set initial stroke-dasharray and stroke-dashoffset for animation
    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        // Animate the line drawing
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Append dots with fade-in animation
    g.selectAll(".dot")
        .data(economicData)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.year) + xScale.bandwidth() / 2)
        .attr("cy", (d) => yScale(d.inflation))
        .attr("r", 5)
        .attr("fill", "#4CAF50")
        .attr("opacity", 0) // Start with invisible dots
        .transition()
        .duration(500) // Duration for each dot's fade-in
        .delay((d, i) => i * 200) // Stagger the appearance of each dot
        .attr("opacity", 1);

    // Append x-axis
    g.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("fill", "white");

    g.selectAll(".domain")
        .attr("stroke", "white");
    g.selectAll(".tick line")
        .attr("stroke", "white");
    
    // Append x-axis label
    g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 40) 
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Year")
        .style("font-size", "0.75em");

    // Append y-axis
    g.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("fill", "white");
    
    g.selectAll(".domain")
        .attr("stroke", "white");
    g.selectAll(".tick line")
        .attr("stroke", "white");
    
    // Append y-axis label
    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2) 
        .attr("y", -50) 
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Inflation Rate (%)")
        .attr("dy", "1.65em")
        .style("font-size", "0.75em");


    // Append chart title
    g.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text("Inflation Rate (%)");
    } else if (activeChart === "gdp")  {
  // Define y-scale with a domain that includes negative and positive values
  const yScale = d3
    .scaleLinear()
    .domain([d3.min(economicData, (d) => d.gdpGrowth) - 1, d3.max(economicData, (d) => d.gdpGrowth) + 1])
    .range([chartHeight, 0]);

  // Select and bind data for bars
  g.selectAll(".bar")
    .data(economicData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.year))
    .attr("width", xScale.bandwidth())
    .attr("fill", (d) => (d.gdpGrowth >= 0 ? "#2196F3" : "#F44336")) // Blue for positive, red for negative
    // Initial state: bars start at y=0 (yScale(0)) with zero height
    .attr("y", yScale(0))
    .attr("height", 0)
    // Add transition to animate to final position
    .transition()
    .duration(1000) 
    .attr("y", (d) => (d.gdpGrowth >= 0 ? yScale(d.gdpGrowth) : yScale(0))) 
    .attr("height", (d) => Math.abs(yScale(d.gdpGrowth) - yScale(0))); 

  // Add x-axis at y=0
  g.append("g")
    .attr("transform", `translate(0,${yScale(0)})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("fill", "white");

    g.selectAll(".domain")
        .attr("stroke", "white");
    g.selectAll(".tick line")
        .attr("stroke", "white");

  // Add y-axis
  g.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .attr("fill", "white");


    g.selectAll(".domain")
        .attr("stroke", "white");
    g.selectAll(".tick line")
        .attr("stroke", "white");

  // Add chart title
  g.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Real GDP Growth Rate (%)");


  // Append y-axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -50) 
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Real GDP Growth Rate (%)")
    .attr("dy", "1.55em")
    .style("font-size", "0.75em");

    
  // Append x-axis label
  g.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + 40)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Year")
    .style("font-size", "0.75em");
} else if (activeChart === "govSpending") {
  const yScale = d3
    .scaleLinear()
    .domain([
      d3.min(economicData, (d) => d.govSpending) - 2,
      d3.max(economicData, (d) => d.govSpending) + 2,
    ])
    .range([chartHeight, 0]);

  const area = d3
    .area()
    .x((d) => xScale(d.year) +  xScale.bandwidth() / 2)
    .y0(chartHeight)
    .y1((d) => yScale(d.govSpending))
    .curve(d3.curveMonotoneX);

  // Append clipPath for animation
  g.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", 0)
    .attr("height", chartHeight)
    .transition()
    .duration(2000)
    .attr("width", chartWidth);

  g.append("path")
    .datum(economicData)
    .attr("fill", "rgba(255, 152, 0, 0.3)")
    .attr("d", area)
    .attr("clip-path", "url(#clip)");

  // smooth top line (no side stroke)
  const line = d3
    .line()
    .x((d) => xScale(d.year) + + xScale.bandwidth() / 2)
    .y((d) => yScale(d.govSpending))
    .curve(d3.curveMonotoneX);

  g.append("path")
    .datum(economicData)
    .attr("fill", "none")
    .attr("stroke", "#FF9800")
    .attr("stroke-width", 2)
    .attr("d", line)
    .attr("stroke-dasharray", function () {
      const totalLength = this.getTotalLength();
      return `${totalLength} ${totalLength}`;
    })
    .attr("stroke-dashoffset", function () {
      return this.getTotalLength();
    })
    .transition()
    .duration(2000)
    .ease(d3.easeCubicInOut)
    .attr("stroke-dashoffset", 0);

  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("fill", "white");

    g.selectAll(".domain")
        .attr("stroke", "white");
    g.selectAll(".tick line")
        .attr("stroke", "white");

    // Append x-axis label
  g.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + 40) 
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Year")
    .style("font-size", "0.75em");



  g.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .attr("fill", "white");

     g.selectAll(".domain")
        .attr("stroke", "white");
    g.selectAll(".tick line")
        .attr("stroke", "white");

    // Append y-axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -50) 
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Government Spending (% of GDP)")
    .attr("dy", "1.55em")
    .style("font-size", "0.75em");

  g.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Government Spending (% of GDP)")


    
} else if (activeChart === "bubble") {
  const xScaleBubble = d3
    .scaleLinear()
    .domain([0, d3.max(economicData, (d) => d.inflation) + 2])
    .range([0, chartWidth]);

  const yScaleBubble = d3
    .scaleLinear()
    .domain([0, d3.max(economicData, (d) => d.popGrowth) + 0.2])
    .range([chartHeight, 0]);

  // Add animated bubbles
  g.selectAll(".bubble")
    .data(economicData)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("cx", (d) => xScaleBubble(d.inflation))
    .attr("cy", (d) => yScaleBubble(d.popGrowth))
    .attr("r", 0) // Start radius at 0 for animation
    .attr("fill", "rgba(33, 150, 243, 0.6)")
    .attr("stroke", "#1976D2")
    .attr("stroke-width", 1)
    .transition()
    .duration(1000)
    .ease(d3.easeBounceOut)
    .attr("r", (d) => d.popGrowth * 28); // Animate to actual size

  // Add labels, move them higher and reduce font size
  g.selectAll(".bubble-label")
    .data(economicData)
    .enter()
    .append("text")
    .attr("class", "bubble-label")
    .attr("x", (d) => xScaleBubble(d.inflation))
    .attr("y", (d) => yScaleBubble(d.popGrowth) - (d.popGrowth * 28) - 5) // move up above bubble
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .style("font-size", "10px") // smaller font
    .text((d) => d.year)
    .style("opacity", 0)
    .transition()
    .delay(500)
    .duration(1000)
    .style("opacity", 1);

  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(xScaleBubble))
    .selectAll("text")
    .attr("fill", "white");

    g.selectAll(".domain")
        .attr("stroke", "white");
    g.selectAll(".tick line")
        .attr("stroke", "white");
  
  
  // Append x-axis label
  g.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + 40) // Position below the x-axis
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Inflation %")
    .style("font-size", "0.75em");

  g.append("g")
    .call(d3.axisLeft(yScaleBubble))
    .selectAll("text")
    .attr("fill", "white");

    g.selectAll(".domain")
        .attr("stroke", "white");
    g.selectAll(".tick line")
        .attr("stroke", "white");

  // Append y-axis label
  g.append("text")
    .attr("transform", "rotate(-90)") 
    .attr("x", -chartHeight / 2) 
    .attr("y", -50) 
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Population Growth %")
    .style("font-size", "0.75em");

  g.append("text")
    .attr("x", chartWidth / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .text("Population Growth vs. Inflation");
}

  }, [activeChart]);

  return <svg ref={svgRef} className="chart-svg"></svg>;
};


const steps = [
  { chart: "inflation", title: "Inflation Rate", description: "The inflation rate is the percentage increase in the general price level of goods and services in an economy over a specific period, typically measured annually using the Consumer Price Index (CPI) or Producer Price Index (PPI).Tracks the annual change in CPI, peaking at 8% in 2022 due to supply chain issues and stimulus." },
  { chart: "gdp", title: "Real GDP Growth", description: "It reflects the actual increase in the volume of goods and services produced, excluding price changes. The Real GDP growith shows economic growth had a sharp decline in 2020 (-2.77%) and recovery in 2021 (5.95%)." },
  { chart: "govSpending",title: "Government Spending", description: "Government spending refers to the total expenditure by a government on goods, services, infrastructure, social programs, defense, and other public activities. Displays spending as a percentage of GDP, declining from 44% in 2020 to 36% in 2025." },
  { chart: "bubble", title: "Population Growth vs. Inflation:", description: "Population Growth is an annual percentage increase in a country's population, driven by birth rates, death rates, and net migration. Inflation is the rate at which the general price level of goods and services increases, reducing purchasing power. Compares population growth and inflation, with bubble size indicating population growth rate. Inflation can affect population dynamics indirectly by impacting living costs, wages, and economic stability, which may influence migration or birth rates." },
];

function Story() {
  const [activeChart, setActiveChart] = useState("inflation");
  const [activeStepIndex, setActiveStepIndex] = useState(0); // Use state for active step index
  const debounceRef = useRef(null);

  // Debounce function to limit state updates
  const debounce = (func, wait) => {
    return (...args) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => func(...args), wait);
    };
  };

  const onStepEnter = debounce(({ data, index }) => {
    console.log("Step entered, chart:", data.chart, "index:", index);
    setActiveChart(data.chart);
    setActiveStepIndex(index); // Update state directly
  }, 150); // Slightly increased debounce time

  const onStepExit = ({ direction, data }) => {
    if (direction === "up" && data.chart === steps[0].chart) {
      console.log("Exiting to first step");
      setActiveChart("inflation");
      setActiveStepIndex(0);
    }
  };

  // Scroll to the initial step on mount
  useEffect(() => {
    const initialStep = document.querySelector(`.step[data-step="1"]`);
    if (initialStep) {
      initialStep.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  return (
    <div className="scroll">
      <style>
        {`
          .step {
            transition: opacity 0.3s ease-in-out; /* Smooth opacity transition */
            margin: 50vh 0; /* Add vertical spacing to prevent overlap */
            min-height: 100px; /* Ensure steps have enough height */
          }
        `}
      </style>
      <div className="scroll__text">
        <Scrollama
          onStepEnter={onStepEnter}
          onStepExit={onStepExit}
          offset={0.6} // Adjusted for better trigger timing
          debug={false} // Enable debug to visualize trigger points
        >
          {steps.map((step, index) => (
            <Step data={step} key={index}>
              <div
                className="step"
                data-step={index + 1}
                style={{ opacity: activeStepIndex === index ? 1 : 1 }}
              >
                 <p style={{ fontSize: '1.075em' }}>{step.title}</p>
                <p style={{ fontSize: '0.75em' }}>{step.description}</p>
              </div>
            </Step>
          ))}
        </Scrollama>
      </div>
      <div className="scroll__graphic">
        <div className="chart">
          <Charts activeChart={activeChart} />
        </div>
      </div>
    </div>
  );
}

export default Story;