/*
Connector for Colony API
*/

// Import the prerequisites
const { providers, Wallet } = require('ethers');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');
const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

// Create an instance of the Trufflepig contract loader
const loader = new TrufflepigLoader();

// Create a provider for local TestRPC (Ganache)
const provider = new providers.JsonRpcProvider('http://localhost:8545/');

//Existing Colonies
let knownColoniesCache = [];

/**
 * Create a brand new Colony using its own ERC20 Token
 * @param {*} _accountNumber 
 * @param {*} _tokenName 
 * @param {*} _tokenSymbol 
 */
exports.createColony = async function (_accountNumber, _tokenName, _tokenSymbol) {
    console.log("createColonyClient");

    // Get the private key from the selected account from the ganache-accounts
    // through trufflepig
    const { privateKey } = await loader.getAccount(_accountNumber);

    // Create a wallet with the private key (so we have a balance we can use)
    const wallet = new Wallet(privateKey, provider);

    // Create an adapter (powered by ethers)
    const adapter = new EthersAdapter({
        loader,
        provider,
        wallet,
    });

    // Connect to ColonyNetwork with the adapter!
    const networkClient = new ColonyNetworkClient({ adapter });
    await networkClient.init();

    // Let's deploy a new ERC20 token for our Colony.
    // You could also skip this step and use a pre-existing/deployed contract.
    const tokenAddress = await networkClient.createToken({
        name: _tokenName,
        symbol: _tokenSymbol,
    });
    console.log('Token address: ' + tokenAddress);

    // Create a cool Colony!
    const {
        eventData: { colonyId, colonyAddress },
    } = await networkClient.createColony.send({ tokenAddress });

    // Congrats, you've created a Colony!
    console.log('Colony ID: ' + colonyId);
    console.log('Colony address: ' + colonyAddress);

    // For a colony that exists already, you just need its ID:
    const colonyClient = await networkClient.getColonyClient(colonyId);

    return colonyClient;
};

/**
 * List all known colonies
 * @param {*} _accountNumber 
 */
exports.listColonies = async function (_accountNumber) {
    console.log("listColonies " + _accountNumber);
    let colonies = [];

    if (knownColoniesCache.length>0) {
        console.log("reading from Cache with " + knownColoniesCache.length + " entries.");
        tempColonyList = [];

        for (colony in knownColoniesCache) {
            tempColonyList.push(knownColoniesCache[colony]);
        }
        return tempColonyList;
    }

    // Get the private key from the selected account from the ganache-accounts
    // through trufflepig
    const { privateKey } = await loader.getAccount(_accountNumber);

    // Create a wallet with the private key (so we have a balance we can use)
    const wallet = new Wallet(privateKey, provider);

    // Create an adapter (powered by ethers)
    const adapter = new EthersAdapter({
        loader,
        provider,
        wallet,
    });

    // Connect to ColonyNetwork with the adapter!
    const networkClient = new ColonyNetworkClient({ adapter });
    await networkClient.init();

    // You can also get the Meta Colony:
    //const metaColonyClient = await networkClient.getMetaColonyClient();
    //console.log('Meta Colony address: ' + metaColonyClient.contract.address);

    //List Colonies
    try {
        const totalColonyCount = (await networkClient.getColonyCount.call()).count;
        for (x = 1; x <= totalColonyCount; x++) {
            console.log("Extracting Colony Data " + x);
            const colonyClient = await networkClient.getColonyClient(x);

            const colonyTokenInfo = await colonyClient.token.getTokenInfo.call();
            const colonyDomainCount = (await colonyClient.getDomainCount.call()).count;
            const colonyTaskCount = (await colonyClient.getTaskCount.call()).count;
            const colonyContractAddress = colonyClient.contract.address;

            //Gather data
            const colonyData = {
                "token": colonyTokenInfo,
                "domainCount": colonyDomainCount,
                "taskCount": colonyDomainCount,
                "address": colonyContractAddress,
                "id": x
            };
            console.log(colonyData);

            colonies.push(colonyData);
        }
    } catch (e) {
        console.log(e);
    }

    return colonies;
};

/**
 * List Existing Accounts
 */
exports.listAccounts = async function () {
    let addressList = [];
    // Get the addresses from all local accounts through trufflepig
    try {
        while (true) {
            const { address } = await loader.getAccount(addressList.length);

            addressList.push(address);
        }
    } catch (e) {
        console.log("Finished Loading Accounts. Found " + addressList.length + " accounts. " + e);
    }

    return addressList;
};