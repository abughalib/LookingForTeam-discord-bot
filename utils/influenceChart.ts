import EDSM from "./edsm";
import QuickChart from "quickchart-js";
import { Factions } from "./systemInfoModel";

// InfluenceData used for QuickChart
// in the dataset.
interface InfluenceData {
  label: string;
  data: Array<number>;
  fill: boolean;
  pointRadius: number;
  borderWidth: number;
  lineTension: number;
}

/*
  Create a chart of faction influence over the days
  Using quickchart.io

  Args:
    factions[]: factions to be plotted
    days: number of days to be plotted
  Returns:
    url: url of the chart
*/

async function createInfluenceChart(
  factions: Factions[],
  days: number
): Promise<string | null> {
  // Factions Present in that system.
  let factionsName = [];

  // Influence of the factions with respect to time.
  // with QuickChart options
  let dataset: Array<InfluenceData> = [];

  // X - Axis of the Chart (Showing Date);
  let timeAxis: Array<string> = getDayMonthRange(days);

  for (let i = 0; i < factions.length; i += 1) {
    // If the faction is present in the system
    if (factions[i].influence >= 0.01) {
      factionsName.push(factions[i].name);

      let history = factions[i].influenceHistory;

      // If history is not available
      // Reason would be faction retreted.
      if (!history) {
        continue;
      }
      // Fill databse based on history timestamp
      let timeInfluence = lastDays(history, days);

      // Populated dataset Array.
      dataset.push({
        label: factions[i].name,
        data: timeInfluence,
        fill: false,
        pointRadius: 2,
        lineTension: 0.4,
        borderWidth: 1,
      });
    }
  }

  // Initialize quickChart
  const quickChart: QuickChart = new QuickChart();

  // Set Chart Type & Data
  quickChart.setConfig({
    type: "line",
    data: {
      labels: timeAxis,
      datasets: dataset,
    },
    options: {
      legend: {
        position: "bottom",
        align: "start",
      },
    },
  });

  // Get the short URL of the chart
  return quickChart.getShortUrl();
}

/*
  Get the influence of the faction for the last given days.
  Args:
    history: history of the faction
    days: number of days to be plotted
  Returns
    influence: Array of influence of the faction
*/
function lastDays(
  influenceHistory: Map<string, number>,
  days: number
): Array<number> {
  let influence: Array<number> = [];

  // Get Date Range
  const today = Date.now();
  const oneDayEpoch = 24 * 60 * 60 * 1000;
  const lastDaysEpoch = days * oneDayEpoch;
  const dateOnThatDate = new Date(today - lastDaysEpoch);

  // Sort the history based on timestamp
  for (let [key, value] of Object.entries(influenceHistory)) {
    let int_key = parseInt(key) * 1000;
    if (int_key > dateOnThatDate.getTime()) {
      influence.push(value * 100);
    }
  }

  // if the influence history is not complete,
  // fill the missing days with last influence value
  // Assuming that the influence is not changing if not being detected
  if (influence.length !== 0) {
    const last_value = influence[influence.length - 1];
    for (let i = influence.length; i <= days; i += 1) {
      influence.push(last_value);
    }
  }
  return influence;
}

/*
  Get the date range for the last given days.
  format: DD-MM
  Args:
    days: number of days to be plotted
  Returns
    day_month: Array of date range
*/

function getDayMonthRange(days: number): Array<string> {
  let day_month: Array<string> = [];

  // Get Date Range
  const today = Date.now();
  const oneDayEpoch = 24 * 60 * 60 * 1000;
  const lastDaysEpoch = days * oneDayEpoch;
  const dateOnThatDate = new Date(today - lastDaysEpoch);

  // Increment date by one day
  // Populate the day_month array
  for (let i = dateOnThatDate.getTime(); i <= today; i += oneDayEpoch) {
    const givenDate = new Date(i);
    day_month.push(givenDate.getDate() + "-" + givenDate.getMonth());
  }

  return day_month;
}

export default createInfluenceChart;
