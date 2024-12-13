import express from "express";
import path from "path";
import fetch from "node-fetch";

const app = express();
const __dirname = path.resolve(); // For ES module compatibility

// Middleware to parse JSON
app.use(express.json());

// Serve static files (e.g., HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public"))); // Assuming your `index.html` is in a folder named 'public'

// Mailchimp API details
const mailchimpUrl = "https://us17.api.mailchimp.com/3.0/lists/dfecc024b5/members/";
const apiKey = "f47fede6d2dc999ef368e647a3da6f72-us17";

// Serve the homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html")); // Serve index.html
});

// API to handle form submission
app.post("/subscribe", async (req, res) => {
  const { name, email, phone, message } = req.body;

  const data = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: name,
      PHONE: phone,
      MESSAGE: message,
    },
  };

  try {
    const response = await fetch(mailchimpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      res.status(200).send({ message: "Successfully subscribed!" });
    } else {
      const errorData = await response.json();
      res.status(400).send(errorData);
    }
  } catch (error) {
    console.error("Error subscribing to Mailchimp:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
