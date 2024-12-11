const express = require('express');
const router = express.Router();
const db = require('../db');
const calculateDistance  = require('../utils/calculateDistance');

router.post('/addSchool', async (req, res) => {
    try {
        const { name, address, latitude, longitude } = req.body;

        if (!name || !address || !latitude || !longitude) {
          return res.status(400).json({ message: "All fields are required." });
        }

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        const sql =
          "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
        await db
          .promise()
          .query(sql, [name, address, latitude, longitude], (err, result) => {
            if (err) {
              return res.status(500).json({ message: "Failed to add school." });
            }
          });
        res.status(201).json({ message: "School added successfully." });
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
    
});

router.get('/listSchools', async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
          return res
            .status(400)
            .json({ message: "Latitude and longitude are required." });
        }

        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        const sql = "SELECT * FROM schools";
        const results = await db.promise().query(sql);
        const sortedSchools = results[0]
          .map((school) => ({
            ...school,
            distance: calculateDistance(
              latitude,
              longitude,
              school.latitude,
              school.longitude
            ),
          }))
          .sort((a, b) => a.distance - b.distance);

        res.status(200).json(sortedSchools);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
