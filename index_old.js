const ethers = require('ethers');

let abi = [
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "verifyGreeting",
		"outputs": [
			{
				"internalType": "address",
				"name": "signer",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "hash",
				"type": "bytes32"
			},
			{
				"internalType": "uint8",
				"name": "v",
				"type": "uint8"
			},
			{
				"internalType": "bytes32",
				"name": "r",
				"type": "bytes32"
			},
			{
				"internalType": "bytes32",
				"name": "s",
				"type": "bytes32"
			}
		],
		"name": "verifyHash",
		"outputs": [
			{
				"internalType": "address",
				"name": "signer",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "greet",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "greeting",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];

let provider = ethers.getDefaultProvider('rinkeby');

let wallet = ethers.Wallet.createRandom();

console.log(wallet.address);

let contractAddress = '0xa49fed1fb802915b1862026852348a3cecf72328';
let contract = new ethers.Contract(contractAddress, abi, provider);

// The hash we wish to sign and verify. IT MUST MATCH GREETING IN SMART CONTRACT
let messageHash = ethers.utils.id("Hello World");

let messageHashBytes = ethers.utils.arrayify(messageHash)


// Gets greeting from contract which is byte32. Look into having solidity convert a string or something
async function greet() {
    let greeting = await contract.greeting();
    // console.log(greeting)
	// Signs arrayified version of "hello world in byte32 form"
	// THIS ONE BELLOW WORKS
	// let flatSigGreeting = await wallet.signMessage(messageHashBytes);
	let greetingHashBytes = ethers.utils.arrayify(greeting);
	let flatSigGreeting = await wallet.signMessage(greetingHashBytes);
    let sigGreeting = ethers.utils.splitSignature(flatSigGreeting);
    // Verifies signed message to match one in smart contract
    verifyGreeting(sigGreeting);
}

greet()

async function flatten() {
    let flatSig = await wallet.signMessage(messageHashBytes);
    // For Solidity, we need the expanded-format of a signature
    let sig = ethers.utils.splitSignature(flatSig);
    verifySig(sig)
}

async function verifySig(sig) {
    // Call the verifyHash function
    let recovered = await contract.verifyHash(messageHash, sig.v, sig.r, sig.s);
    console.log(recovered);
}

async function verifyGreeting(sigGreeting) {
    // Call the verifyHash function
    let recovered = await contract.verifyGreeting(sigGreeting.v, sigGreeting.r, sigGreeting.s);
    console.log(recovered);
}

flatten()
