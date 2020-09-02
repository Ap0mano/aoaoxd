#!/usr/bin/env node

const fs = require('fs');
const { imageHash } = require('image-hash');
var colors = require('colors');
let total = 0;


// let txt = '';

if (!process.argv[2]) return console.log("please include file extension (jpg/png)");
if (process.argv[2] != "jpg" && process.argv[2] != "png") return console.log("png and jpg only");
// console.log(process.argv[2])

fs.readdir(process.cwd(), (err, xd) => {
  let files = xd.filter(x => x.endsWith("." + process.argv[2]))
  console.log(`found ${files.length} files`)
  createArr(files);

  // fs.writeFileSync('./xd.txt', txt)
})







function hashImages(arr) {
  let a = [];
  let ind = 0;
  for (i in arr) {
    let name = arr[i];
    imageHash(name, 12, true, (error, data) => {
      if (error) throw error;
      a.push({
        file: name,
        hash: data
      });
      console.log(ind, arr.length)
    });
  }
  compareImages(a)
}


function createArr (arr) {
	return new Promise((resolve, reject) => {
    let a = [];
    let ind = 0;
    arr.forEach((item, i) => {
      imageHash(item, 12, false, (error, data) => {
        if (error) throw error;
        a.push({
          file: item,
          hash: data
        });
        ind++;
      });
    });
    setTimeout(() => {
      compareImages(a)
    }, arr.length * 200)
	});
};






function compareImages(arr) {
  console.time("time elapsed")

  for (i of arr) {
    for (a in arr) {
      if (i.file == arr[a].file) continue;
      var diff = getDifference(i.hash, arr[a].hash)
      if (diff.length < 6) {
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
