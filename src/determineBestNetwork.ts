var wifi = require('node-wifi');

async function getAllNetworks() : Promise<Array<foundNetwork>> {
    
    wifi.init({
        iface: null // network interface, choose a random wifi interface if set to null
    });
    
    let myListOfNetworks = await wifi.scan()
    
    return myListOfNetworks;
}


export async function determineBestNetwork(listOfKnownNetworks:Array<knownNetwork>) {
    let foundNetworks = await getAllNetworks();
    console.log(`${foundNetworks.length} networks found`)
    let knownNetworkSSIDs = listOfKnownNetworks.map(network => network.ssid);
    
    let listOfFoundandKnownNetworks : Array<foundNetwork> = [];

    foundNetworks.forEach(network => {
        if (knownNetworkSSIDs.includes(network.ssid)) {
            listOfFoundandKnownNetworks.push(network);
        }
    });

    let networkStrengths = listOfFoundandKnownNetworks.map(n => n.quality);
    let bestNetworkIndex = networkStrengths.indexOf(Math.max(...networkStrengths));

    let bestNetwork = listOfFoundandKnownNetworks[bestNetworkIndex];
    
    return listOfFoundandKnownNetworks[bestNetworkIndex];
}