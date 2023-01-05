import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync, mkdirSync, readdirSync, readFileSync } from "node:fs";

const IS_USING_MEGA = true;
const prefix = "./megatools/megatools";

let mod;

if (IS_USING_MEGA) {
  mod = {
  	dataRoot: "/Root/db/",
    save: function(fname, data, where) {
      // Write a temporary copy of the file
      // so that we can transfer it to mega.nz
      writeFileSync(fname, data);
      try {
        execSync(`${prefix} put --path ${where} ${fname}`, {stdio: "pipe"});
      } catch(e) {

        // If the error is that the file already exists,
        // then replace it
        let d = Date.now().toString();
        if (e.output.toString().includes("File already exists")) {
          
          execSync(`${prefix} get --path OLD-${d}-${fname} ${where}${fname}`, {stdio: "pipe"});
          let oldFile = JSON.parse(readFileSync(`OLD-${d}-${fname}`));
          
          // These are one-file data stores
          // so we need to update them instead of replacing them
          if (fname == "comment-history.json" || "bio-history.json") {
            writeFileSync(fname, JSON.stringify(oldFile.concat(data)));
            unlinkSync(`OLD-${d}-${fname}`);
          
          } else {
            console.log(`[mega] File already exists: ${where}${fname}`);
            console.log(`[mega] A copy of the old file has been retained at OLD-${d}-${fname}`);
          }
          
          execSync(`${prefix} rm ${where}${fname}`, {stdio: "pipe"});
          execSync(`${prefix} put --path ${where} ${fname}`, {stdio: "pipe"});

        }
      }
      unlinkSync(fname);
    },
    newDir: function(dirName) {
      try {
        execSync(`${prefix} mkdir ${dirName}`, {stdio: "pipe"});
      } catch (e) {
          if (!e.output.toString().includes("Directory already exists")) {
            throw e;
          }
      }
    },
    ls: function(dirName) {
      let megaOut = execSync(`${prefix} ls ${dirName}`);
      if (megaOut.stderr) { throw megaOut.stderr; }
      return megaOut.toString().split("\n").slice(0, -1);
    }
  };
} else {
  mod = {
  	dataRoot: "./db/",
    save: function(fname, data, where) {
      writeFileSync(where + fname, data);
    },
    newDir: mkdirSync,
    ls: readdirSync,
  };
}
export default mod;