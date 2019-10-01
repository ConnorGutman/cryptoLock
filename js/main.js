let publicKeyElement = document.getElementById("publicKey");
let privateKeyElement = document.getElementById("privateKey");
let addressElement = document.getElementById("address");
let signatureResultsElement = document.getElementById("signatureResults");
let lockResultsElement = document.getElementById("lockResults");
let lockElement = document.getElementById("lock");


let abi = [
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "a",
				"type": "address"
			}
		],
		"name": "addMember",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "generateMessage",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "memberAddress",
				"type": "address"
			}
		],
		"name": "getMemberStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isIndeed",
				"type": "bool"
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "memberAddresses",
		"outputs": [
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "publicKey",
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
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "members",
		"outputs": [
			{
				"internalType": "bool",
				"name": "active",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "publicKey",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
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
		"name": "unlock",
		"outputs": [
			{
				"internalType": "bool",
				"name": "authorized",
				"type": "bool"
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
		"name": "verifySignature",
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
	}
];

let provider = ethers.getDefaultProvider('rinkeby');

// let privateKey = '0x0123456789012345678901234567890123456789012345678901234567890123';
// let wallet = new ethers.Wallet(privateKey);

if (localStorage.privateKey) {
    let wallet = new ethers.Wallet(localStorage.privateKey);
    verify(wallet);
} else {
    let wallet = ethers.Wallet.createRandom();
    localStorage.privateKey = wallet.privateKey;
    verify(wallet);
}



async function verify(wallet) {
    console.log('Address:  ', wallet.address);
    publicKeyElement.innerHTML = 'Public Key: ' + wallet.address;
    privateKeyElement.innerHTML = 'Private Key: ' + wallet.privateKey;
    addressElement.innerHTML = 'Address:  ' + wallet.address;

    let contractAddress = '0xfc5182179575618511501a856940a2d6c1c4c155';
    let contract = new ethers.Contract(contractAddress, abi, provider);
	// Fetch latest block hash from contract
	let latestBlockHash = await contract.generateMessage();
	// Convert Byte32 into array
	let latestBlockHashBytes = ethers.utils.arrayify(latestBlockHash);
	// Sign message array
	let flatSigHash = await wallet.signMessage(latestBlockHashBytes);
	// Flatten signature
    let sigHash = ethers.utils.splitSignature(flatSigHash);
    // Verify signature on contract
	let recovered = await contract.verifySignature(sigHash.v, sigHash.r, sigHash.s);
    console.log('Verified: ', recovered);
    signatureResultsElement.innerHTML = 'Verified: ' + recovered;
    if (wallet.address == recovered) {
        console.log('match')
        addressElement.style.color = 'green';
        signatureResultsElement.style.color= 'green';
    } else {
        console.log('does not match')
        addressElement.style.color = 'red';
        signatureResultsElement.style.color= 'red';
    }
	let recovered2 = await contract.unlock(sigHash.v, sigHash.r, sigHash.s);
    console.log('Unlocked: ', recovered2);
    lockResultsElement.innerHTML = 'Unlocked: ' + recovered2;
    if (recovered2 == true) {
        lockResultsElement.style.color = 'green';
        lockElement.innerHTML = 'Unlocked 🔓';
    } else {
        lockResultsElement.style.color= 'red';
    }
};