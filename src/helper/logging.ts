import * as fs from "fs"
import * as path from "path"
import * as url from "url"

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logging = (message: string) => {
    const logFileDir = path.resolve(__dirname, "../../db.log")
    const formattedMessage = `${new Date().toISOString()} - ${message}\n`;
    if (!fs.existsSync(logFileDir)) {
        fs.writeFileSync(logFileDir, "", {flag: 'wx'})
    }
    fs.appendFileSync(logFileDir, formattedMessage)
}

export default logging