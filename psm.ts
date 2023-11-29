// ts-node psm.ts --csvfile PSMrawdata.csv
import { program } from "commander";
const csv = require("csv-parser");
const fs = require("fs");

// タイプ
type CsvData = {
  "sample number": string;
  高い: string;
  安い: string;
  高すぎる: string;
  安すぎる: string;
};

// コマンド作成
program
  .option("--csvfile <path>", "csvのファイルパスを入力してください")
  .parse(process.argv);

//　ファイルパスの情報をとるため
const csvFilePath = program.opts().csvfile;

// csvのデータ
let results: CsvData[] = [];

// csvを読む方法
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (data: CsvData) => results.push(data))
  .on("end", () => {
    const tooHighPrice: number[] = results.map((ele) => parseInt(ele.高すぎる)); // 文字列を数値に変更する
    const highPrice: number[] = results.map((ele) => parseInt(ele.高い)); // 文字列を数値に変更する
    const lowPrice: number[] = results.map((ele) => parseInt(ele.安い)); // 文字列を数値に変更する
    const tooLowPrice: number[] = results.map((ele) => parseInt(ele.安すぎる)); // 文字列を数値に変更する

    //　値段を比較する function
    const comparison = (dataArray1: number[], dataArray2: number[]): number => {
      let difference = 0;
      let answer = 0;

      //　各数値間のギャップをチェックする
      dataArray1.forEach((ele1) => {
        dataArray2.forEach((ele2) => {
          if (Math.abs(ele1 - ele2) > difference) {
            difference = Math.abs(ele1 - ele2);
            answer = (ele1 + ele2) / 2;
          }
        });
      });

      return answer;
    };

    console.log(`最低品質保証価格: ${comparison(tooLowPrice, highPrice)}円`);
    console.log(`理想価格: ${comparison(lowPrice, highPrice)}円`);
    console.log(`妥協価格: ${comparison(tooLowPrice, tooHighPrice)}円`);
    console.log(`最高価格: ${comparison(lowPrice, tooHighPrice)}円`);
  })
  .on("error", (error: Error) => {
    console.error(error);
  });
