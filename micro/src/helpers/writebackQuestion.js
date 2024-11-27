import { useEffect, useState } from "react";

import OperationBuffer from "../buffers/operationBuffer";

import IssueQuestion from "./issueQuestion";

const instructionToWriteBack = (
  arrayOfInstructionTags,
  mulBuffer,
  addBuffer,
  storeBuffer
) => {
  //takes as input an array of all instruction tags that can be written back (pushed onto CDB) !!!at this clk cycle!!!
  const instructionTagsWithAppearances =
    arrayOfInstructionTags.length &&
    arrayOfInstructionTags.map((item) => ({
      tag: item,
      appeared: 0,
    }));
  //loops on all buffers (mulBuffer, addBuffer and storeBuffer only) and keeps track for each of the input instruction tag how many times they appear in the Qj / Qk / Q
  mulBuffer.map((record) => {
    const qj = record?.qj;
    const qk = record?.qk;
    if (qj || qk)
      instructionTagsWithAppearances.length &&
        instructionTagsWithAppearances.forEach((element) => {
          if (element?.tag === qj || element?.tag === qk)
            return { ...element, appeared: element.appeared + 1 };
          return element;
        });
  });
  addBuffer.map((record) => {
    const qj = record?.qj;
    const qk = record?.qk;
    if (qj || qk)
      instructionTagsWithAppearances.length &&
        instructionTagsWithAppearances.forEach((element) => {
          if (element?.tag === qj || element?.tag === qk)
            return { ...element, appeared: element.appeared + 1 };
          return element;
        });
  });
  storeBuffer.map((record) => {
    const q = record?.q;
    if (q)
      instructionTagsWithAppearances.length &&
        instructionTagsWithAppearances.forEach((element) => {
          if (element?.tag === q)
            return { ...element, appeared: element.appeared + 1 };
          return element;
        });
  });

  //compare the number of appearances for each of the input instruction tags
  //-----------//
  //if equal ==> return the instruction tag at the first index
  //else ==> return the instruction tag which has the most appearances
  return (
    instructionTagsWithAppearances.length &&
    instructionTagsWithAppearances.reduce(
      (maxElement, currentElement) => {
        return currentElement?.appeared > maxElement?.appeared
          ? currentElement
          : maxElement;
      },
      { appeared: -Infinity }
    )
  );
};

