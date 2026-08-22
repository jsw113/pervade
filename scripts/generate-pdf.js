const puppeteer = require("puppeteer-core");
const path = require("path");
const fs = require("fs");

async function generatePDF() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const htmlPath = path.resolve(__dirname, "..", "public", "manual.html");
  const outputPath = path.resolve(__dirname, "..", "public", "PERVADE_Admin_ERP_Manual.pdf");

  console.log("Launching Edge at:", edgePath);
  console.log("Reading HTML from:", htmlPath);

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("file://" + htmlPath, { waitUntil: "networkidle0" });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "15mm",
      right: "12mm",
      bottom: "15mm",
      left: "12mm",
    },
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`PDF generated successfully: ${outputPath} (${stats.size} bytes)`);
}

generatePDF().catch(console.error);
