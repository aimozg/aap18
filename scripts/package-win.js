/*
 * Created by aimozg on 04.12.2022.
 */

const child_process = require("child_process");

const date = new Date().toISOString().split('T')[0];
const zipFile = `releases/aap18-v${process.env.npm_package_version}-${date}.zip`
const zipDir = `dist`

let cmdName = "powershell.exe";
let cmdArgs = [
    "-nologo",
    "-noprofile",
    "-command",
    `"& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('${zipDir}', '${zipFile}'); }"`
];
console.log("Executing",cmdName,...cmdArgs);
child_process.exec(cmdName+" "+cmdArgs.join(' '));
