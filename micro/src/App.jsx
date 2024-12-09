import { useEffect, useState } from "react";

import FetchFileContent from "./data/fileReader";

import RenderTable from "./components/RenderTable";

import LoadBuffer from "./buffers/loadBuffer";
import StoreBuffer from "./buffers/storeBuffer";
import OperationBuffer from "./buffers/operationBuffer";

import IssueQuestion from "./helpers/issueQuestion";
import ExecutionQuestion from "./helpers/executeQuestion";
import WritebackQuestion from "./helpers/writebackQuestion";

import RegisterFile from "./table/registerFile";
import IntegerRegisterFile from "./table/integerRegisterFile";
import Memory from "./table/memory";
import Cache from "./table/cache";

const App = () => {
  const memMiss = 3;
  const memHit = 2;
  const addHit = 4;
  const subHit = 4;
  const mulHit = 6;
  const divHit = 6;

  const cacheSize = 48;
  const blockSize = 16;
  const numberOfBlocks = parseInt(48 / 16); //this is not needed if they are always assumed to be divisible

  const fileContentBefore = FetchFileContent();
  //console.log(`fileContent: ${fileContent}`);

  let objectLoopNameAndIndex = [];
  let fileContent = [];
  for (const line in fileContentBefore) {
    //console.log(`line: ${fileContentBefore[line]}`);
    const arrayOfLine = fileContentBefore[line].split(" ");
    const firstElement = arrayOfLine[0];
    const firstElementLength = firstElement.length;
    //console.log(`firstElementLength: ${firstElement.length}`);
    //console.log(`arrayOfLine: ${arrayOfLine}`);
    if (firstElement.endsWith(":")) {
      objectLoopNameAndIndex = [
        ...objectLoopNameAndIndex,
        { name: firstElement.slice(0, firstElement.length - 1), index: line },
      ];
      fileContent = [
        ...fileContent,
        fileContentBefore[line].slice(
          firstElementLength + 1,
          fileContentBefore[line].length
        ),
      ];
      // console.log(
      //   `fileContentBefore[line].slice(0, firstElementLength): ${fileContentBefore[
      //     line
      //   ].slice(firstElementLength + 1, fileContentBefore[line].length)}`
      // );
    } else fileContent = [...fileContent, fileContentBefore[line]];
  }

  //console.log(`fileContent: ${fileContent}`);

  const [GLOBAL_CLK, SET_GLOBAL_CLK] = useState(0);
  const [GLOBAL_ITERATION, SET_GLOBAL_ITERATION] = useState(0);
  const [LINE_TXT, SET_LINE_TXT] = useState(-1);

  const [mulBuffer, setMulBuffer] = useState([]);
  const [addBuffer, setAddBuffer] = useState([]);
  const [loadBuffer, setLoadBuffer] = useState([]);
  const [storeBuffer, setStoreBuffer] = useState([]);
  const [registerFile, setRegisterFile] = useState([]);
  const [integerRegisterFile, setIntegerRegisterFile] = useState([]);
  const [summary, setSummary] = useState([]);
  const [memory, setMemory] = useState([]);
  const [cache, setCache] = useState([]);

  const [isExecuteStateUpdated, setIsExecuteStateUpdated] = useState(false);
  const [isWritebackStateUpdated, setIsWritebackStateUpdated] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [missDone, setMissDone] = useState(false);

  const integerToBinary = (integer) => {
    if (integer < 0 || integer > 255) {
      throw new Error("Input must be between 0 and 255 for 8-bit binary.");
    }

    let binary = "";
    while (integer > 0) {
      binary = `${integer % 2}${binary}`;
      integer = Math.floor(integer / 2);
    }

    return binary.padStart(8, "0");
  };

  const handleExecuteStateUpdate = () => {
    setIsExecuteStateUpdated(true);
  };

  const handleWritebackStateUpdate = () => {
    setIsWritebackStateUpdated(true);
  };

  useEffect(() => {
    //user input (sizes)
    const initialMulBuffer = [];
    for (let i = 0; i < 2; i++) {
      initialMulBuffer.push(new OperationBuffer());
    }
    setMulBuffer(initialMulBuffer);

    const initialAddBuffer = [];
    for (let i = 0; i < 3; i++) {
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
    for (let i = 0; i < 12; i++) {
      let register = `F${i}`;
      initialRegisterFile.push(new RegisterFile(register, `${i}`, "0"));
    }
    setRegisterFile(initialRegisterFile);

    const initialIntegerRegisterFile = [];
    for (let i = 0; i < 12; i++) {
      let register = `R${i}`;
      initialIntegerRegisterFile.push(
        new IntegerRegisterFile(register, `${i}`)
      );
    }
    setIntegerRegisterFile(initialIntegerRegisterFile);

    const initialMemory = [];
    for (let i = 0; i < 100; i++) {
      let address = i;
      let value = integerToBinary(i);
      initialMemory.push(new Memory(address, value));
    }
    setMemory(initialMemory);
    //console.log(JSON.stringify(initialMemory));

    const initialCache = [];
    for (let i = 0; i < cacheSize; i++) initialCache.push(new Cache(i, -1));
    setCache(initialCache);
    //console.log(JSON.stringify(initialCache));
  }, []);

  useEffect(() => {
    if (fileContent?.length > 0 && LINE_TXT < fileContent?.length) {
      IssueQuestion(
        fileContent,
        objectLoopNameAndIndex,
        LINE_TXT,
        GLOBAL_CLK,
        GLOBAL_ITERATION,
        registerFile,
        integerRegisterFile,
        mulBuffer,
        addBuffer,
        loadBuffer,
        storeBuffer,
        summary,
        setMulBuffer,
        setAddBuffer,
        setLoadBuffer,
        setStoreBuffer,
        SET_LINE_TXT,
        setSummary,
        setRegisterFile,
        setIntegerRegisterFile,
        SET_GLOBAL_ITERATION
      );

      handleExecuteStateUpdate();
    } else if (GLOBAL_CLK !== 0) setIsExecuteStateUpdated(true);
  }, [GLOBAL_CLK]);

  useEffect(() => {
    if (isExecuteStateUpdated) {
      ExecutionQuestion(
        summary,
        cache,
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
      );

      handleWritebackStateUpdate();
      setIsExecuteStateUpdated(false);
    }
  }, [isExecuteStateUpdated, GLOBAL_CLK]);

  useEffect(() => {
    if (isWritebackStateUpdated) {
      //(`loadBuffer -1: ${JSON.stringify(loadBuffer)}`);
      WritebackQuestion(
        GLOBAL_CLK,
        mulBuffer,
        addBuffer,
        storeBuffer,
        loadBuffer,
        summary,
        setRegisterFile,
        setMulBuffer,
        setAddBuffer,
        setStoreBuffer,
        setLoadBuffer,
        setSummary
      );

      setIsWritebackStateUpdated(false);
    }
  }, [isWritebackStateUpdated, GLOBAL_CLK]);

  const checkIfDone = () => {
    const summaryFilteredByWriteback = summary.filter(
      (record) => record.writeBack !== -1
    );
    if (
      summaryFilteredByWriteback.length === summary.length &&
      GLOBAL_CLK !== 0
    ) {
      setIsDone(true);
      SET_GLOBAL_CLK((prev) => prev - 1);
    }
  };

  const handleOnNextClockCycleClick = () => {
    SET_GLOBAL_CLK((prev) => prev + 1);
    checkIfDone();
    if (fileContent?.length > LINE_TXT) SET_LINE_TXT((prev) => prev + 1);
    console.log(`GLOBAL_ITERATION: ${GLOBAL_ITERATION}`);
  };

  // console.log(
  //   "================================================================"
  // );
  // console.log(mulBuffer);
  // console.log(LINE_TXT);
  // console.log(
  //   "================================================================"
  // );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Buffer Status</h1>
      {RenderTable("Multiply Buffer", mulBuffer, [
        "busy",
        "op",
        "vj",
        "vk",
        "qj",
        "qk",
        "a",
      ])}
      {RenderTable("Add Buffer", addBuffer, [
        "busy",
        "op",
        "vj",
        "vk",
        "qj",
        "qk",
        "a",
      ])}
      {RenderTable("Load Buffer", loadBuffer, ["busy", "address"])}
      {RenderTable("Store Buffer", storeBuffer, ["busy", "address", "v", "q"])}
      {RenderTable("FP Register File", registerFile, [
        "register",
        "value",
        "qi",
      ])}
      {RenderTable("Integer Register File", integerRegisterFile, [
        "register",
        "value",
      ])}
      {RenderTable("Memory", memory, ["address", "value"])}
      {RenderTable("Cache", cache, ["address", "which", "value"])}
      {RenderTable("Summary", summary, [
        "iteration",
        "instruction",
        "j",
        "k",
        "issue",
        "executionComplete",
        "writeBack",
      ])}

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

      {isDone && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96 text-center">
            <h2 className="text-2xl font-bold text-green-600">Done!</h2>
            <p className="text-gray-700 my-4">
              All operations have been completed successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
