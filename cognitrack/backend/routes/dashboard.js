const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cognitrack_secret_key';

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/stats', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user.id }).sort({ completedAt: 1 });

    if (!assessments.length) return res.json({ isEmpty: true });

    const latest = assessments[assessments.length - 1];
    const previous = assessments.length > 1 ? assessments[assessments.length - 2] : null;

    // Trend data for chart (last 8 sessions)
    const trend = assessments.slice(-8).map(a => ({
      date: a.completedAt,
      totalScore: a.totalScore,
      memory: a.domains?.memory?.score || 0,
      attention: a.domains?.attention?.score || 0,
      processingSpeed: a.domains?.processingSpeed?.score || 0,
      visuospatial: a.domains?.visuospatial?.score || 0,
      executiveFunction: a.domains?.executiveFunction?.score || 0,
    }));

    // Score change vs previous
    const scoreDelta = previous ? latest.totalScore - previous.totalScore : 0;

    res.json({
      totalSessions: assessments.length,
      latestScore: latest.totalScore,
      scoreDelta,
      latestDomains: latest.domains,
      latestBiomarkers: latest.biomarkers,
      trend,
      lastAssessment: latest.completedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
