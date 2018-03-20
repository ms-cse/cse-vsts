 //========= ADAL Input Vars ==========================
 let clientId = '080c1615-76d7-4ba0-97c7-3e57aab018d0';
 let replyUri = window.location.origin;
 let vstsResourceId = '499b84ac-1321-427f-aa17-267ca6975798';
 //=====================================================


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

// Set up ADAL
let authContext = new AuthenticationContext({
  clientId: clientId,
  redirectUri: replyUri,
  postLogoutRedirectUri: replyUri,
  cacheLocation: 'localStorage' // for MS Edge
});

$(document).ready(function () {
      // hack to fix incorrect auth requests
      if(window.location.href.indexOf('null') !== -1 && !authContext.getCachedUser() ) {
        authContext.login();
    }

    // listen to incoming auth requests
    if (authContext.isCallback(window.location.hash)) {
        authContext.handleWindowCallback();
        let err = authContext.getLoginError();
        if (err) {
            console.log('AUTH ERROR:\n\n' + err);
        }
    } else {
        // if logged in, get access token and make an API request
        let user = authContext.getCachedUser();
        console.log('trying to get usersss', user);
        if (user) {
            $('#activityForm').show();
            $('#loginBtn').html('Click here to logout');
            $('#owner').val(user.profile.name + ' <' + user.userName + '>');

            // Get an access token to VSTS
            authContext.acquireToken(vstsResourceId, function (error, token) {
                console.log(error, token);
                authToken = token;
             });
        }
        else {
            console.log('couldnt get user');
        }
    }
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
  getActivities(authToken);

});

function getEndDate(tasks) {
    var lastEndDate = Date.now();
    if (tasks.length > 0) {
  lastEndDate = tasks[tasks.length - 1].endDate;
    }

    return lastEndDate;
}

function getActivities(authToken) {
  $.post('/activities/query', {
    token: authToken
  }).done((activityData) => {
    console.log(activityData)

  }).fail(() => {
    console.log('Failed to get activities')
  });
}