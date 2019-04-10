const { parentPort, threadId } = require("worker_threads");
const hummus = require("hummus");
const fs = require("fs");

parentPort.on("message", async () => {
  try {
    console.log(`${threadId} starting work`);
    const buffer = await fs.promises.readFile("./dummy.pdf");
    console.log(`${threadId} read pdf`);
    const pdfWriter = hummus.createWriter(`./output_${threadId}.${Math.random()
        .toString(36)
        .substr(2)}.pdf`);
    console.log(`${threadId} writer created`);
    const buffers = [buffer, buffer];
    for (const buffer of buffers) {
        console.log(`${threadId} appending page`);
      pdfWriter.appendPDFPagesFromPDF(new hummus.PDFRStreamForBuffer(buffer));
    }
    pdfWriter.end();
    console.log(`${threadId} done`);
    parentPort.postMessage("done");
  } catch (e) {
    console.log(e);
    parentPort.postMessage("error");
  }
});
