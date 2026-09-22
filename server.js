const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const server = http.createServer(async (req, res) => {

  // -------------------------
  // API: Google suggestions
  // -------------------------
  if (req.url.startsWith("/api/suggestions")) {
    try {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      const query = url.searchParams.get("q");

      if (!query) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          error: "Missing q parameter"
        }));

        return;
      }

      const googleUrl =
        "https://suggestqueries.google.com/complete/search?" +
        `client=chrome&q=${encodeURIComponent(query)}`;

      console.log("Requesting:", googleUrl);

      const response = await fetch(googleUrl);

      if (!response.ok) {
        throw new Error(`Google returned ${response.status}`);
      }

      const data = await response.json();

      res.writeHead(200, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify(data));

    } catch (error) {
      console.error("Suggestion error:", error);

      res.writeHead(500, {
        "Content-Type": "application/json"
      });

      res.end(JSON.stringify({
        error: "Failed to get suggestions",
        details: error.message
      }));
    }

    return;
  }


  // -------------------------
  // Serve static files
  // -------------------------

  let filePath;

  if (req.url === "/") {
    filePath = path.join(__dirname, "public", "index.html");
  } else {
    filePath = path.join(__dirname, "public", req.url);
  }

  // Don't allow weird paths like ../something
  const publicFolder = path.join(__dirname, "public");
  const absoluteFilePath = path.resolve(filePath);

  if (!absoluteFilePath.startsWith(publicFolder)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(absoluteFilePath, (err, data) => {

    if (err) {
      console.log("File not found:", absoluteFilePath);

      res.writeHead(404);
      res.end("Not found");

      return;
    }

    // Determine content type
    let contentType = "text/plain";

    if (absoluteFilePath.endsWith(".html")) {
      contentType = "text/html";
    } else if (absoluteFilePath.endsWith(".js")) {
      contentType = "text/javascript";
    } else if (absoluteFilePath.endsWith(".css")) {
      contentType = "text/css";
    }

    res.writeHead(200, {
      "Content-Type": contentType
    });

    res.end(data);
  });
});


server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