const WritebackQuestion = (
  GLOBAL_CLK,
  mulBuffer,
  addBuffer,
  storeBuffer,
  summary,
  stalledBuffer,
  changedBuffers,
  setRegisterFile,
  setMulBuffer,
  setAddBuffer,
  setStoreBuffer,
  setSummary,
  setStalledBuffer,
  setChangedBuffers
) => {
  const updateBufferState = (bufferName) => {
    setChangedBuffers((prev) => {
      // Add bufferName to state array if not already present
      if (!prev.includes(bufferName)) {
        return [...prev, bufferName];
      }
      return prev; // Don't add if already exists
    });
  };
  //arrayOfInstructionTags ==> loop on (summary) and check for each record if anything after ... && writeBack === -1)
  //-----------//
  //if true ==> add the summary.location to the arrayOfInstructionTags
  //else ==> do nothing

  // TESTING //

  //   console.log(`mulBuffer in WritebackComponent: ${JSON.stringify(mulBuffer)}`);
  //   console.log(`addBuffer in WritebackComponent: ${JSON.stringify(addBuffer)}`);
  //   console.log(`SUMMARY in WritebackComponent: ${JSON.stringify(summary)}`);

  //         //

  //GLOBAL_CLK > parseInt(record?.executionComplete.split("...")[1]) ==> cannot writeback in same cycle as complete execution
  const arrayOfInstructionTags =
    summary?.length &&
    summary
      .filter((record) => {
        const executionComplete = record?.executionComplete;

        // console.log(GLOBAL_CLK);
        // console.log(
        //   `executionComplete: ${
        //     executionComplete === "" ? "Empty" : executionComplete
        //   }`
        // );
        // console.log("-----------");

        return (
          executionComplete &&
          executionComplete.includes("...") &&
          record?.executionComplete.split("...")[0] &&
          record?.executionComplete.split("...")[1] &&
          record?.writeBack === -1 &&
          GLOBAL_CLK > parseInt(record?.executionComplete.split("...")[1])
        );
      })
      .map((filteredRecord) => filteredRecord?.location);

  if (!arrayOfInstructionTags?.length)
    return console.log("nothing ready for writeback");

  const instructionTag = instructionToWriteBack(
    arrayOfInstructionTags,
    mulBuffer,
    addBuffer,
    storeBuffer
  );

  //console.log(`instructionTag: ${JSON.stringify(instructionTag)}`);

  const tagLetter = instructionTag?.tag[0];

  //console.log(`tagLetter: ${tagLetter}`);

  //get operation, register 1 and 2 in case of MUL / DIV / ADD / SUB
  //get operation and address in case of L.D / L.S
  let newValue;
  switch (tagLetter) {
    case "M":
      // console.log(
      //   `mulBuffer in WritebackComponent: ${JSON.stringify(mulBuffer)}`
      // );
      // console.log(`SUMMARY in WritebackComponent: ${JSON.stringify(summary)}`);

      const indexInBuffer = parseInt(instructionTag?.tag.slice(1)) - 1;
      const operation = mulBuffer[indexInBuffer]?.op === "MUL.D" ? "*" : "/";
      const indexInRegisterFile = mulBuffer[indexInBuffer]?.indexInRegisterFile;
      const indexInSummary = mulBuffer[indexInBuffer]?.indexInSummary;
      newValue = `${mulBuffer[indexInBuffer]?.vj}${operation}${mulBuffer[indexInBuffer]?.vk}`;

      setMulBuffer((prevBuffer) => {
        const updatedBuffer = prevBuffer.map((record, index) => {
          if (record?.qj === instructionTag?.tag)
            return { ...record, vj: newValue, qj: "" };
          if (record?.qk === instructionTag?.tag)
            return { ...record, vk: newValue, qk: "" };
          if (index === indexInBuffer) return new OperationBuffer();
          return record;
        });

        if (JSON.stringify(prevBuffer) !== JSON.stringify(updatedBuffer)) {
          console.log("here");
          updateBufferState("mulBuffer");
        }

        return updatedBuffer;
      });
      setAddBuffer((prevBuffer) => {
        const updatedBuffer = prevBuffer.map((record) => {
          if (record?.qj === instructionTag?.tag)
            return { ...record, vj: newValue, qj: "" };
          if (record?.qk === instructionTag?.tag)
            return { ...record, vk: newValue, qk: "" };
          return record;
        });

        if (JSON.stringify(prevBuffer) !== JSON.stringify(updatedBuffer)) {
          updateBufferState("addBuffer");
        }

        return updatedBuffer;
      });
      setStoreBuffer((prevBuffer) => {
        const updatedBuffer = prevBuffer.map((record) => {
          return record?.q === instructionTag?.tag
            ? { ...record, v: newValue, q: "" }
            : record;
        });

        if (JSON.stringify(prevBuffer) !== JSON.stringify(updatedBuffer)) {
          updateBufferState("storeBuffer");
        }

        return updatedBuffer;
      });
      setRegisterFile((prevRegisterFile) =>
        prevRegisterFile.map((record, index) => {
          if (index === indexInRegisterFile) {
            if (record?.qi === instructionTag?.tag)
              return { ...record, value: newValue, qi: "0" };
            return { ...record, value: newValue };
          }
          return record;
        })
      );
      //location set to "" since removed from buffers (completed)
      setSummary((prevSummary) =>
        prevSummary.map((record, index) => {
          if (index === indexInSummary)
            return { ...record, writeBack: GLOBAL_CLK, location: "" };
          return record;
        })
      );

      if (stalledBuffer && changedBuffers.includes(stalledBuffer)) {
        console.log(
          "handle here issuing again when space freeed, IN SAME CLK cycle"
        );
        //the changedBuffers only contains the right data a cycle later, fix
      }

    case "A":
      // console.log(
      //   `addBuffer in WritebackComponent: ${JSON.stringify(addBuffer)}`
      // );
      // console.log(`SUMMARY in WritebackComponent: ${JSON.stringify(summary)}`);
      break;
    case "L":
      const type = tagLetter[2];
      if (type === "S") {
        console.log("load-single");
      } else if (type === "D") {
        console.log("load-double");
      }
      break;
  }
};

export default WritebackQuestion;
