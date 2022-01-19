const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const mediaLocation = "./public/images";

const captureScreenshot = async (link, device) => {
  console.log("Inside screenshoot");
  const domainName = link.slice(link.indexOf(".") + 1, link.lastIndexOf("."));
  const customDevices = {
    xl: {
      width: 1280,
      height: 600,
    },
    xxl: {
      width: 1536,
      height: 1000,
    },
  };
  const image = `${mediaLocation}/${domainName}_${device}_${Date.now()}.png`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000);
  if (customDevices.hasOwnProperty(device)) {
    await page.setViewport({
      width: customDevices[device].width,
      height: customDevices[device].height,
      deviceScaleFactor: 2,
    });
  } else {
    await page.emulate(puppeteer.devices[device]);
  }
  try {
    await page.goto(link, { waitUntil: "networkidle2" });
  } catch (e) {
    console.log(e);
  }
  await page.waitForTimeout(7000);
  await page.screenshot({
    path: `${image}`,
    fullPage: true,
  });

  await browser.close();
  return image;
};

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/mysnapshot", async (req, res) => {
  const { link, device } = req.body;
  console.log(req.body);
  let image = "";
  if (link !== undefined || link === "") {
    image = await captureScreenshot(link, device);
    const filename = path.basename(image);
    console.log(filename, "filename");
    res.setHeader("Content-disposition", "attachment; filename=" + filename);
    res.setHeader("content-type", "image/png");
    res.download(image, filename);
  } else {
    res.send({ error: "Please provide a valid url" });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
