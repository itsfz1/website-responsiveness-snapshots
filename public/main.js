const download = document.querySelector("#download");

download.addEventListener("click", async () => {
  let webUrl = document.querySelector("#web-url").value;
  const device = document.querySelector("#device").value;
  webUrl = !webUrl.includes(("http://" || "https://") && "www")
    ? "http://www." + webUrl
    : webUrl;

  const request = await fetch(`mysnapshot/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link: webUrl, device: device }),
  });
  const filename = await request.headers
    .get("content-disposition")
    .split('"')[1];
  const data = await request.blob();
  const imageObjectURL = URL.createObjectURL(data);
  let link = document.createElement("a");
  link.download = filename;
  link.href = imageObjectURL;
  link.click();
});
