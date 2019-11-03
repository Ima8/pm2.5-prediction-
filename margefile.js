const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, 'dataset/cn_stations');

function getExtension(filename) {
  var i = filename.lastIndexOf('.');
  return (i < 0) ? '' : filename.substr(i);
}


function getFileNameInFolder() {
  return new Promise(function (resolve, reject) {
    let listOfFiles = []

    fs.readdir(directoryPath, function (err, files) {
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      for (let i = 0; i < files.length; i++) {
        let file = files[i]
        let ext = path.extname(file || '').split('.')[1];
        if (ext == "csv")
          listOfFiles.push(file)
      }
      resolve(listOfFiles)
    });
  })
}
const readFile = (path, opts = 'utf8') =>
  new Promise((resolve, reject) => {
    fs.readFile(path, opts, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

function convertPM25(val) {
  switch (val) {
    case val >= 250.5:
      return '"Hazardous"';
    case val >= 150.5:
      return '"Very Unhealthy"';
    case val >= 55.5:
      return '"Unhealth"';
    case val >= 35.5:
      return '"Unhealth for Sensitive Groups"';
    case val >= 12.1:
      return '"Moderate"';
    default:
      return '"Good"';
  }
}

function writeToFile(fd, val) {

  fs.appendFileSync(fd, val, 'utf8', (err) => {
    fs.close(fd, (err) => {
      if (err) throw err;
    });
    if (err) throw err;
  });

}
async function main() {
  let count = 0
  fd = fs.openSync('data.csv', 'a');
  let listOfFiles = await getFileNameInFolder()
  for (file of listOfFiles) {
    const pathFile = path.join(directoryPath, file);
    const res = await readFile(pathFile)
    const data = res.split('\n')
    for (let i = 0; i < data.length; i++) {
      let row = data[i]
      
      const col = row.split(',')
      if (col[5]) {
        if (count != 0 && col[0] == '"No"') {
          continue;
        }
        textPM25 = convertPM25(col[5])
        //console.log(textPM25);
        if (count == 0) {
          newRow = ['"Air Quality"', ...col.splice(0, 5), ...col.splice(1)]
          count++
        } else {
          newRow = [textPM25, ...col.splice(0, 5), ...col.splice(1)]
        }
        newRow = newRow.join()
        newRow = newRow + "\n"
        writeToFile(fd, newRow)
        count++
      }

    }
  }
  console.log(listOfFiles);
}

main()
