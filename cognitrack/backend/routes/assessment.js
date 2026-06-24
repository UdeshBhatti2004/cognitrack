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

router.post('/submit', auth, async (req, res) => {
  try {
    const { sessionId, domains } = req.body;

    // Calculate domain scores
    const domainScores = {};
    for (const [key, val] of Object.entries(domains)) {
      domainScores[key] = val;
    }

    // Weighted total score
    const weights = { memory: 0.25, attention: 0.2, processingSpeed: 0.2, visuospatial: 0.2, executiveFunction: 0.15 };
    let totalScore = 0;
    for (const [domain, weight] of Object.entries(weights)) {
      if (domainScores[domain]?.score) totalScore += domainScores[domain].score * weight;
    }

    // Aggregate biomarkers
    const biomarkers = {
      reactionTime: domains.attention?.avgResponseTime || domains.processingSpeed?.avgResponseTime || 0,
      errorRate: Object.values(domains).reduce((acc, d) => acc + (d?.errorRate || 0), 0) / Object.keys(domains).length,
      consistencyScore: Object.values(domains).reduce((acc, d) => acc + (d?.consistency || 0), 0) / Object.keys(domains).length,
      responseVariability: domains.processingSpeed?.avgResponseTime ? Math.abs(domains.processingSpeed.avgResponseTime - 800) / 10 : 0,
    };

    const assessment = await Assessment.create({
      userId: req.user.id,
      sessionId,
      domains: domainScores,
      totalScore: Math.round(totalScore),
      biomarkers,
    });

    res.json({ assessment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const history = await Assessment.find({ userId: req.user.id }).sort({ completedAt: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
