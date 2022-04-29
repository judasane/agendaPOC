import Agenda from "agenda";
import dayjs from "dayjs";
import settings from "../../lib/settings";

const jobQueue = new Agenda({
    db: {
      address: settings.databases.mongodb.uri,
      collection: "jobs",
    },
  });

jobQueue.start();

export default (app) => {
  app.use("/jobs", (req, res) => {
    const jobType = req?.query?.jobType;
    const allowedJobs = Object.keys(jobQueue._definitions);
    const jobToCancel = req?.query?.jobToCancel;

    console.log("run")

    

    if(jobToCancel){
        jobQueue.cancel({name:jobToCancel})
        console.log(`Job with name ${jobToCancel} was cancelled`)
    } else{
          if (jobType === "periodical") {
              const seconds = req?.query?.seconds
              const jobName = req?.query?.jobName
              jobQueue.define(jobName, async (job) => {
                const data = job?.attrs?.data;
                const seconds = data.seconds;
                console.log(
                  `${jobName} is running every ${seconds} seconds. This is the data that was sent:`
                );
                console.log(data);
              });

              
              jobQueue.every(
                  `${seconds} seconds`,
                jobName,
                {
                  ...req.body,
                  ...req.query
              }
              );
            }
      

    }

    

    res.send("Job added to queue!");
  });
};