const ExecutionQuestion = (
  summary,
  addBuffer,
  mulBuffer,
  storeBuffer,
  setSummary,
  memMiss,
  memHit,
  addHit,
  subHit,
  mulHit,
  divHit,
  GLOBAL_CLK
) => {
  for (let i = 0; i < summary.length; i++) {
    //loop over all the summary
    if (!summary[i].executionComplete && summary[i].issue < GLOBAL_CLK) {
      let locIndex = parseInt(summary[i].location.slice(1)) - 1;
      const locationLoadsStoresInSummary = summary
        .map((record, index) =>
          record?.location[0] === "L" || record?.location[0] === "S"
            ? index
            : -1
        )
        .filter((mappedRecord) => mappedRecord !== -1);

      //if summary elem has not started execution yet
      let operationTime;
      if (summary[i].location[0] === "M") {
        //if mul div operation
        operationTime =
          summary[i]?.instruction.split(" ")[0] === "MUL.D" ||
          summary[i]?.instruction.split(" ")[0] === "MUL.S"
            ? mulHit
            : divHit;
        if (!mulBuffer[locIndex].qj && !mulBuffer[locIndex].qk) {
          //check if qj="" && qk=""
          setSummary(
            (
              prevSum //add clock time... in the execution time
            ) =>
              prevSum.map((item, index) =>
                index === i
                  ? operationTime === 1
                    ? { ...item, executionComplete: `${GLOBAL_CLK}` }
                    : { ...item, executionComplete: `${GLOBAL_CLK}...` }
                  : item
              )
          );
        }
      } else if (summary[i].location[0] === "A") {
        operationTime =
          summary[i]?.instruction.split(" ")[0] === "ADD.D" ||
          summary[i]?.instruction.split(" ")[0] === "ADD.S"
            ? addHit
            : subHit;
        if (!addBuffer[locIndex].qj && !addBuffer[locIndex].qk) {
          {
            setSummary((prevSum) =>
              prevSum.map((item, index) =>
                index === i
                  ? operationTime === 1
                    ? { ...item, executionComplete: `${GLOBAL_CLK}` }
                    : { ...item, executionComplete: `${GLOBAL_CLK}...` }
                  : item
              )
            );
          }
        }
      } else if (summary[i].location[0] === "L") {
        operationTime =
          i === locationLoadsStoresInSummary[0] ? memMiss : memHit;
        setSummary((prevSum) =>
          prevSum.map((item, index) =>
            index === i
              ? operationTime === 1
                ? { ...item, executionComplete: `${GLOBAL_CLK}` }
                : { ...item, executionComplete: `${GLOBAL_CLK}...` }
              : item
          )
        );
      } else if (summary[i].location[0] === "S") {
        operationTime =
          i === locationLoadsStoresInSummary[0] ? memMiss : memHit;
        console.log(`storeBuffer[locIndex].q: ${storeBuffer[locIndex].q}`);
        if (!storeBuffer[locIndex].q) {
          {
            setSummary((prevSum) =>
              prevSum.map((item, index) =>
                index === i
                  ? operationTime === 1
                    ? { ...item, executionComplete: `${GLOBAL_CLK}` }
                    : { ...item, executionComplete: `${GLOBAL_CLK}...` }
                  : item
              )
            );
          }
        }
      }
    }
  }

  for (let i = 0; i < summary.length; i++) {
    const locationLoadsStoresInSummary = summary
      .map((record, index) =>
        record?.instruction.split(" ")[0][0] === "L" ||
        record?.instruction.split(" ")[0][0] === "S"
          ? index
          : -1
      )
      .filter((mappedRecord) => mappedRecord !== -1);
    //enters law MESH haga bt-execute fe 1 clk cycle AND yet to have finished execution
    if (
      summary[i].executionComplete &&
      summary[i].executionComplete.includes("...") &&
      summary[i].executionComplete.split("...")[0] &&
      !summary[i].executionComplete.split("...")[1]
    ) {
      //if execution ends in ...
      let timeForOp;
      switch (summary[i].location[0]) {
        case "L":
        case "S":
          // console.log(
          //   `locationLoadsStoresInSummary[0]: ${JSON.stringify(
          //     locationLoadsStoresInSummary
          //   )}`
          // );
          timeForOp = locationLoadsStoresInSummary[0] === i ? memMiss : memHit;
          // console.log(`timeForOp: ${timeForOp}`);
          break;
        case "M":
          if (
            summary[i].instruction.split(" ")[0] === "MUL.D" ||
            summary[i].instruction.split(" ")[0] === "MUL.S"
          ) {
            timeForOp = mulHit;
          } else {
            timeForOp = divHit;
          }
          break;
        case "A":
          if (
            summary[i].instruction.split(" ")[0] === "ADD.D" ||
            summary[i].instruction.split(" ")[0] === "ADD.S"
          ) {
            timeForOp = addHit;
          } else {
            timeForOp = subHit;
          }
          break;
      }

      // console.log(`timeForOp: ${timeForOp}`);
      // console.log(`GLOBAL_CLK: ${GLOBAL_CLK}`);
      // console.log(
      //   `parseInt(summary[i].executionComplete.split("...")[0]): ${parseInt(
      //     summary[i].executionComplete.split("...")[0]
      //   )}`
      // );

      if (
        GLOBAL_CLK -
          parseInt(summary[i].executionComplete.split("...")[0]) +
          1 ===
        timeForOp
      ) {
        //if global clk time-exec start time(num before the ...)==time for op
        setSummary((prevSum) =>
          prevSum.map(
            (
              record,
              index //write the global clk after the ...
            ) =>
              index === i
                ? {
                    ...record,
                    executionComplete: `${prevSum[i].executionComplete}${GLOBAL_CLK}`,
                  }
                : record
          )
        );
      }
    }
  }
};

export default ExecutionQuestion;
