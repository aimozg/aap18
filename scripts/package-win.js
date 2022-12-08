/*
 * Created by aimozg on 04.12.2022.
 */

const child_process = require("child_process");
const fs = require("fs");

const date = new Date().toISOString().split('T')[0];
const inputDir = `dist`
let zipFile = `releases/aap18-v${process.env.npm_package_version}-${date}.zip`
if (fs.existsSync(zipFile)) {
    let id = 2;
    while(true) {
        let newName = zipFile.replace(/\.zip$/,`-${id}.zip`);
        if (!fs.existsSync(newName)) {
            zipFile = newName;
            break;
        }
    }
}

let cmdName = "powershell.exe";
let cmdArgs = [
    "-nologo",
    "-noprofile",
    "-command",
    `"& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('${inputDir}', '${zipFile}'); }"`
];
console.log("Executing",cmdName,...cmdArgs);
child_process.exec(cmdName+" "+cmdArgs.join(' '));
