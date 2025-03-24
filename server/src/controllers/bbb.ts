import axios from "axios";
import { generateChecksum } from '../config/bbb'
import { Request, Response } from "express";
import { parseXMLtoJSON } from "../config/xml2js";

async function createRoom(req: Request, res: Response) {
  const meetingID = "12345"; // Unique ID for the room
  const meetingName = "My Test Meeting";
  const attendeePassword = "attendee123";
  const moderatorPassword = "mod123";

  const result = await createBBBRoom(meetingID, meetingName, attendeePassword, moderatorPassword);

  if (result) {
    res.send(result);
  } else {
    res.status(500).json({ success: false, message: "Failed to create room" });
  }
}
async function checkRooms(req: Request, res: Response) {
  const params = `getMeetings`;
  const checksum = generateChecksum(params, process.env.BBB_SECRET as string);
  const url = `${process.env.BBB_URL}/getMeetings?checksum=${checksum}`;


  try {
    const response = await axios.get(url);
    res.send(response.data); // Returns the XML response
  } catch (error) {
    console.error("Error fetching active meetings:", error);
    res.status(500).json({ success: false, message: "Failed to list rooms" });
  }
}


async function createBBBRoom(meetingID: string, meetingName: string, attendeePassword: string, moderatorPassword: string) {
  const params = `name=${encodeURIComponent(meetingName)}&meetingID=${meetingID}&attendeePW=${attendeePassword}&moderatorPW=${moderatorPassword}&record=true`;
  const checksum = generateChecksum(`create${params}`, process.env.BBB_SECRET as string);

  const url = `${process.env.BBB_URL}/create?${params}&checksum=${checksum}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error creating BBB room:", error);
    return null;
  }
}

async function joinRoom(req: Request, res: Response) {
  const result = await joinBBBRoom(req.body)

  if (result) {
    res.send({ url: result });
  } else {
    res.status(500).json({ success: false, message: "Failed to join room" });
  }
}

async function joinBBBRoom(params: any) {
  const { fullName, meetingID, role } = params
  const _params = `fullName=${encodeURIComponent(fullName)}&meetingID=${meetingID}&role=${role}&redirect=false`;
  const checksum = generateChecksum(`join${_params}`, process.env.BBB_SECRET as string)

  const url = `${process.env.BBB_URL}/join?${_params}&checksum=${checksum}`;

  try {
    let response = await axios.get(url);
    console.log(response)
    if (response?.data?.response?.returncode === 'FAILED') {
      const attendeePassword = "attendee123";
      const moderatorPassword = "mod123";

      const room = await createBBBRoom(meetingID, meetingID, attendeePassword, moderatorPassword);
      if (!room) {
        throw new Error('Error creating room')
      }
    }

    console.log(url)

    response = await axios.get(url);
    const json = await parseXMLtoJSON(response.data)
    return json.response.url;
  } catch (error) {
    console.error("Error joining BBB Room:", error);
    return error;
  }
}
export { createRoom, checkRooms, joinRoom }