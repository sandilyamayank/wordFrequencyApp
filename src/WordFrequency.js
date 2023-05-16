import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { Chart } from "chart.js";

const WordFrequency = () => {
  const [histogramData, setHistogramData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistogramData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://www.terriblytinytales.com/test.txt"
      );
      const text = response.data;
      const words = text.match(/\b(\w+)\b/g);
      const frequencyMap = {};
      words.forEach((word) => {
        const lowerCaseWord = word.toLowerCase();
        if (lowerCaseWord in frequencyMap) {
          frequencyMap[lowerCaseWord]++;
        } else {
          frequencyMap[lowerCaseWord] = 1;
        }
      });
      const sortedFrequencyMap = Object.entries(frequencyMap).sort(
        (a, b) => b[1] - a[1]
      );
      const top20Words = sortedFrequencyMap.slice(0, 20);
      const histogramData = {
        labels: top20Words.map((word) => word[0]),
        data: top20Words.map((word) => word[1]),
      };
      setHistogramData(histogramData);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const downloadCsv = () => {
    const csvData = `Word,Frequency\n${histogramData.labels
      .map((label, index) => `${label},${histogramData.data[index]}`)
      .join("\n")}`;
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "histogram-data.csv");
  };

  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (histogramData.labels.length) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: histogramData.labels,
          datasets: [
            {
              label: "Word Frequency",
              data: histogramData.data,
              backgroundColor: "#007bff",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  precision: 0,
                },
              },
            ],
          },
        },
      });
    }
  }, [histogramData]);

  return (
    <div>
      <h1>Word Frequency Histogram</h1>
      <form onSubmit={(e) => { e.preventDefault(); fetchHistogramData(); }}>
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </button>
      </form>
      {histogramData.labels.length > 0 && (
        <>
          <canvas ref={canvasRef} />
          <button onClick={downloadCsv}>Export</button>
        </>
      )}
    </div>
  );
};

export default WordFrequency;
