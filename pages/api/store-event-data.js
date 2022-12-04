import { Web3Storage, File, getFilesFromPath } from "web3.storage";
const { resolve } = require("path");
require("dotenv").config();

export default async function handler(req, res) {
    if (req.method === "POST") {
      return await storeEventData(req, res);
    } else {
      return res
        .status(405)
        .json({ message: "Method not allowed", success: false });
    }
  }

  async function storeEventData(req, res) {
    const body = req.body;
    try {
        console.log("0 working")
      const files = await makeFileObjects(body);
      console.log("1 working", files)
      const cid = await storeFiles(files);
      console.log("2 working")

      return res.status(200).json({ success: true, cid: cid });
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Error creating raffle", success: false });
    }
  }

  async function makeFileObjects(body) {
    const buffer = Buffer.from(JSON.stringify(body));
  
    const imageDirectory = resolve(process.cwd(), `public/images/${body.image}`);
    const files = await getFilesFromPath(imageDirectory);
  
    files.push(new File([buffer], "data.json"));
    return files;
  }

  function makeStorageClient() {
    return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
  }

  async function storeFiles(files) {
    const client = makeStorageClient();
    console.log("3 working", client)
    const cid = await client.put(files);
    console.log("4 working")
    return cid;
  }