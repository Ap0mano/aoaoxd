#!/usr/bin/env node

const fs = require('fs');
const pixelmatch = require('pixelmatch');
var colors = require('colors');
let total = 0;
let decode = require('image-decode')
let probe = require('probe-image-size')
const io = require('@pm2/io')

const xsec = io.meter({
  name: 'checks/sec',
  id: 'app/requests/volume'
})

const count = io.counter({
  name: 'Realtime checks count',
  id: 'app/realtime/checks'
});

let txt = '';

if (!process.argv[2]) return console.log("please include file extension (jpg/png)");
if (process.argv[2] != "jpg" && process.argv[2] != "png") return console.log("png and jpg only");
// console.log(process.argv[2])

fs.readdir(process.cwd(), (err, xd) => {
  console.time("time elapsed")
  let files = xd.filter(x => x.endsWith("." + process.argv[2]))
  console.log(`found ${files.length} files`)
  for (i of files) {
         for (a in files) {
           let dif = files[a].match(/\d+/)[0] - i.match(/\d+/)[0]
           if (dif < -3 || dif > 3) continue;
             if (i == files[a]) continue;
             if (files[a].includes("_p0_")) continue;
             count.inc();
             xsec.mark();
             let n = fs.statSync(i).size - fs.statSync(files[a]).size;
             if (-3000 <= n && n <= 3000) {
               let img1 = decode(fs.readFileSync(files[a]));
               let img2 = decode(fs.readFileSync(i))
                 const numDiffPixels = pixelmatch(img1.data, img2.data, null, img1.width, img1.height, {threshold: 0.65});
                 if (numDiffPixels < 120) {
                   console.log(`file ${files[a].magenta} is a copy of ${i.magenta}\n, diff: ${numDiffPixels}`)
                   total++;
                   txt += `\n\nfile ${files[a].magenta} is a copy of ${i.magenta}\n, diff: ${numDiffPixels}`;
                   fs.unlinkSync(files[a])
                   files.splice(a, 1)
                   continue;
                 }
             }
             if (-400000 <= n && n <= 400000) {
               let img1 = decode(fs.readFileSync(files[a]));
               let img2 = decode(fs.readFileSync(i))
                 const numDiffPixels = pixelmatch(img1.data, img2.data, null, img1.width, img1.height, {threshold: 0.4});
                 if (numDiffPixels < 1000) {
                   console.log(`file ${files[a].magenta} is a copy of ${i.magenta}\n, diff: ${numDiffPixels}`)
                   total++;

                   txt += `\n\nfile ${files[a].magenta} is a copy of ${i.magenta}\n, diff: ${numDiffPixels}`;
                   fs.unlinkSync(files[a])
                   files.splice(a, 1)
                   continue;
                 }
             }
         }
  }
  console.log(`\n\n\n\nfound ${colors.red(total)} duplicates`)
  console.timeEnd("time elapsed")
  fs.writeFileSync('./xd.txt', txt)
})
