#!/usr/bin/env node

const fs = require('fs');
const { imageHash } = require('image-hash');
var colors = require('colors');
let total = 0;
const sharp = require('sharp')


// let txt = '';

if (!process.argv[2]) return console.log("please include file extension (jpg/png)");
if (process.argv[2] != "jpg" && process.argv[2] != "png") return console.log("png and jpg only");
console.time("time elapsed")

fs.readdir(process.cwd(), (err, xd) => {
  let files = xd.filter(x => x.endsWith("." + process.argv[2]))
  console.log(`found ${files.length} files`)
  createArr(files);
})


function createArr (arr) {
	return new Promise((resolve, reject) => {
    if (process.argv[2] === "jpg") process.argv[2] = "jpeg";
    let a = [];
    arr.forEach((item, i) => {
      sharp(item)
        .resize(16, 16)
        .greyscale()
        .toBuffer()
        .then(data => {
          imageHash({
            ext: 'image/'+process.argv[2],
            data: data
          }, 12, false, (error, data) => {
            if (error) throw error;
            a.push({
              file: item,
              hash: data
            });
          });
         })
        // .catch(err => { console.log(err) })

    });
    setTimeout(() => {
      compareImages(a)
    }, arr.length * 200)
	});
};


function compareImages(arr) {
  for (i of arr) {
    for (a in arr) {
      if (i.file == arr[a].file) continue;
      let dif = arr[a].file.match(/\d+/)[0] - i.file.match(/\d+/)[0]
      if (dif < -15 || dif > 15) continue;
      var diff = getDifference(i.hash, arr[a].hash)
      if (diff.length < 9) {
        console.log(`${arr[a].file} is a copy of ${i.file}`)
        total++;
        fs.unlinkSync(arr[a].file)
        arr.splice(a, 1)
        continue;
      }


    }
  }
  console.log(`\n\n\n\nfound ${colors.red(total)} duplicates`)
  console.timeEnd("time elapsed")
}





function getDifference(str1, str2){
  let diff= "";
  str2.split('').forEach(function(val, i){
    if (val != str1.charAt(i))
      diff += val ;
  });
  return diff;
}
