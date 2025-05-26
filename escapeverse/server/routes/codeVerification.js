const express = require('express');
const router = express.Router();

router.post('/verify-code', async (req, res) => {
  const { challengeId } = req.body;

  try {
    // Mock verification that always passes
    const mockResponse = {
      success: true,
      message: `Challenge ${challengeId} completed successfully!`,
      details: {
        passed: true,
        executionTime: '0.05s',
        memory: '2.3MB',
        feedback: 'Great job! Your solution is correct.'
      }
    };

    // Add artificial delay to simulate processing (500ms-1500ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    res.json(mockResponse);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying code',
      error: error.message
    });
  }
});

module.exports = router;