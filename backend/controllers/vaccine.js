const Vaccine = require('../models/vaccine');

async function addVaccine(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'name and description are required' });
    }
    const exists = await Vaccine.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: 'Vaccine with this name already exists' });
    }
    const created = await Vaccine.create({ name, description });
    return res.status(201).json({ id: created._id, name: created.name, description: created.description });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add vaccine' });
  }
}

async function updateVaccine(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name && !description) {
      return res.status(400).json({ message: 'Provide name or description to update' });
    }
    const doc = await Vaccine.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Vaccine not found' });
    }
    if (name) doc.name = name;
    if (description) doc.description = description;
    await doc.save();
    return res.json({ id: doc._id, name: doc.name, description: doc.description });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update vaccine' });
  }
}

module.exports = { addVaccine, updateVaccine };

async function listVaccines(req, res) {
  try {
    const docs = await Vaccine.find({});
    const result = docs.map((d) => ({ id: d._id, name: d.name, description: d.description }));
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch vaccines' });
  }
}

module.exports.listVaccines = listVaccines;