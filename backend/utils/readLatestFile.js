import { promises as fs, read } from 'fs';
import path from 'path';

async function readLatestFile(directoryPath){
    console.log(directoryPath);
    try{
        const files = await fs.readdir(directoryPath);
        if(files.length ===0){
            console.log('directory is empty');
            return null;
        }
        let latestFile = null; 
        let latestMtime = 0; 
        for(const file of files){
            const filepath = path.join(directoryPath, file);
            const stats = await fs.stat(filepath);
            if(stats.isFile()){
                if(stats.mtimeMs > latestMtime ){
                    latestMtime = stats.mtimeMs;
                    latestFile = filepath;
                }
            }
        }

        if(latestFile){
            console.log(`got the latest File ${latestFile}`);
            return latestFile;
        }
        else{
            console.log('No files found in the directory');
            return null;
        }
    }
    catch(err){
            console.log('Error reading direcrtoy or file', err);
            return null; 
    }
}


export default readLatestFile;