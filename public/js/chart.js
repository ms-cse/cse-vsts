// @todo populate tasks from a query.
var tasks = [
{
    "startDate":new Date("Apr 09 01:36:45 EST 2018"),
    "endDate":new Date("Apr 12 02:36:45 EST 2018"),
    "taskName":"Chris",
    "status":"Hack"
},
{
    "startDate":new Date("Apr 09 01:36:45 EST 2018"),
    "endDate":new Date("Apr 12 02:36:45 EST 2018"),
    "taskName":"Carlos",
    "status":"Hack"
},
{
    "startDate":new Date("Apr 19 01:36:45 EST 2018"),
    "endDate":new Date("Apr 24 02:36:45 EST 2018"),
    "taskName":"Campbell",
    "status":"Administration"
},
{
    "startDate":new Date("Apr 24 01:36:45 EST 2018"),
    "endDate":new Date("Apr 29 02:36:45 EST 2018"),
    "taskName":"Campbell",
    "status":"Sharing"
}
];

$(document).ready(function () {
  // Sort tasks based on startDate, then endDate.
  tasks.sort(function(a, b) {
      return a.endDate - b.endDate;
  });
  tasks.sort(function(a, b) {
      return a.startDate - b.startDate;
  });
  console.log(tasks);
  // Find the start and end date for the chart.
  var maxDate = tasks[tasks.length - 1].endDate;
  var minDate = tasks[0].startDate;

  var format = "Wk %W.%w";

  var taskStatus = {
      "Sharing" : "bar",
      "Administration" : "bar-failed",
      "Hack" : "bar-running"
  };

  var taskNames = [ "Campbell", "Claus", "Carlos", "Chris" ];
  var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format).height(450).width(800);


  console.log(gantt);
  gantt(tasks);

});

function getEndDate(tasks) {
    var lastEndDate = Date.now();
    if (tasks.length > 0) {
  lastEndDate = tasks[tasks.length - 1].endDate;
    }

    return lastEndDate;
}
