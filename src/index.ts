var wifi = require('node-wifi');
import * as schedule from 'node-schedule';
import {TrayManager} from './trayManager';

import {determineBestNetwork} from './determineBestNetwork';
import * as fs from "fs";

wifi.init({
    iface: null // network interface, choose a random wifi interface if set to null
});


let trayManager = new TrayManager();

let rawConfigBuffer = fs.readFileSync('./config.json','utf8');

let listOfKnownNetworks : Array<knownNetwork> = JSON.parse(rawConfigBuffer)['wifiNetworks'];

if(!listOfKnownNetworks || listOfKnownNetworks.length < 1) {
    console.error("Check your config files and try again");
    process.exit(1);
}

listOfKnownNetworks.forEach(network => {
    if (!network) {
        console.error("Check your config files and try again");
        process.exit(1);
    }
    if (!network.ssid || !network.password) {
        console.error("Check your config files and try again");
        process.exit(1);
    }
})

async function main() {
    let bestNetwork = await determineBestNetwork(listOfKnownNetworks);
    let currentNetworks : Array<foundNetwork>  = await wifi.getCurrentConnections()
    let currentNetwork : foundNetwork = currentNetworks[0];
    
    if (currentNetwork.ssid !== bestNetwork.ssid) {
        console.log(`You are connected to ${currentNetwork.ssid} but the best connection is ${bestNetwork.ssid}`)
        let password = listOfKnownNetworks.find(network => network.ssid == bestNetwork.ssid)?.password;
        
        if (!password) {
            throw new Error(`Password for network ${bestNetwork.ssid} was not found`);
        }

        await wifi.connect({ssid:bestNetwork.ssid,password:password});

    } else {
        console.log(`You are currently connected to the best wifi: ${currentNetwork.ssid}`)
    }
} 

let mainTask = schedule.scheduleJob('* * * * *', async () => {
    try {
        console.log('Running it');
        if (trayManager.paused) {
            console.log("Not running beacuse paused");
        } else {
            await main()
        }
        
    } catch (err) {
        console.error(err.message);
    }
});

console.log('Started service');
