const mongoose = require('mongoose');

const domainResultSchema = new mongoose.Schema({
  score: Number,           // 0-100
  accuracy: Number,        // percentage
  avgResponseTime: Number, // ms
  completionTime: Number,  // ms
  errorRate: Number,       // percentage
  consistency: Number,     // 0-100
  missedTargets: Number,
  falseClicks: Number,
  immediateRecall: Number,
  delayedRecall: Number,
  incorrectWords: Number,
  itemsPerMinute: Number,
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
  totalScore: { type: Number },           // 0-100
  domains: {
    memory: domainResultSchema,
    attention: domainResultSchema,
    visuospatial: domainResultSchema,
    processingSpeed: domainResultSchema,
    executiveFunction: domainResultSchema,
  },
  biomarkers: {
    reactionTime: Number,
    errorRate: Number,
    consistencyScore: Number,
    responseVariability: Number,
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
