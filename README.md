# MIPS GUI-based Tomasulo Algorithm Simulator using React
Developed a GUI-based simulator for the Tomasulo algorithm, designed to simulate the execution of MIPS assembly instructions cycle by cycle. The simulator allowed users to input MIPS instructions via text files and displayed the real-time status of reservation stations, buffers, register files, caches, and queues.
The simulator handled RAW, WAR, and WAW hazards, supporting ALU operations (floating-point and integer), loads, stores, and branches. Users could configure cache size, block size, latency settings, and reservation station sizes, enabling dynamic testing of different execution scenarios. Cache misses were incorporated, with users able to define hit latency and penalties.
Additionally, logic to handle simultaneous writes on the bus was implemented also ensuring that no branch prediction was used. The project was thoroughly tested.

