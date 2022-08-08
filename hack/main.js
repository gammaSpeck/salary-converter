import { parse } from "csv-parse/sync";
import fs from "fs/promises";

/**
 * 1. Download the data from `https://data.worldbank.org/indicator/PA.NUS.PRVT.PP`
 * 2. Name the data as `data.csv`
 * 3. Copy paste the output.json contents in the `interfaces/index.ts` file
 */

const test = async (relevantYear = 2021) => {
  const content = await fs.readFile("../data.csv");
  const records = parse(content, { relaxQuotes: true, relaxColumnCount: true });

  // Get only relevant data => The first 4 lines have insignificant data
  const data = records.slice(4);

  const [columns, ...rows] = data;
  console.log(`There are ${columns.length} columns`);
  console.log(columns);

  const [, , , , ...years] = columns;
  console.log("years", years);

  const allRowsHaveSameCells = rows.every((r) => r.length === columns.length);
  if (!allRowsHaveSameCells) return;
  console.log(
    "All Rows have same number of cells. This is at least well structured data :)"
  );

  let countryCodesMap = {};

  for (let row of rows) {
    const [
      countryName,
      countryCode,
      indicatorName,
      indicatorCode,
      ...pppFactors
    ] = row;

    // We dont care about rows which have NO useful data! Bleh :p
    // This filters out the rows which have no valid data over the years
    if (pppFactors.every((data) => !data)) continue;

    countryCodesMap[countryCode] = {
      countryCode,
      countryName,
      indicatorName,
      indicatorCode,
      pppMap: {}
    };

    // By now, we know that the length of arr years is same as arr pppFactors
    for (let i = 0; i < years.length; i++) {
      const [yearValue, ppfVal] = [years[i], pppFactors[i]];
      // If the year or the ppfVal is malformed, or empty, it is useless to us
      if (!yearValue || !ppfVal || relevantYear != yearValue) continue;

      // Dynamically add the key
      countryCodesMap[countryCode].pppMap[yearValue] = ppfVal;
    }

    if (
      !Object.keys(countryCodesMap[countryCode].pppMap).includes(
        `${relevantYear}`
      )
    )
      delete countryCodesMap[countryCode];
  }

  console.log(
    "Number of countries to compare from :",
    Object.keys(countryCodesMap).length
  );

  fs.writeFile(
    "./hack/output.json",
    JSON.stringify(countryCodesMap, undefined, 2)
  );
};

test();
