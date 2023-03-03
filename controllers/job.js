const Job = require('../models/job');
const io = require('../socket');

exports.getJobs = (req, res, next) => {
    Job.find().then(jobs => {
        if (jobs.length < 1) {
            const error = new Error(' no jobs found');
            // res.status(404).json({
            //     message: 'no jobs found'
            // })
            error.status = 404;
            throw error;
        }
        res.status(200).json({
            message: 'jobs found',
            jobs: jobs
        })
    }).catch(err => {
        if (!err.sataus) {
            err.sataus = 500
        }
        next(err)
    })
};

exports.getJob = (req, res, next) => {
    const jobId = req.params.jobId;
    Job.findById(jobId).then(job => {
        if (!job) {
            const error = new Error('job not found');
            error.sataus = 404;
            throw error;
        }
        res.status(200).json({
            job: job,
            message: 'job found'
        })
    }).catch(err => {
        err.status = 500;
        next(err)
    })
};

exports.addJob = (req, res, next) => {
    const company = req.body.company;
    const status = req.body.status;
    const position = req.body.position;
    const job = new Job({
        company: company,
        position: position,
        status: status,
        creator: req.userId
    });
    job.save()
        .then(job => {
            const socket = io.getIO();
            socket.emit('posts', { action: 'create', job: job }); //send message to all concted users 
            res.status(201).json({
                message: 'job add succefully',
                job: job
            })
        })
        .catch(err => {
            err.sataus = 500;
            next(err);
        });
};

exports.editJob = (req, res, next) => {
    const jobId = req.params.jobId;
    const company = req.body.company;
    const status = req.body.status;
    const position = req.body.postion;
    Job.findById(jobId).then(job => {
        if (!job) {
            const error = new Error('job not found');
            error.sataus = 404;
            throw error;
        }
        if (job.creator.toString() !== req.userId) {
            const error = new Error('not authorized');
            error.status = 401;
            throw error;
        }
        job.company = company;
        job.position = position;
        job.status = status;
        // job.creator = req.userId;
        return job.save();
    }).then(job => {
        io.getIO().emit('posts', { action: 'edit', job: job })
        res.status(200).send({
            message: 'job edit succefully',
            job: job
        })
    }).catch(err => {
        if (!err.status) {
            err.sataus = 500;
        }
        next(err);
    })

};

exports.deleteJob = (req, res, next) => {
    const jobId = req.params.jobId;
    Job.findById(jobId).then(job => {
            if (!job) {
                const error = new Error('job not found');
                error.sataus = 404;
                throw error;
            }
            if (job.creator.toString() !== req.userId) {
                const error = new Error('not authorized');
                error.status = 401;
                throw error;
            }
            return Job.findByIdAndRemove(jobId)
        }).then(() => {
            io.getIO().emit('posts', { action: 'delete', jobId: jobId })
            res.status(200).json({
                message: "job deleted succefully",
            })
        })
        .catch(err => {
            if (!err.status) {
                err.sataus = 500;
            }

            next(err);
        })
}