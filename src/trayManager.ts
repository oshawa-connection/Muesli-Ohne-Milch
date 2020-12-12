import SysTray, { Menu, MenuItem, UpdateItemAction, UpdateMenuAction } from "systray";
import * as fs from "fs";
import { logMessages } from ".";
let path = require('path');


/**
 * 
 */
export class TrayManager {
    
    private menu : Menu;
    public paused : boolean;
    private readonly icon : Buffer;
    
    private menuItems : Array<MenuItem>;

    public onClick() {
        throw new Error("Not implemented.");
    }


    constructor() {
        this.icon = fs.readFileSync(path.join(__dirname, `../static/dist/antenna.${process.platform === 'win32' ? 'ico' : 'png'}`));
        this.paused = false;

        this.menuItems = [{
            title: 'Paused',
            tooltip: 'Pause app',
            checked: this.paused,
            enabled: true
        },
        // {
        //     title: 'test item',
        //     tooltip: 'Tool top says hello',
        //     checked: false,
        //     enabled: true,
        // }, 
        {
            title: 'Quit',
            tooltip: 'Quits the service',
            checked: false,
            enabled: true,
        }];

        this.menu = {
            icon: this.icon.toString('base64'),
            title: '',
            tooltip: 'Aria2c-Node-GUI',
            items: this.menuItems
        }

        let tray = new SysTray({menu:this.menu});
        
        tray.onClick(action => {
            switch (action.seq_id) {
                case 0:
                    //Pauses the app 
                    this.paused = !this.paused;
                    this.menuItems[0].checked = true;
                    let x : UpdateItemAction = {
                        type:"update-item", item : {
                            ...action.item,
                            checked: !action.item.checked,
                        },
                        seq_id:action.seq_id
                    };
                    
                    tray.sendAction(x)
                    if (logMessages) console.log("Updating paused state")
                    break;
                case 1:
                    tray.kill();
                    break;
            }
            })
            
        tray.onExit((code, signal) => {
            setTimeout(() =>
                process.exit(0), 2000)
        })
    }
}