# Forza Horizon 4 Scraper

The project scrapes the list of all the cars in Forza Horizon 4 and displays this data in different formats.

## Acknowledgements

- [Website used for scraping](https://www.kudosprime.com/fh4/carlist.php?range=2000)

## Run Locally

Clone the project

```bash
  git clone https://github.com/crazysamurai/web-scraping.git
```

Go to the project directory

```bash
  cd web-scraping
```

Install dependencies

```bash
  npm install
```

## Usage/Examples

1. Following commands are to be pasted in console. The first command generates the result for 20 cars while second one does the same for all the cars available on the website.
2. Please make sure the website is online.

node scripts.extractor.js --source=https://www.kudosprime.com/fh4/carlist.php?range=20 --dataFolder=data --dest=root

node scripts.extractor.js --source=https://www.kudosprime.com/fh4/carlist.php?range=2000 --dataFolder=data --dest=root

For this example I've used list of all the cars i.e. 2nd command

Enter the command in the terminal and press return. The files will be created in the project directory under the scripts folder.

Data folder contains folders labeled according to the vehicle categories which contain all the pdf files for each vehicle.

The json file generated is also located under scripts folder along with the spreadsheet.

## Screenshots

![App Screenshot](/images/directory.jpg)

![App Screenshot](/images/folders.png)

![App Screenshot](/images/pdfs.png)

![App Screenshot](/images/pdf.png)

![App Screenshot](/images/json.png)

![App Screenshot](/images/excel.png)

## Color Reference for Spreadsheet

| Vehicle Class | Performance Index                                                              |
| ------------- | ---------------------------------------------------------------- |
| C             | ![#e5c30c](https://via.placeholder.com/10/e5c30c?text=+) 500-599 |
| D             | ![#41b068](https://via.placeholder.com/10/41b068?text=+) 100-499 |
| B             | ![#FF7A08](https://via.placeholder.com/10/FF7A08?text=+) 600-699 |
| A             | ![#C2070F](https://via.placeholder.com/10/C2070F?text=+) 700-799 |
| S1            | ![#806AF0](https://via.placeholder.com/10/806AF0?text=+) 800-899 |
| S2            | ![#0008EE](https://via.placeholder.com/10/0008EE?text=+) 900-998 |
| X             | ![#AEF21B](https://via.placeholder.com/10/AEF21B?text=+) 999  |

## Tech Stack

Node

pdf-lib

excel4node

axios

jsdom

##

Contributions are always welcome!
