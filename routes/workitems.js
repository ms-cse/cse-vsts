let application = require('../application');
let express = require('express');
let router = express.Router();
let vsts        = require('vso-node-api');

let creds = vsts.getPersonalAccessTokenHandler(application.authToken);
let connection = new vsts.WebApi(application.collectionUrl, creds);
let vstsWI = connection.getWorkItemTrackingApi();

router.get('/:workItemId', (req, res) => {
    vstsWI.getWorkItem(req.params.workItemId).then(function(workItem) {
        // console.log(res);
        if(workItem && workItem.fields) {
            if(workItem.fields['System.WorkItemType'] == "Project or Engagement") {
                res.json(workItem.fields)
            }
            else {
                res.status(501).json({ message: 'item not a project or engagement' });
            }
        }
        else {
            res.status(501).json({ message: 'no results found' });
        }
    }) ;
});

router.post('/new', (req, res) => {

    if (req.body && req.body.projectId && req.body.name && req.body.type && req.body.duration && req.body.dateFrom) {
        let json = [{
            "op": "add",
            "path": "/fields/System.Title",
            "value": req.body.name
        }, {
            "op": "add",
            "path": "/fields/CSEngineering.ActivityType",
            "value": req.body.type
        }, {
            "op": "add",
            "path": "/fields/CSEngineering.ActivityStartDate",
            "value": "2017-12-02T00:00:00Z"
        }, {
            "op": "add",
            "path": "/fields/CSEngineering.ActivityDuration",
            "value": req.body.duration
        }, {
            "op": "add",
            "path": "/fields/System.AreaPath",
            "value": req.body.areapath
        }, {
            "op": "add",
            "path": "/fields/CSEngineering.CountrySelection",
            "value": req.body.country
        }, {
            "op": "add",
            "path": "/fields/CSEngineering.City",
            "value": req.body.city
        }, {
            "op": "add",
            "path": "/fields/CSEngineering.ShortDescription",
            "value": req.body.description
        }, {
            "op": "add",
            "path": "/fields/CSEngineering.TechnicalGoal",
            "value": req.body.goal
        }, {
            "op": "add",
            "path": "/fields/System.Tags",
            "value": req.body.tags.split(',').join('; ')
        }, {
            "op": "add",
            "path": "/relations/-",
            "value": {
              "rel": "System.LinkTypes.Hierarchy-Reverse",
              "url": application.collectionUrl + "/_apis/wit/workItems/" + req.body.projectId,
            }
        }];

        vstsWI.createWorkItem(null, json, application.projectName, application.WIType).then(function(workItem) {
            if(workItem) {
                res.json(workItem)
            }
            else {
                res.status(501).json({ message: 'something went wrong' });
            }
        })
    }
});


module.exports = router;
