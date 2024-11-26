import { useEffect } from "react";

import FetchFileContent from "./data/fileReader";
import SplitData from "./data/splitData";

import RegisterFile from "./table/registerFile";
import LoadBuffer from "./buffers/loadBuffer";
import StoreBuffer from "./buffers/storeBuffer";
import OperationBuffer from "./buffers/operationBuffer";

import Summary from "./table/summary";

let GLOBAL_CLK = 0;
let GLOBAL_ITERATION = 0;
let LINE_TXT = 0;
let SUMMARY = [];

const issueQuestion = (
  fileContent,
  mulBuffer,
  addBuffer,
  loadBuffer,
  storeBuffer,
  registerFile
) => {
  const instructionType = SplitData(fileContent[LINE_TXT])[0];

  let check;
  switch (instructionType) {
    case "MUL.D":
      check = "mul-buffer";
      break;
    case "DIV.D":
      check = "mul-buffer";
      break;
    case "ADD.D":
      check = "add-buffer";
      break;
    case "SUB.D":
      check = "add-buffer";
      break;
    case "L.S":
      check = "load-buffer";
      break;
    case "L.D":
      check = "load-buffer";
      break;
    case "S.S":
      check = "store-buffer";
      break;
    case "S.D":
      check = "store-buffer";
      break;
    case "ADDI":
      check = "int-add";
      break;
    case "SUBI":
      check = "int-add";
      break;
    case "LW":
      check = "int-load-word";
      break;
    case "LD":
      check = "int-load-double";
      break;
    case "SW":
      check = "int-store-word";
      break;
    case "SD":
      check = "int-store-double";
      break;
    case "BNEZ":
      check = "int-branch";
      break;
  }

  switch (check) {
    case "mul-buffer":
      //check if fthere's empty space in the mul buffer (done)
      //0 in the busy (done)
      //if yes issue (done)
      if (mulBuffer.some((record) => record.busy === 0)) {
        const index = mulBuffer.findIndex((record) => record.busy === 0);

        const splitData = SplitData(fileContent[LINE_TXT]);

        const registerOne = splitData[2];
        const registerTwo = splitData[3];

        const qOfRegisterOne = registerFile.find(
          (register) => register.register === `${registerOne}`
        )?.qi;
        const qOfRegisterTwo = registerFile.find(
          (register) => register.register === `${registerTwo}`
        )?.qi;

        let vj, vk, qj, qk;
        if (qOfRegisterOne === "0") {
          vj = registerOne;
          qj = 0;
        } else {
          vj = 0;
          qj = qOfRegisterOne;
        }
        if (qOfRegisterTwo === "0") {
          vk = registerTwo;
          qk = 0;
        } else {
          vk = 0;
          qk = qOfRegisterTwo;
        }

        if (index !== -1) {
          //write in the mul buffer (done)
          mulBuffer[index] = {
            ...mulBuffer[index],
            op: instructionType,
            vj: vj,
            vk: vk,
            qj: qj,
            qk: qk,
            busy: 1,
          };

          //write in summary and write issue with clk (done)
          SUMMARY.push(
            new Summary(
              GLOBAL_ITERATION,
              fileContent[LINE_TXT],
              registerOne,
              registerTwo,
              GLOBAL_CLK,
              "",
              -1
            )
          );

          //edit register file (done)
          const registerOutput = splitData[1];
          const indexRegisterInRegisterFile = registerFile.findIndex(
            (register) => register.register === registerOutput
          );

          if (indexRegisterInRegisterFile !== -1)
            registerFile[indexRegisterInRegisterFile].qi = `M${index + 1}`;

          console.log(`mulBuffer: ${JSON.stringify(mulBuffer)}`);
          console.log(`SUMMARY: ${JSON.stringify(SUMMARY)}`);
          console.log(`registerFile: ${JSON.stringify(registerFile)}`);
        }
      } else {
        console.log("NOT DONE YET HEREEEE!");
        //if no space RETURN (stall) (NOT DONE YET)
      }
      break;
    case "add-buffer":
      //check if fthere's empty space in the add buffer (done)
      //0 in the busy (done)
      //if yes issue (done)
      if (addBuffer.some((record) => record.busy === 0)) {
        const index = addBuffer.findIndex((record) => record.busy === 0);

        const splitData = SplitData(fileContent[LINE_TXT]);

        const registerOne = splitData[2];
        const registerTwo = splitData[3];

        const qOfRegisterOne = registerFile.find(
          (register) => register.register === `${registerOne}`
        )?.qi;
        const qOfRegisterTwo = registerFile.find(
          (register) => register.register === `${registerTwo}`
        )?.qi;

        let vj, vk, qj, qk;
        if (qOfRegisterOne === "0") {
          vj = registerOne;
          qj = 0;
        } else {
          vj = 0;
          qj = qOfRegisterOne;
        }
        if (qOfRegisterTwo === "0") {
          vk = registerTwo;
          qk = 0;
        } else {
          vk = 0;
          qk = qOfRegisterTwo;
        }

        if (index !== -1) {
          //write in the add buffer (done)
          addBuffer[index] = {
            ...addBuffer[index],
            op: instructionType,
            vj: vj,
            vk: vk,
            qj: qj,
            qk: qk,
            busy: 1,
          };

          //write in summary and write issue with clk (done)
          SUMMARY.push(
            new Summary(
              GLOBAL_ITERATION,
              fileContent[LINE_TXT],
              registerOne,
              registerTwo,
              GLOBAL_CLK,
              "",
              -1
            )
          );

          //edit register file (done)
          const registerOutput = splitData[1];
          const indexRegisterInRegisterFile = registerFile.findIndex(
            (register) => register.register === registerOutput
          );

          if (indexRegisterInRegisterFile !== -1)
            registerFile[indexRegisterInRegisterFile].qi = `A${index + 1}`;

          console.log(`addBuffer: ${JSON.stringify(addBuffer)}`);
          console.log(`SUMMARY: ${JSON.stringify(SUMMARY)}`);
          console.log(`registerFile: ${JSON.stringify(registerFile)}`);
        }
      } else {
        console.log("NOT DONE YET HEREEEE!");
        //if no space RETURN (stall) (NOT DONE YET)
      }
      break;
    case "load-buffer":
      break;
    case "store-buffer":
      break;
    case "int-add":
      break;
    case "int-load-word":
      break;
    case "int-load-double":
      break;
    case "int-store-word":
      break;
    case "int-store-double":
      break;
    case "int-branch":
      break;
  }

  //console.log(instructionType);
};

