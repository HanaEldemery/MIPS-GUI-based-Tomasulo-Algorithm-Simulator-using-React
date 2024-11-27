import { useEffect, useState } from "react";

import FetchFileContent from "./data/fileReader";
import SplitData from "./data/splitData";

import RegisterFile from "./table/registerFile";
import LoadBuffer from "./buffers/loadBuffer";
import StoreBuffer from "./buffers/storeBuffer";
import OperationBuffer from "./buffers/operationBuffer";

import Summary from "./table/summary";

const App = () => {
  const fileContent = FetchFileContent();

  const [GLOBAL_CLK, SET_GLOBAL_CLK] = useState(0);
  const [GLOBAL_ITERATION, SET_GLOBAL_ITERATION] = useState(0);
  const [LINE_TXT, SET_LINE_TXT] = useState(-1);

  const [mulBuffer, setMulBuffer] = useState([]);
  const [addBuffer, setAddBuffer] = useState([]);
  const [loadBuffer, setLoadBuffer] = useState([]);
  const [storeBuffer, setStoreBuffer] = useState([]);
  const [registerFile, setRegisterFile] = useState([]);
  const [summary, setSummary] = useState([]);

  const issueQuestion = () => {
    const instructionType = SplitData(fileContent[LINE_TXT])[0];

    let check;
    switch (instructionType) {
      case "MUL.D":
      case "DIV.D":
        check = "mul-buffer";
        break;
      case "ADD.D":
      case "SUB.D":
        check = "add-buffer";
        break;
      case "L.S":
      case "L.D":
        check = "load-buffer";
        break;
      case "S.S":
      case "S.D":
        check = "store-buffer";
        break;
      case "ADDI":
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
            const newMulBuffer = [...mulBuffer];
            newMulBuffer[index] = {
              ...newMulBuffer[index],
              op: instructionType,
              vj: vj,
              vk: vk,
              qj: qj,
              qk: qk,
              busy: 1,
            };
            setMulBuffer(newMulBuffer);

            //write in summary and write issue with clk (done)
            const newSummary = [
              ...summary,
              new Summary(
                GLOBAL_ITERATION,
                fileContent[LINE_TXT],
                registerOne,
                registerTwo,
                GLOBAL_CLK,
                "",
                -1
              ),
            ];
            setSummary(newSummary);

            //edit register file (done)
            const registerOutput = splitData[1];
            const newRegisterFile = [...registerFile];
            const indexRegisterInRegisterFile = newRegisterFile.findIndex(
              (register) => register.register === registerOutput
            );

            if (indexRegisterInRegisterFile !== -1)
              newRegisterFile[indexRegisterInRegisterFile].qi = `M${index + 1}`;
            setRegisterFile(newRegisterFile);

            console.log(`mulBuffer: ${JSON.stringify(newMulBuffer)}`);
            console.log(`SUMMARY: ${JSON.stringify(newSummary)}`);
            console.log(`registerFile: ${JSON.stringify(newRegisterFile)}`);
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
            const newAddBuffer = [...addBuffer];
            newAddBuffer[index] = {
              ...newAddBuffer[index],
              op: instructionType,
              vj: vj,
              vk: vk,
              qj: qj,
              qk: qk,
              busy: 1,
            };
            setAddBuffer(newAddBuffer);

            //write in summary and write issue with clk (done)
            const newSummary = [
              ...summary,
              new Summary(
                GLOBAL_ITERATION,
                fileContent[LINE_TXT],
                registerOne,
                registerTwo,
                GLOBAL_CLK,
                "",
                -1
              ),
            ];
            setSummary(newSummary);

            //edit register file (done)
            const registerOutput = splitData[1];
            const newRegisterFile = [...registerFile];
            const indexRegisterInRegisterFile = newRegisterFile.findIndex(
              (register) => register.register === registerOutput
            );

            if (indexRegisterInRegisterFile !== -1)
              newRegisterFile[indexRegisterInRegisterFile].qi = `A${index + 1}`;
            setRegisterFile(newRegisterFile);

            console.log(`addBuffer: ${JSON.stringify(newAddBuffer)}`);
            console.log(`SUMMARY: ${JSON.stringify(newSummary)}`);
            console.log(`registerFile: ${JSON.stringify(newRegisterFile)}`);
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

  useEffect(() => {
    const initialMulBuffer = [];
    for (let i = 0; i < 2; i++) {
      initialMulBuffer.push(new OperationBuffer());
    }
    setMulBuffer(initialMulBuffer);

    const initialAddBuffer = [];
    for (let i = 0; i < 2; i++) {
      initialAddBuffer.push(new OperationBuffer());
    }
    setAddBuffer(initialAddBuffer);

    const initialLoadBuffer = [];
    for (let i = 0; i < 3; i++) {
      initialLoadBuffer.push(new LoadBuffer());
    }
    setLoadBuffer(initialLoadBuffer);

    const initialStoreBuffer = [];
    for (let i = 0; i < 2; i++) {
      initialStoreBuffer.push(new StoreBuffer());
    }
    setStoreBuffer(initialStoreBuffer);

    const initialRegisterFile = [];
    for (let i = 0; i < 10; i++) {
      let register = `F${i}`;
      initialRegisterFile.push(new RegisterFile(register, "0"));
    }
    setRegisterFile(initialRegisterFile);
  }, []);

  useEffect(() => {
    if (fileContent?.length > 0 && LINE_TXT < fileContent?.length)
      issueQuestion();
    //add if to execute
    //add if to writeback
  }, [GLOBAL_CLK]);

  const handleOnNextClockCycleClick = () => {
    SET_GLOBAL_CLK((prev) => prev + 1);
    if (fileContent?.length > LINE_TXT) SET_LINE_TXT((prev) => prev + 1);
  };

  const renderTable = (title, buffer, headers) => {
    return (
      <div className="my-6">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="border border-gray-300 px-4 py-2 font-medium text-gray-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buffer.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100`}
                >
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="border border-gray-300 px-4 py-2 text-gray-600"
                    >
                      {item[header] === "" || item[header] === 0
                        ? "-"
                        : item[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Buffer Status</h1>
      {renderTable("Multiply Buffer", mulBuffer, [
        "busy",
        "op",
        "vj",
        "vk",
        "qj",
        "qk",
        "a",
      ])}
      {renderTable("Add Buffer", addBuffer, [
        "busy",
        "op",
        "vj",
        "vk",
        "qj",
        "qk",
        "a",
      ])}
      {renderTable("Load Buffer", loadBuffer, ["busy", "address"])}
      {renderTable("Store Buffer", storeBuffer, ["busy", "address", "v", "q"])}
      {renderTable("Register File", registerFile, ["register", "qi"])}

      <div className="my-4 text-center">
        <span className="text-xl font-semibold text-gray-800">
          Current Clock Cycle:{" "}
          <span className="text-blue-500">{GLOBAL_CLK}</span>
        </span>
      </div>

      <button
        onClick={handleOnNextClockCycleClick}
        className="w-full mt-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
      >
        Next Clockcycle
      </button>
    </div>
  );
};

export default App;
