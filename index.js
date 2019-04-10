const { Worker } = require("worker_threads");

const workerA = new Worker("./worker.js");
const workerB = new Worker("./worker.js");

/**
 * Test case 1: write files sequentially using a single worker
 * This test is flaky. Sometimes this works, sometimes it instantly dies with the following error:
 *
 * #
 * # Fatal error in , line 0
 * # Check failed: map->instance_type() == JS_REGEXP_TYPE || map->instance_type() == JS_OBJECT_TYPE || map->instance_type() == JS_ERROR_TYPE || map->instance_type() == JS_ARRAY_TYPE || map->instance_type() == JS_API_OBJECT_TYPE || map->instance_type() == WASM_GLOBAL_TYPE || map->instance_type() == WASM_INSTANCE_TYPE || map->instance_type() == WASM_MEMORY_TYPE || map->instance_type() == WASM_MODULE_TYPE || map->instance_type() == WASM_TABLE_TYPE || map->instance_type() == JS_SPECIAL_API_OBJECT_TYPE.
 * #
 * #
 * #
 * #FailureMessage Object: 0x70000e2a7f60Illegal instruction: 4
 */
function writeSingle(numFiles) {
  workerA.once("message", () => {
    const remaining = numFiles - 1;
    console.log(`Wrote file, ${remaining} files remaining`);
    if (remaining > 0) {
      writeSingle(remaining);
    } else {
      process.exit(0);
    }
  });
  workerA.postMessage("");
}

// writeSingle(5);

/**
 * Test case 2: write two files at the same time.
 * This test is flaky. Sometimes this works, sometimes it throws the following error:
 *
 * #
 * # Fatal error in , line 0
 * # Check failed: map->instance_type() == JS_REGEXP_TYPE || map->instance_type() == JS_OBJECT_TYPE || map->instance_type() == JS_ERROR_TYPE || map->instance_type() == JS_ARRAY_TYPE || map->instance_type() == JS_API_OBJECT_TYPE || map->instance_type() == WASM_GLOBAL_TYPE || map->instance_type() == WASM_INSTANCE_TYPE || map->instance_type() == WASM_MEMORY_TYPE || map->instance_type() == WASM_MODULE_TYPE || map->instance_type() == WASM_TABLE_TYPE || map->instance_type() == JS_SPECIAL_API_OBJECT_TYPE.
 * #
 * #
 * #
 * #FailureMessage Object: 0x70000e2a7f60Illegal instruction: 4
 * 
 * Additionally it is possible for this test to hang indefinitely. When this happens the console logs are as follows:
 * 
 * 2 starting work
 * 1 starting work
 * 1 read pdf
 * 2 read pdf
 * 1 writer created
 * 1 appending page
 * 1 appending page
 * 1 done
 * 
 * This suggests that the writer somehow never returns when it is being created
 */
function writeConcurrently() {
  let numFinished = 0;
  const callback = () => {
    numFinished++;
    if (numFinished === 2) {
      process.exit(0);
    }
  };
  workerA.once("message", callback);
  workerB.once("message", callback);

  workerA.postMessage("");
  workerB.postMessage("");
}

// writeConcurrently();
