import {TxTypes} from "../models/TxTypes.js";
import {TxTasks} from "../models/TxTasks.js";
import fs from "node:fs";
import path from "node:path";


export const addDefaultTypesTx = async () => {
    await TxTasks.updateMany({isRunning: true}, {isRunning: false}).then().catch(e => console.log(e));
    const sql_Folder = './src/helpers/TxTypes/';

    fs.readdir(sql_Folder, (err, files) => {
        files.forEach(file => {
            if (path.extname(file) === ".sql") {
                fs.readFile(sql_Folder + file, 'utf8', function (err, data) {
                    if (data) {
                        console.log(path.parse(file).name);
                        TxTypes.findOneAndUpdate({name: path.parse(file).name}, {
                                name: path.parse(file).name,
                                sql: data
                            }, {upsert: true}
                        ).then().catch(e => console.log(e));
                    }
                });

            }
        });
    });

}
