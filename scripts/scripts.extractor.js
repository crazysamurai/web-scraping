// node scripts.extractor.js --source=https://www.kudosprime.com/fh4/carlist.php?range=20 --dataFolder=data --dest=root
// node scripts.extractor.js --source=https://www.kudosprime.com/fh4/carlist.php?range=2000 --dataFolder=data --dest=root

let minimist = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let excel4node = require("excel4node");
let pdf = require("pdf-lib");
let fs = require("fs");
let args = minimist(process.argv);
let path = require("path");
const { rgb } = require("pdf-lib");

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
    }
    //removing the ▲ symbol because it can't be written in pdf
    for (let y = 0; y < cars.length; y++) {
      let str = cars[y].x;
      str = str.replace(/▲/g, "");
      str = str.replace(/"THE MACHINE"/g, ""); // to remove "" in the string
      str = str.replace("/", "");
      cars[y].x = str;
    }
    // console.log(cars);

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

    //writing classified list in a json file

    let horizonJson = JSON.stringify(horizon);
    fs.writeFileSync("horizon.json", horizonJson, "utf-8");

    // writing in excel file

    createExcelFile(horizon);
    function createExcelFile(horizon) {
      let wb = new excel4node.Workbook(); //creating a new workbook in the excel file

      for (let i = 0; i < horizon.length; i++) {
        let sheet = wb.addWorksheet(horizon[i].name);

        sheet.cell(1, 1).string("Vehicle Name");
        sheet.cell(1, 2).string("Class");
        sheet.cell(1, 3).string("Performance Index");
        sheet.cell(1, 4).string("Engine Power");
        sheet.cell(1, 5).string("Weight");
        sheet.cell(1, 6).string("Drivetrain");
        sheet.cell(1, 7).string("Price");

        sheet.column(1).setWidth(70);
        sheet.column(3).setWidth(25);
        sheet.column(7).setWidth(25);
        sheet.column(4).setWidth(25);
        sheet.column(5).setWidth(25);
        sheet.column(6).setWidth(25);

        for (let j = 0; j < horizon[i].cars.length; j++) {
          let carClass = horizon[i].cars[j].class;

          let Style = wb.createStyle({
            font: {
              color: "#FFFFFF",
            },
            fill: {
              type: "pattern",
              patternType: "solid",
              fgColor: selectColor(),
            },
          });

          //a better way would be to use a switch statement
          function selectColor() {
            if (carClass === "C") {
              let color = "#e5c30c";
              return color;
            } else if (carClass === "D") {
              let color = "#41b068";
              return color;
            } else if (carClass === "B") {
              let color = "#FF7A08";
              return color;
            } else if (carClass === "A") {
              let color = "#C2070F";
              return color;
            } else if (carClass === "S1") {
              let color = "#806AF0";
              return color;
            } else if (carClass === "S2") {
              let color = "#0008EE";
              return color;
            } else {
              let color = "#AEF21B";
              return color;
            }
          }

          sheet.cell(j + 2, 1).string(horizon[i].cars[j].x);
          sheet
            .cell(j + 2, 2)
            .string(horizon[i].cars[j].class)
            .style(Style);
          sheet.cell(j + 2, 3).string(horizon[i].cars[j].val);
          sheet.cell(j + 2, 4).string(horizon[i].cars[j].pow);
          sheet.cell(j + 2, 5).string(horizon[i].cars[j].weight);
          sheet.cell(j + 2, 6).string(horizon[i].cars[j].drive);
          sheet.cell(j + 2, 7).string(horizon[i].cars[j].price);

          //     switch (carClass) {
          //       case "C":
          //         sheetStyle("#e5c30c");
          //         break;

          //       case "D":
          //         sheetStyle("#41b068");
          //         break;

          //       case "B":
          //         sheetStyle("#FF7A08");
          //         break;

          //       default:
          //         sheetStyle("#ffffff");
          //     }
        }
      }
      wb.write("excel.xlsx");
    }

    //creating folders

    fs.access("data", function (error) {
      if (error) {
        createFolders(horizon);

        function createFolders(horizon) {
          fs.mkdirSync(args.dataFolder);
          for (let i = 0; i < horizon.length; i++) {
            let selectedFolder = path.join(args.dataFolder, horizon[i].name);
            fs.mkdirSync(selectedFolder, { recursive: true });
            //creating pdf
            for (let j = 0; j < horizon[i].cars.length; j++) {
              let carDetailsFile = path.join(
                selectedFolder,
                horizon[i].cars[j].x + ".pdf"
              );
              createDetailsPage(
                horizon[i].name,
                horizon[i].cars[j],
                carDetailsFile
              );
            }
          }
        }
      } else {
        console.log("Folder already exists.");

        createFolders(horizon);

        function createFolders(horizon) {
          for (let i = 0; i < horizon.length; i++) {
            let selectedFolder = path.join(args.dataFolder, horizon[i].name);
            fs.access(selectedFolder, function (err) {
              if (err) {
                fs.mkdirSync(selectedFolder);
              }
            });
            //creating pdf
            for (let j = 0; j < horizon[i].cars.length; j++) {
              let carDetailsFile = path.join(
                selectedFolder,
                horizon[i].cars[j].x + ".pdf"
              );
              createDetailsPage(
                horizon[i].name,
                horizon[i].cars[j],
                carDetailsFile
              );
            }
          }
        }
      }
    });

    function createDetailsPage(categoryName, car, carDetailsFile) {
      //generating detailed pdf
      let category = categoryName;
      let carName = car.x;
      let carClass = car.class;
      let carVal = car.val;
      let carPow = car.pow;
      let carWeight = car.weight;
      let carDrive = car.drive;
      let carPrice = car.price;
      let details = carDetailsFile;

      let pdfDocument = pdf.PDFDocument;
      let templateData = fs.readFileSync("template.pdf"); //no need to use utf-8 because it requires bytes from the file
      let promiseLoad = pdfDocument.load(templateData);
      promiseLoad.then(function (pdfDoc) {
        let page = pdfDoc.getPage(0);

        page.drawText(category, {
          x: 700,
          y: 550,
          size: 10,
          color: rgb(0.9, 0.3, 0.5),
        });
        page.drawText(carClass, {
          x: 570,
          y: 370,
          size: 18,
          color: rgb(0.85, 0.1, 0.58),
        });
        page.drawText(carVal, {
          x: 570,
          y: 335,
          size: 18,
          color: rgb(0.85, 0.1, 0.58),
        });
        page.drawText(carPow, {
          x: 570,
          y: 305,
          size: 18,
          color: rgb(0.94, 0.52, 0.01),
        });
        page.drawText(carWeight, {
          x: 570,
          y: 270,
          size: 18,
          color: rgb(0.94, 0.52, 0.01),
        });
        page.drawText(carDrive, {
          x: 570,
          y: 240,
          size: 18,
          color: rgb(0.94, 0.52, 0.01),
        });
        page.drawText(carPrice + " " + "CR", {
          x: 570,
          y: 210,
          size: 18,
          color: rgb(0.01, 0.65, 0.47),
        });
        page.drawText(carName, {
          x: 70,
          y: 450,
          size: 18,
          color: rgb(0.7, 0.85, 0.32),
        });

        let promiseSave = pdfDoc.save();
        promiseSave
          .then(function (newTemplateData) {
            fs.writeFileSync(details, newTemplateData, function (err) {
              if (err) {
                console.log(err);
              }
            });
          })
          .catch(function (err) {
            console.log(err);
          });
      });
    }
  })
  .catch(function (err) {
    console.log(err);
  });
