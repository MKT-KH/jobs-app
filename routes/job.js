const express = require('express');

const router = express.Router();

const jobControllers = require('../controllers/job');
const isAuth = require('../middleware /is-auth');

router.get('/', isAuth, jobControllers.getJobs);
router.get('/:jobId', isAuth, jobControllers.getJob);
router.post('/', isAuth, jobControllers.addJob);
router.patch('/:jobId', isAuth, jobControllers.editJob);
router.delete('/:jobId', isAuth, jobControllers.deleteJob);


module.exports = router;