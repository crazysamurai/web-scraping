// node scripts.extractor.js --source=https://www.kudosprime.com/fh4/carlist.php?range=20 --excel=list.csv --dataFolder=data

let minimist = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let excel4node = require("excel4node");
let pdf = require("pdf-lib");

let args = minimist(process.argv);

//download data using axios

let responseGiven = axios.get(args.source);
responseGiven
  .then(function (response) {
    let html = response.data; // `data` is the response that was provided by the server

    let dom = new jsdom.JSDOM(html); //read using jsdom    jsdom.JSDOM == {JSDOM}
    let document = dom.window.document;

    let cars = [];
    let tableRows = document.querySelectorAll(".car");

    for (let i = 0; i < tableRows.length; i++) {
      let car = {};

      let className = tableRows[i].querySelectorAll("div.cty");
      car.className = className[0].textContent;

      let carName = tableRows[i].querySelectorAll(".name");
      car.x = carName[0].textContent;

      let carVal = tableRows[i].querySelectorAll("span.pi > b");
      car.val = carVal[0].textContent;

      let carClass = tableRows[i].querySelectorAll("span.pi > i");
      car.class = carClass[0].textContent;

      let carDetail = tableRows[i].querySelectorAll("div.tpw > p");
      car.pow = carDetail[0].textContent;
      car.weight = carDetail[1].textContent;

      let carDrive = tableRows[i].querySelectorAll("span.tr");
      car.drive = carDrive[0].textContent;

      let carPrice = tableRows[i].querySelectorAll("div.price > b");
      car.price = carPrice[0].textContent.trim();

      cars.push(car);
      // console.log(cars);
    }

    //categorizing cars using their classes

    let horizon = [];

    for (let i = 0; i < cars.length; i++) {
      classifyCars(horizon, cars[i]);
    }

    function classifyCars(horizon, car) {
      let classIndex = -1;
      for (let i = 0; i < horizon.length; i++) {
        if (horizon[i].name == car.className) {
          classIndex = i;
          break;
        }
      }
      if (classIndex == -1) {
        horizon.push({
          name: car.className,
          cars: [],
        });
      }
    }

    //pushing cars with particular class in horizon array

    for (let x = 0; x < cars.length; x++) {
      for (let i = 0; i < horizon.length; i++) {
        if (cars[x].className == horizon[i].name) {
          horizon[i].cars.push(cars[x]);
        }
      }
    }
  })
  .catch(function (err) {
    console.log(err);
  });
