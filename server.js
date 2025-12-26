import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.static("public"));

app.get("/api/user", async (req, res) => {
  try {
  
    const userRes = await axios.get("https://randomuser.me/api/");
    const u = userRes.data.results[0];

    const userData = {
      firstName: u.name.first,
      lastName: u.name.last,
      gender: u.gender,
      age: u.dob.age,
      dob: u.dob.date,
      picture: u.picture.large,
      city: u.location.city,
      country: u.location.country,
      address: `${u.location.street.name} ${u.location.street.number}`
    };

   
    let countryData = {
      name: userData.country,
      capital: "N/A",
      languages: "N/A",
      currency: "N/A",
      flag: ""
    };

    let currencyCode = null;

    try {
      const countryRes = await axios.get(
        `http://api.countrylayer.com/v2/name/${encodeURIComponent(
          userData.country
        )}?access_key=${process.env.COUNTRY_API_KEY}`
      );

      if (Array.isArray(countryRes.data) && countryRes.data.length > 0) {
        const c = countryRes.data[0];

        
        if (Array.isArray(c.currencies) && c.currencies.length > 0) {
          currencyCode = c.currencies[0].code;
        }

        countryData = {
          name: c.name || userData.country,
          capital: c.capital || "N/A",
          languages: Array.isArray(c.languages)
            ? c.languages.map(l => l.name).join(", ")
            : "N/A",
          currency: currencyCode || "N/A",
          flag: c.flag || ""
        };
      }
    } catch (err) {
      console.log("Country API failed");
    }

   
    let exchange = { USD: "N/A", KZT: "N/A" };

    if (currencyCode) {
      try {
        const rateRes = await axios.get(
          `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_API_KEY}/latest/${currencyCode}`
        );

        exchange = {
          USD: rateRes.data.conversion_rates?.USD ?? "N/A",
          KZT: rateRes.data.conversion_rates?.KZT ?? "N/A"
        };
      } catch {
        console.log("Exchange API failed");
      }
    }

   
    let news = [];

    try {
      const newsRes = await axios.get(
        `https://newsapi.org/v2/everything?q=${userData.country}&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
      );

      news = newsRes.data.articles.map(n => ({
        title: n.title,
        description: n.description,
        image: n.urlToImage,
        url: n.url
      }));
    } catch {
      console.log("News API failed");
    }

    res.json({ userData, countryData, exchange, news });

  } catch (err) {
    console.error("FATAL ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
