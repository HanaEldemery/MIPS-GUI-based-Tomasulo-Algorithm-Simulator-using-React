import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import FetchFileContent from "../data/fileReader";

import RenderTable from "./RenderTable";

import LoadBuffer from "../buffers/loadBuffer";
import StoreBuffer from "../buffers/storeBuffer";
import OperationBuffer from "../buffers/operationBuffer";

import IssueQuestion from "../helpers/issueQuestion";
import ExecutionQuestion from "../helpers/executeQuestion";
import WritebackQuestion from "../helpers/writebackQuestion";

import RegisterFile from "../table/registerFile";
import IntegerRegisterFile from "../table/integerRegisterFile";
import Memory from "../table/memory";
import Cache from "../table/cache";

function parseInstruction(instruction) {
  instruction = instruction.trim();

  let label = null;
  if (instruction.includes(":")) {
    const parts = instruction.split(":", 2);
    label = parts[0].trim();
    instruction = parts[1].trim();
  }

  const match = instruction.match(/^(\S+)\s+(.*)$/);

  if (!match) {
    throw new Error("Invalid instruction format");
  }

  const operation = match[1];
  const operandsString = match[2];

  const operandList = operandsString
    .split(",")
    .map((operand) => operand.trim())
    .filter((operand) => operand.length > 0);

  const result = label
    ? [label + ":", operation, ...operandList]
    : [operation, ...operandList];

  return result;
}