const startQuestion = () => {};

const endQuestion = () => {};

const writebackQuestion = () => {};

const App = () => {
  const fileContent = FetchFileContent();

  let mulBuffer = [];
  for (let i = 0; i < 2; i++) {
    mulBuffer.push(new OperationBuffer());
  }

  let addBuffer = [];
  for (let i = 0; i < 2; i++) {
    addBuffer.push(new OperationBuffer());
  }

  let loadBuffer = [];
  for (let i = 0; i < 3; i++) {
    loadBuffer.push(new LoadBuffer());
  }

  let storeBuffer = [];
  for (let i = 0; i < 2; i++) {
    storeBuffer.push(new StoreBuffer());
  }

  let registerFile = [];
  for (let i = 0; i < 10; i++) {
    let register = `F${i}`;
    registerFile.push(new RegisterFile(register, "0"));
  }

  useEffect(() => {
    if (fileContent.length > 0) {
      issueQuestion(
        fileContent,
        mulBuffer,
        addBuffer,
        loadBuffer,
        storeBuffer,
        registerFile
      );
    }
  }, [fileContent]);

  // const firstRow = new Summary(1, "ADD R1 R2 R3", "R2", "R3");
  // const secondRow = new Summary();

  // firstRow.iteration = 5;

  // const theRows = [firstRow, secondRow];
  //console.log(theLoadBuffer);

  return (
    <div>
      {/* {theRows.map((row, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          {Object.values(row).map((value, i) => (
            <span key={i}>{value} </span>
          ))}
        </div>
      ))} */}
      hi
    </div>
  );
};

export default App;
