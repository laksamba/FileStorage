import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";

const contractAddress = "0xDa9d15811C266a63da4F199c59e769bE621bc4e4";
const contractABI =  [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "name": "FileUploaded",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getFiles",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_ipfsHash",
        "type": "string"
      }
    ],
    "name": "uploadFile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "uploadedFiles",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const PINATA_API_KEY = "14f97ec9d2df0392729b";  
const PINATA_SECRET_KEY = "14614cabf105339cbb428b5eb79b13dd8bb9deb8c2305402db63c833f263c251";  

function App() {
  const [fileHash, setFileHash] = useState("");
  const [files, setFiles] = useState([]);

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
  
    const pinataMetadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", pinataMetadata);
  
    const pinataOptions = JSON.stringify({ cidVersion: 0 });
    formData.append("pinataOptions", pinataOptions);
  
    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      });
  
      const ipfsHash = res.data.IpfsHash;
      setFileHash(ipfsHash);
      console.log("Uploaded File Hash:", ipfsHash);
  
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
        // Send transaction and wait for confirmation
        const tx = await contract.uploadFile(ipfsHash);
        console.log("Transaction sent:", tx.hash);
  
        await tx.wait();
        console.log("Transaction confirmed.");
  
        // Fetch files after successful upload
        fetchFiles();
      }
    } catch (error) {
      console.error("Error uploading file to Pinata:", error);
    }
  };
  

  const fetchFiles = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("Connected Account:", accounts[0]);
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      console.error("MetaMask not detected. Install MetaMask.");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    // Fetch stored files
    const storedFiles = await contract.getFiles();
    console.log("Raw storedFiles:", storedFiles);

    // Ensure storedFiles is properly formatted as an array
    const filesArray = storedFiles.map(file => file.toString());
    console.log("Formatted storedFiles:", filesArray);

    setFiles(filesArray);
    }
  

  return (
    <div className="p-6 text-center max-w-md mx-auto">
      <input type="file" onChange={uploadFile} className="mb-4" />
      {fileHash && (
        <p className="text-sm">
          File Uploaded: <a href={`https://gateway.pinata.cloud/ipfs/${fileHash}`} target="_blank" rel="noopener noreferrer">{fileHash}</a>
        </p>
      )}
      <button onClick={fetchFiles} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">View My Files</button>
      {files.length > 0 && (
        <ul className="mt-4">
          {files.map((hash, index) => (
            <li key={index}>
              <a href={`https://gateway.pinata.cloud/ipfs/${hash}`} target="_blank" rel="noopener noreferrer">
                {hash}
              </a>
            </li>
          ))}
        </ul>
      )}
      {/* If the file is an image, display it as an image */}
      {files.length > 0 && files.map((hash, index) => (
        <div key={index} className="mt-4">
          <img 
            src={`https://gateway.pinata.cloud/ipfs/${hash}`} 
            alt={`Uploaded file ${index}`} 
            className="max-w-full max-h-60 object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export default App;