const ToRouteTo = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const memMiss = parseInt(queryParams.get("memMiss"));
  const memHit = parseInt(queryParams.get("memHit"));
  const addHit = parseInt(queryParams.get("addHit"));
  const subHit = parseInt(queryParams.get("subHit"));
  const integerAddHit = parseInt(queryParams.get("integerAddHit"));
  const integerSubHit = parseInt(queryParams.get("integerSubHit"));
  const integerBranchHit = parseInt(queryParams.get("integerBranchHit"));
  const mulHit = parseInt(queryParams.get("mulHit"));
  const divHit = parseInt(queryParams.get("divHit"));
  const addBufferSize = parseInt(queryParams.get("addBufferSize"));
  const mulBufferSize = parseInt(queryParams.get("mulBufferSize"));
  const loadBufferSize = parseInt(queryParams.get("loadBufferSize"));
  const storeBufferSize = parseInt(queryParams.get("storeBufferSize"));
  const cacheSize = parseInt(queryParams.get("cacheSize"));
  const memSize = parseInt(queryParams.get("memSize"));
  const blockSize = parseInt(queryParams.get("blockSize"));

  // const memMiss = 7;
  // const memHit = 2;
  // const addHit = 6;
  // const subHit = 6;
  // const integerAddHit = 2;
  // const integerSubHit = 1;
  // const integerBranchHit = 3;
  // const mulHit = 6;
  // const divHit = 6;

  // const [memMiss, setMemMiss] = useState(null);
  // const [memHit, setMemHit] = useState(null);
  // const [addHit, setAddHit] = useState(null);
  // const [subHit, setSubHit] = useState(null);
  // const [integerAddHit, setIntegerAddHit] = useState(null);
  // const [integerSubHit, setIntegerSubHit] = useState(null);
  // const [integerBranchHit, setIntegerBranchHit] = useState(null);
  // const [mulHit, setMulHit] = useState(null);
  // const [divHit, setDivHit] = useState(null);

  // const addBufferSize = 3;
  // const mulBufferSize = 2;
  // const loadBufferSize = 2;
  // const storeBufferSize = 2;
  // const cacheSize = 48;
  // const memSize = 200;
  // const blockSize = 16;
  // const [addBufferSize, setAddBufferSize] = useState(0);
  // const [mulBufferSize, setMulBufferSize] = useState(0);
  // const [loadBufferSize, setLoadBufferSize] = useState(0);
  // const [storeBufferSize, setStoreBufferSize] = useState(0);
  // const [cacheSize, setCacheSize] = useState(0);
  // const [memSize, setMemSize] = useState(0);
  // const [blockSize, setBlockSize] = useState(0);
  const integerRegisterFileSize = 32;
  const fpRegisterFileSize = 32;

  // useEffect(() => {
  //   if (
  //     memMiss === null ||
  //     memHit === null ||
  //     addHit === null ||
  //     subHit === null ||
  //     integerAddHit === null ||
  //     integerSubHit === null ||
  //     integerBranchHit === null ||
  //     mulHit === null ||
  //     divHit === null
  //   ) {
  //     setMemMiss(parseInt(prompt("Enter value for memMiss:", 3), 10));
  //     setMemHit(parseInt(prompt("Enter value for memHit:", 2), 10));
  //     setAddHit(parseInt(prompt("Enter value for addHit:", 4), 10));
  //     setSubHit(parseInt(prompt("Enter value for subHit:", 9), 10));
  //     setIntegerAddHit(
  //       parseInt(prompt("Enter value for integerAddHit:", 2), 10)
  //     );
  //     setIntegerSubHit(
  //       parseInt(prompt("Enter value for integerSubHit:", 1), 10)
  //     );
  //     setIntegerBranchHit(
  //       parseInt(prompt("Enter value for integerBranchHit:", 3), 10)
  //     );
  //     setMulHit(parseInt(prompt("Enter value for mulHit:", 6), 10));
  //     setDivHit(parseInt(prompt("Enter value for divHit:", 6), 10));
  //   }
  // }, [
  //   memMiss,
  //   memHit,
  //   addHit,
  //   subHit,
  //   integerAddHit,
  //   integerSubHit,
  //   integerBranchHit,
  //   mulHit,
  //   divHit,
  // ]);

  const fileContentBefore = FetchFileContent();
  //console.log(`fileContent: ${fileContent}`);

  let objectLoopNameAndIndex = [];
  let fileContent = [];
  for (const line in fileContentBefore) {
    //console.log(`line: ${fileContentBefore[line]}`);

    //const arrayOfLine = fileContentBefore[line].split(",");
    const arrayOfLine = parseInstruction(fileContentBefore[line]);
    //console.log(`arrayOfLine: ${Array.isArray(arrayOfLine)}`);
    //console.log(`arrayOfLine: [${arrayOfLine}]`);

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
          firstElementLength /* + 1*/,
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
  const [branchBuffer, setBranchBuffer] = useState([]);
  const [registerFile, setRegisterFile] = useState([]);
  const [integerRegisterFile, setIntegerRegisterFile] = useState([]);
  const [summary, setSummary] = useState([]);
  const [memory, setMemory] = useState([]);
  const [cache, setCache] = useState([]);

  const [isExecuteStateUpdated, setIsExecuteStateUpdated] = useState(false);
  const [isWritebackStateUpdated, setIsWritebackStateUpdated] = useState(false);
  const [STALLING, SET_STALLING] = useState(false);
  const [isDone, setIsDone] = useState(false);

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
    if (
      mulBufferSize > 0 &&
      addBufferSize > 0 &&
      loadBufferSize > 0 &&
      storeBufferSize > 0 &&
      memSize > 0 &&
      cacheSize > 0
    ) {
      //user input (sizes)
      const initialMulBuffer = [];
      for (let i = 0; i < mulBufferSize; i++) {
        initialMulBuffer.push(new OperationBuffer());
      }
      setMulBuffer(initialMulBuffer);

      const initialAddBuffer = [];
      for (let i = 0; i < addBufferSize; i++) {
        initialAddBuffer.push(new OperationBuffer());
      }
      setAddBuffer(initialAddBuffer);

      setBranchBuffer([new OperationBuffer()]);

      const initialLoadBuffer = [];
      for (let i = 0; i < loadBufferSize; i++) {
        initialLoadBuffer.push(new LoadBuffer());
      }
      setLoadBuffer(initialLoadBuffer);

      const initialStoreBuffer = [];
      for (let i = 0; i < storeBufferSize; i++) {
        initialStoreBuffer.push(new StoreBuffer());
      }
      setStoreBuffer(initialStoreBuffer);

      const initialRegisterFile = [];
      for (let i = 0; i < 32; i++) {
        let register = `F${i}`;
        initialRegisterFile.push(new RegisterFile(register, `${i}`, "0"));
      }
      setRegisterFile(initialRegisterFile);

      const initialIntegerRegisterFile = [];
      for (let i = 0; i < 32; i++) {
        let register = `R${i}`;
        initialIntegerRegisterFile.push(
          new IntegerRegisterFile(register, `${i}`, "0")
        );
      }
      setIntegerRegisterFile(initialIntegerRegisterFile);

      const initialMemory = [];
      for (let i = 0; i < memSize; i++) {
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
    }
  }, [
    mulBufferSize,
    addBufferSize,
    loadBufferSize,
    storeBufferSize,
    memSize,
    cacheSize,
  ]);

  useEffect(() => {
    //console.log(`fileContent: ${fileContent}`);
    if (
      fileContent?.length > 0 &&
      LINE_TXT < fileContent?.length &&
      !STALLING
    ) {
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
        branchBuffer,
        summary,
        setMulBuffer,
        setAddBuffer,
        setLoadBuffer,
        setStoreBuffer,
        setBranchBuffer,
        SET_LINE_TXT,
        setSummary,
        setRegisterFile,
        setIntegerRegisterFile,
        SET_GLOBAL_ITERATION,
        SET_STALLING
      );

      handleExecuteStateUpdate();
    } else if (GLOBAL_CLK !== 0) setIsExecuteStateUpdated(true);
  }, [GLOBAL_CLK]);

  useEffect(() => {
    if (isExecuteStateUpdated) {
      ExecutionQuestion(
        summary,
        cache,
        memory,
        cacheSize,
        blockSize,
        addBuffer,
        mulBuffer,
        storeBuffer,
        branchBuffer,
        setCache,
        setSummary,
        memMiss,
        memHit,
        addHit,
        subHit,
        integerAddHit,
        integerSubHit,
        integerBranchHit,
        mulHit,
        divHit,
        GLOBAL_CLK,
        SET_LINE_TXT,
        objectLoopNameAndIndex,
        setBranchBuffer,
        integerRegisterFile,
        SET_GLOBAL_ITERATION,
        SET_STALLING
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
        branchBuffer,
        loadBuffer,
        registerFile,
        integerRegisterFile,
        summary,
        setRegisterFile,
        setIntegerRegisterFile,
        setMulBuffer,
        setAddBuffer,
        setStoreBuffer,
        setLoadBuffer,
        setSummary,
        SET_STALLING,
        SET_LINE_TXT,
        SET_GLOBAL_ITERATION,
        objectLoopNameAndIndex,
        setBranchBuffer,
        cache,
        cacheSize,
        memory,
        setMemory,
        setCache
      );

      setIsWritebackStateUpdated(false);
    }
  }, [isWritebackStateUpdated, GLOBAL_CLK]);

  //console.log(`STALLING: ${STALLING ? "true" : "false"}`);

  const checkIfDone = () => {
    const summaryFilteredByWriteback = summary.filter(
      (record) => record.writeBack !== -1
    );
    if (
      LINE_TXT >= fileContent.length - 1 &&
      summaryFilteredByWriteback.length === summary.length &&
      GLOBAL_CLK !== 0 &&
      !STALLING
    ) {
      setIsDone(true);
      SET_GLOBAL_CLK((prev) => prev - 1);
    }
  };

  const handleOnNextClockCycleClick = () => {
    SET_GLOBAL_CLK((prev) => prev + 1);
    checkIfDone();
    if (fileContent?.length > LINE_TXT && !STALLING)
      SET_LINE_TXT((prev) => prev + 1);
    //console.log(`GLOBAL_ITERATION: ${GLOBAL_ITERATION}`);
  };

  //console.log(
  //  "================================================================"
  //);
  //console.log(LINE_TXT);
  //console.log(
  //  "================================================================"
  //);

  return (
    <div className="p-6">
      <div className="py-20">
        {RenderTable("Branch Buffer", branchBuffer, [
          "busy",
          "op",
          "vj",
          "vk",
          "qj",
          "qk",
          "a",
        ])}
        <div className="grid grid-cols-2 gap-4">
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
        </div>
        <div className="grid grid-cols-2 gap-4">
          {RenderTable("Load Buffer", loadBuffer, ["busy", "address"])}
          {RenderTable("Store Buffer", storeBuffer, [
            "busy",
            "address",
            "v",
            "q",
          ])}
        </div>
        {RenderTable("Summary", summary, [
          "iteration",
          "instruction",
          "j",
          "k",
          "issue",
          "executionComplete",
          "writeBack",
          "missMiss",
        ])}
        <div className="grid grid-cols-2 gap-4">
          {RenderTable("FP Register File", registerFile, [
            "register",
            "value",
            "qi",
          ])}
          {RenderTable("Integer Register File", integerRegisterFile, [
            "register",
            "value",
            "qi",
          ])}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {RenderTable("Cache", cache, ["address", "which", "value"])}
          {RenderTable("Memory", memory, ["address", "value"])}
        </div>
      </div>

      <div className="fixed top-0 w-full flex items-center justify-between p-4 bg-white shadow-lg z-50">
        <button
          onClick={handleOnNextClockCycleClick}
          className="py-2 px-4 text-lg bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition duration-300"
        >
          Next Clockcycle
        </button>
        <div className="flex flex-col text-sm text-gray-600 mx-4 space-y-1">
          <span className="text-sm text-gray-600 mx-4">
            <span>memMiss: {memMiss}</span> | <span>memHit: {memHit}</span> |{" "}
            <span>addHit: {addHit}</span> | <span>subHit: {subHit}</span> |{" "}
            <span>integerAddHit: {integerAddHit}</span> |{" "}
            <span>integerSubHit: {integerSubHit}</span> |{" "}
            <span>integerBranchHit: {integerBranchHit}</span> |{" "}
            <span>mulHit: {mulHit}</span> | <span>divHit: {divHit}</span>
          </span>
          <span className="text-sm text-gray-600 mx-4">
            <span>addBuffer size: {addBufferSize}</span> |{" "}
            <span>mulBuffer size: {mulBufferSize}</span> |{" "}
            <span>loadBuffer size: {loadBufferSize}</span> |{" "}
            <span>storeBuffer size: {storeBufferSize}</span> |{" "}
            <span>branchBuffer size: 1</span> |{" "}
            <span>FP register size: 32</span> |{" "}
            <span>integer register size: 32</span> |{" "}
            <span>cache size: {cacheSize}</span> |{" "}
            <span>memory size: {memSize}</span> |{" "}
            <span>block size: {blockSize}</span>
          </span>
        </div>

        <span className="mr-16 text-xl font-semibold text-gray-800">
          Current Clock Cycle:{" "}
          <span className="text-purple-500">{GLOBAL_CLK}</span>
        </span>
      </div>

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

export default ToRouteTo;
