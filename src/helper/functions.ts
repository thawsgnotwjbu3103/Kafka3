import {CommandInteraction, Message} from "discord.js";
import * as url from "url";

export const reject = async (interaction: CommandInteraction, message: string): Promise<void> => {
    await interaction.reply({
        content: message,
        fetchReply: true
    }).then((result: Message): void => {
        result.react("❌")
    })
}

export const isValidUrl = (s: string): boolean => {
    try {
        new url.URL(s);
        return true
    } catch (e) {
        return false
    }
}

export const checkValidCommand = (str: string, prefix: string):boolean => {
    let count = 0;
    for (const strElement of str) {
        if(strElement === prefix) {
            count++
        }
    }
    return count === 1
}

export const nyaasiHtml = (data: any[]) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            <style>
              body {
                font-family: "Poppins", Arial, Helvetica, sans-serif;
                background: rgb(22, 22, 22);
                color: #fff;
                max-width: 300px;
              }
        
              .app {
                max-width: 300px;
                padding: 20px;
                display: flex;
                flex-direction: row;
                border-top: 3px solid rgb(16, 180, 209);
                background: rgb(31, 31, 31);
                align-items: center;
              }
        
              img {
                width: 50px;
                height: 50px;
                margin-right: 20px;
                border-radius: 50%;
                border: 1px solid #fff;
                padding: 5px;
              }
            </style>
          </head>
          <body>
            <div class="app">
              <h4>Welcome Thang</h4>
            </div>
          </body>
        </html>
    `
}