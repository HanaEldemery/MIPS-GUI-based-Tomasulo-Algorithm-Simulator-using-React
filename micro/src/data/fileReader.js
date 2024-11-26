import { useState, useEffect } from "react";

const FetchFileContent = () => {
  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    const getFileContent = async () => {
      try {
        const response = await fetch("/MIPS.txt");
        const data = await response.text();
        const lines = data
          .split("\n")
          .map((line) => line.replace("\r", "").trim());
        setFileContent(lines);
      } catch (err) {
        console.error("Error fetching file:", err);
      }
    };

    getFileContent();
  }, []);

  return fileContent;
};

export default FetchFileContent;
