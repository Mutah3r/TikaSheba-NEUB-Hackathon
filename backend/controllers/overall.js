const Authority = require('../models/authority');
const Citizen = require('../models/citizen');
const VaccCentre = require('../models/vacc_centre');
const Vaccine = require('../models/vaccine');

async function getUser(req, res) {
  try {
    const role = req.user?.role;
    const sub = req.user?.sub;
    if (!role) {
      return res.status(400).json({ message: 'Role missing in token' });
    }
    if (role === 'authority') {
      const doc = await Authority.findById(sub);
      if (!doc) return res.status(404).json({ message: 'Authority not found' });
      return res.json({ id: doc._id.toString(), name: doc.name, role, email: doc.email });
    }
    if (role === 'citizen') {
      const doc = await Citizen.findById(sub);
      if (!doc) return res.status(404).json({ message: 'Citizen not found' });
      return res.json({
        id: doc._id.toString(),
        name: doc.name,
        role,
        reg_no: doc.reg_no,
        NID_no: doc.NID_no,
        Birth_Certificate_no: doc.Birth_Certificate_no,
        NID_or_Birth: doc.NID_or_Birth,
        gender: doc.gender,
        DOB: doc.DOB,
        phone_number: doc.phone_number,
      });
    }
    if (role === 'vacc_centre') {
      const doc = await VaccCentre.findById(sub);
      if (!doc) return res.status(404).json({ message: 'Centre not found' });
      const staff_count = Array.isArray(doc.staffs) ? doc.staffs.length : 0;
      return res.json({
        id: doc._id.toString(),
        name: doc.name,
        role,
        vc_id: doc.vc_id,
        location: doc.location,
        district: doc.district,
        lattitude: doc.lattitude,
        longitude: doc.longitude,
        staff_count,
      });
    }
    if (role === 'staff') {
      const { vc_id, staff_id } = req.user;
      if (!vc_id || !staff_id) {
        return res.status(400).json({ message: 'vc_id or staff_id missing in token' });
      }
      const centre = await VaccCentre.findOne({ vc_id });
      if (!centre) return res.status(404).json({ message: 'Centre not found' });
      const staff = (Array.isArray(centre.staffs) ? centre.staffs : []).find((s) => String(s.id) === String(staff_id));
      if (!staff) return res.status(404).json({ message: 'Staff not found' });
      return res.json({ id: staff.id, name: staff.name, role, vc_id: centre.vc_id, centre_name: centre.name });
    }
    return res.status(400).json({ message: 'Unknown role' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get user' });
  }
}

module.exports = { getUser };

// OCR vaccine card using Gemini and update citizen vaccine_taken
async function ocrVaccinationCard(req, res) {
  try {
    console.log("api came")
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Gemini API key not configured' });
    }

    console.log("OCR API initiate")

    const { image_base64, mimeType } = req.body || {};
    if (!image_base64 || typeof image_base64 !== 'string' || image_base64.length < 50) {
      return res.status(400).json({ success: false, message: 'image_base64 is required and must be base64-encoded image data' });
    }

    console.log("Image ok")

    const vaccines = await Vaccine.find({});
    const vaccineMapByName = new Map();
    const vaccineContext = vaccines.map((v) => {
      vaccineMapByName.set(String(v.name).toLowerCase(), String(v._id));
      return { id: String(v._id), name: v.name };
    });

    console.log("Vaccine ok")

    // Build prompt instructing strict JSON output with support for multiple vaccines
    const prompt = [
      {
        text:
          'You are processing a vaccination card image. Extract fields and return STRICT JSON only. Schema:\n' +
          '{"reg_no": string, "name"?: string, "vaccines"?: [{"vaccine_name"?: string, "vaccine_id"?: string, "time"?: ISO 8601 datetime}]}.\n' +
          'Rules: 1) reg_no is MANDATORY. If reg_no cannot be confidently recognized, output {"success": false, "message": "reg_no not recognized"} and NO other text. ' +
          '2) For vaccines, return an array where each item corresponds to one vaccine entry found in the image. ' +
          '3) vaccine_name should match one of the known vaccines listed next (case-insensitive). If you are unsure about a vaccine, exclude it. ' +
          '4) time should be ISO 8601 (e.g., 2024-08-15T10:30:00Z). ' +
          '5) Output ONLY a single JSON object and NO additional text.\n' +
          'Known vaccines (name -> id): ' + JSON.stringify(vaccineContext),
      },
    ];

    // Dynamic import to support CommonJS
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const contents = [
      {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: image_base64,
        },
      },
      ...prompt,
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
    });

    let text = response?.text || '';
    // Trim code fences if present
    text = String(text).trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```json\n?|^```\n?|```$/g, '').trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Failed to parse OCR output as JSON', raw: text });
    }

    console.log("JSON ok, parsed:", parsed)

    // If model returned explicit failure
    if (parsed && parsed.success === false) {
      return res.status(200).json(parsed);
    }

    const reg_no = parsed?.reg_no && String(parsed.reg_no).trim();
    if (!reg_no) {
      return res.status(200).json({ success: false, message: 'reg_no not recognized' });
    }

    console.log("reg no found")

    const name = parsed?.name ? String(parsed.name).trim() : undefined;

    // Support multiple vaccine entries via `vaccines` array; fallback to single entry schema
    let items = Array.isArray(parsed?.vaccines) ? parsed.vaccines : [];
    if (!items.length) {
      // Backward compatibility with single-item schema
      const single = {
        vaccine_name: parsed?.vaccine_name,
        vaccine_id: parsed?.vaccine_id,
        time: parsed?.time,
      };
      if (single.vaccine_name || single.vaccine_id || single.time) items = [single];
    }

    const validEntries = [];
    const invalidEntries = [];
    for (const it of items) {
      let vaccine_name = it?.vaccine_name ? String(it.vaccine_name).trim() : undefined;
      let vaccine_id = it?.vaccine_id ? String(it.vaccine_id).trim() : undefined;
      let time = it?.time ? String(it.time).trim() : undefined;

      if (!vaccine_id && vaccine_name) {
        const id = vaccineMapByName.get(vaccine_name.toLowerCase());
        if (id) vaccine_id = id;
      }
      if (vaccine_id && !vaccine_name) {
        const v = vaccines.find((vx) => String(vx._id) === String(vaccine_id));
        if (v) vaccine_name = v.name;
      }

      if (!vaccine_id || !vaccine_name) {
        invalidEntries.push({ vaccine_name: vaccine_name || null, vaccine_id: vaccine_id || null, time });
        continue;
      }

      let ts = new Date();
      if (time) {
        const t = new Date(time);
        if (!isNaN(t.getTime())) ts = t;
      }
      validEntries.push({ vaccine_id, vaccine_name, time_stamp: ts });
    }

    // Update citizen record
    let citizen = await Citizen.findOne({ reg_no });
    let created = false;
    if (!citizen) {
      // Create a new citizen when reg_no is not found
      citizen = new Citizen({ reg_no });
      created = true;
    }

    // Optionally set/update name if provided
    if (name && (!citizen.name || created)) {
      citizen.name = name;
    }

    if (!Array.isArray(citizen.vaccine_taken)) citizen.vaccine_taken = [];
    // Append all valid entries; naive duplicate handling (skip exact duplicate id+timestamp)
    for (const entry of validEntries) {
      const dup = citizen.vaccine_taken.find(
        (e) => String(e.vaccine_id) === String(entry.vaccine_id) && new Date(e.time_stamp).getTime() === entry.time_stamp.getTime()
      );
      if (!dup) {
        citizen.vaccine_taken.push(entry);
      }
    }
    await citizen.save();

    console.log("citizen saved")

    return res.json({
      success: true,
      message: created ? 'Citizen created and OCR data applied' : 'OCR parsed and citizen updated',
      data: {
        reg_no,
        name: name || citizen.name,
        created,
        updated_count: validEntries.length,
        ignored_count: invalidEntries.length,
        inserted: validEntries.map((v) => ({ vaccine_id: v.vaccine_id, vaccine_name: v.vaccine_name, time: v.time_stamp.toISOString() })),
        ignored: invalidEntries,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to process OCR', error: err?.message });
  }
}

module.exports.ocrVaccinationCard = ocrVaccinationCard;