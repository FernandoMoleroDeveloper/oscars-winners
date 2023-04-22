const express = require("express");
const fs = require("fs");
const homeHtmlFilePath = "./templates/home.html";
const oscarsPath = "./data";
const PORT = 3000;
const server = express();
const router = express.Router();

// Server config
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

router.get("/", (req, res) => {
  fs.readFile(homeHtmlFilePath, "utf-8", (readError, data) => {
    if (readError) {
      res.status(500).send("Error inesperado :(");
    } else {
      try {
        res.set("Content-Type", "text/html");
        res.send(data);
      } catch (error) {
        res.status(500).send("Error inesperado :(");
      }
    }
  });
});

router.get("/oscars", (req, res) => {
  fs.readdir(oscarsPath, (error, data) => {
    console.log(`El usuario ha solicitado ${req.url}`);

    if (error) {
      res.status(500).send("error");
    } else {
      const response = { years: [] };
      data.forEach((year) => {
        response.years.push(year.slice(7, 11));
      });

      console.log(data);
      res.json(response);
    }
  });
});

router.get("/oscars/:year", (req, res) => {
  const yearWinners = req.params.year;
  const yearPath = "./data/oscars-" + yearWinners + ".json";
  fs.readFile(yearPath, (error, data) => {
    console.log(`El usuario ha solicitado ${req.url}`);
    if (error) {
      res.status(500).send("error inesperado");
    } else {
      const yearInfo = JSON.parse(data);
      res.json(yearInfo);
    }
  });
});

router.post("/oscars/:year", (req, res) => {
  const yearWinners = req.params.year;
  const yearPath = "./data/oscars-" + yearWinners + ".json";
  fs.readFile(yearPath, (error, data) => {
    if (error) {
      const newOscar = [req.body];
      fs.writeFile(yearPath, JSON.stringify(newOscar), (error) => {
        if (error) {
          res.status(500).send("error inesperado");
          console.log(error);
        } else {
          console.log("guardado correctamente");
          res.json(newOscar);
        }
      });
    } else {
      const oscar = JSON.parse(data);
      const newOscar = req.body;
      oscar.push(newOscar);

      fs.writeFile(yearPath, JSON.stringify(oscar), (error) => {
        if (error) {
          res.status(500).send("error inesperado");
        } else {
          res.json(newOscar);
        }
      });
    }
  });
});

router.get("/winners-multiple/:year", (req, res) => {
  const yearWinners = req.params.year;
  const yearPath = "./data/oscars-" + yearWinners + ".json";
  fs.readFile(yearPath, (error, data) => {
    if (error) {
      res.status(500).send("error inesperado");
    } else {
      try {
        const winnersData = JSON.parse(data);
        let countedWinners = winnersData.reduce((allWinners, winnerName) => {
          const winners = allWinners.find((winner) => winner.name === winnerName.entity);
          if (winners) {
            winners.awards.push(winnerName.category);
          } else {
            allWinners.push({
              name: winnerName.entity,
              awards: [winnerName.category],
            });
          }
          return allWinners;
        }, []);
        countedWinners = countedWinners.filter((winner) => winner.awards.length > 1);
        res.json({ winners: countedWinners });
      } catch (parseError) {
        console.error(parseError);
        res.status(500).send("Error inesperado");
      }
    }
  });
});

// Server config
server.use("/", router);

server.listen(PORT, () => {
  console.log(`Servidor está levantado y escuchando en el puerto ${PORT}`);
});
