/* eslint-disable */
import { type NextApiRequest, type NextApiResponse } from "next";
import puppeteer, { type PDFOptions } from "puppeteer";
import { env } from "@/env";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const status = req.query.status?.toString();
  const typeId = req.query.typeId?.toString();
  const year = req.query.year?.toString();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath:
      process.platform === "win32"
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : process.platform === "linux"
          ? "/usr/bin/chromium-browser"
          : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: [
      "--no-sandbox",
      "--headless",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  await page.setViewport({ width: 1000, height: 0 });

  await page.goto(`${process.env.NEXTAUTH_URL}/report/project/${status}/${typeId}/${year}`, {
    waitUntil: "networkidle2",
  });

  await page.waitForNetworkIdle({ idleTime: 1000 });

  // await page.waitForSelector("#content-loaded", { timeout: 10000 });

  const pdfOption: PDFOptions = {
    printBackground: true,
    format: "A4",
    landscape: false,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:12px; text-align:center; width:100%;></div>`,
    footerTemplate: `<div style="font-size:12px; text-align:center; width:100%;">
      พิมพ์เมื่อ ${new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })}
    </div>`,
    margin: {
      top: "40px",
      bottom: "40px",
    },
    // margin: { top: '5mm', right: '5mm', bottom: '20mm', left: '5mm' }
  };

  const pdf = await page.pdf(pdfOption);
  const buffer = Buffer.from(pdf);

  await page.close();
  await browser.close();

  res.setHeader(
    "Content-Disposition",
    `inline; filename="project_report.pdf"`,
  );
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", buffer.length);
  res.send(buffer);
};

export default handler;
