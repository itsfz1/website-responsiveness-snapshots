const express = require("express")
const app = express()
app.use(express.json())
const PORT = process.env.PORT || 3000
const path = require("path")

app.use(express.static(path.join(__dirname, "public")))

const puppeteer = require("puppeteer")

const captureScreenshot = async (link, device) => {
  try {
    let domainName = link.slice(link.indexOf(".") + 1, link.lastIndexOf("."))
    const customDevices = {
      xl: {
        width: 1280,
        height: 600,
      },
      xxl: {
        width: 1536,
        height: 1000,
      },
    }
    const image = `${domainName}_${device}_${Date.now()}.png`
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--single-process"],
    })
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(60000)
    if (customDevices.hasOwnProperty(device)) {
      await page.setViewport({
        width: customDevices[device].width,
        height: customDevices[device].height,
        deviceScaleFactor: 2,
      })
    } else {
      await page.emulate(puppeteer.devices[device])
    }
    await page.goto(link, { waitUntil: "networkidle2" })
    await page.waitForTimeout(7000)
    await page.screenshot({
      path: `${image}`,
      fullPage: true,
    })

    await browser.close()
    return image
  } catch (error) {
    console.log(error)
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})

app.post("/mysnapshot", async (req, res) => {
  const { link, device } = req.body
  let image = ""
  if (link !== undefined && link === "") {
    image = await captureScreenshot(link, device)
    const filename = path.basename(image)
    res.setHeader("Content-disposition", "attachment; filename=" + filename)
    res.setHeader("content-type", "image/png")
    res.download(image, filename)
  } else {
    res.send({ error: "Please provide a valid url" })
  }
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
