import abiJSON from "./Deffle.json";
import { ethers } from "ethers";

function connectContract() {
    //Note: Your contractAddress will start with 0x, delete everything between the quotes and paste your contract address.
    const contractAddress = "0x21190B74b28516c28F486589299A552eB33Dd27a";
    const contractABI = abiJSON.abi;
    let deffleContract;
    try {
      const { ethereum } = window;
  
      if (ethereum) {
        //checking for eth object in the window
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        deffleContract = new ethers.Contract(contractAddress, contractABI, signer); // instantiating new connection to the contract
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("ERROR:", error);
    }
    return deffleContract;
  }
  
  export default connectContract;