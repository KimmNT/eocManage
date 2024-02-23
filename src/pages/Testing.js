import React, { useState } from "react";
import * as XLSX from "xlsx";

const Testing = () => {
  const [excelData, setExcelData] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Assuming you have a single sheet in the Excel file
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert the sheet to an array of objects
        const dataArray = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        setExcelData(dataArray);
      } catch (error) {
        console.error("Error reading Excel file:", error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />

      {excelData.length > 0 && (
        <div>
          <h2>Excel Data:</h2>
          <ul>
            {excelData.map((row, index) => (
              <li key={index}>{row}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Testing;
